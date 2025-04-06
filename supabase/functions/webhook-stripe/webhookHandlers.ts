
import { ServiceClients } from "./stripeClient.ts";
import { updateSubscriptionRecord, updateSubscriptionStatus } from "./subscriptionService.ts";

// Handle checkout.session.completed event
export const handleCheckoutSessionCompleted = async (
  { supabase, stripe }: ServiceClients, 
  session: any
) => {
  console.log("Processing completed checkout session:", session.id);
  
  // Get the user_id from metadata
  const userId = session.metadata?.user_id;
  const isTrial = session.metadata?.is_trial === 'true';
  
  if (!userId) {
    console.error("Missing user ID in session metadata");
    throw new Error("Missing user ID in session metadata");
  }
  
  console.log("Session metadata:", { userId, isTrial });
  
  // Get subscription ID from the session
  const subscriptionId = session.subscription;
  if (!subscriptionId) {
    console.error("No subscription ID found in session");
    throw new Error("No subscription ID found in session");
  }
  
  // Retrieve the subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  console.log("Retrieved subscription:", subscriptionId, "status:", subscription.status);
  
  // Update subscription status in database
  let updateData = {
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: session.customer,
    updated_at: new Date().toISOString()
  };
  
  if (isTrial || subscription.status === 'trialing') {
    // For free trial, enable all agents
    console.log("Processing free trial activation");
    
    updateData = { 
      ...updateData,
      markus: true, 
      kara: true, 
      connor: true, 
      chloe: true, 
      luther: true, 
      all_in_one: true,
      status: 'trial',
      trial_start: new Date(subscription.trial_start * 1000).toISOString(),
      trial_end: new Date(subscription.trial_end * 1000).toISOString()
    };
  } else if (subscription.status === 'active') {
    // For regular subscription, enable all agents
    updateData = { 
      ...updateData,
      markus: true, 
      kara: true, 
      connor: true, 
      chloe: true, 
      luther: true, 
      all_in_one: true,
      status: 'active'
    };
  }
  
  console.log("Updating subscription with data:", updateData);
  
  // Update or create subscription record
  return updateSubscriptionRecord(supabase, userId, updateData);
};

// Handle subscription update events
export const handleSubscriptionUpdate = async (
  { supabase, stripe }: ServiceClients, 
  subscription: any
) => {
  console.log(`Processing subscription update for:`, subscription.id);
  
  // Get the customer ID
  const customerId = subscription.customer;
  
  // Find the user by the Stripe customer ID
  const { data: userSubscription, error: fetchError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
    
  if (fetchError) {
    console.error("Error fetching subscription by customer ID:", fetchError);
    throw new Error(`Error fetching subscription: ${fetchError.message}`);
  }
  
  if (!userSubscription) {
    console.log("No subscription found for customer:", customerId);
    // Try to find the user via metadata as a fallback
    if (subscription.metadata && subscription.metadata.user_id) {
      console.log("Found user_id in metadata, trying to find subscription by user_id");
      const { data: userSubscriptionByUserId, error: userIdError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", subscription.metadata.user_id)
        .maybeSingle();
      
      if (userIdError) {
        console.error("Error fetching subscription by user ID:", userIdError);
        return;
      }
      
      if (!userSubscriptionByUserId) {
        console.log("No subscription found for user ID:", subscription.metadata.user_id);
        return;
      }
      
      // Update the found subscription
      await updateSubscriptionStatus(supabase, userSubscriptionByUserId.id, subscription);
      return;
    }
    return;
  }
  
  // Update the subscription status
  await updateSubscriptionStatus(supabase, userSubscription.id, subscription);
};

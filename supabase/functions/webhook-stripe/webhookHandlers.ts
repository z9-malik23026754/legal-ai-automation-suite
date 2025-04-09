
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
  
  // CRITICAL: Always enable ALL agents when payment succeeds OR trial starts
  // This guarantees users have access regardless of subscription status
  const updateData = {
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: session.customer,
    markus: true, 
    kara: true, 
    jerry: true, // Make sure jerry is included
    connor: true, 
    chloe: true, 
    luther: true, 
    all_in_one: true,
    status: isTrial ? 'trial' : 'active',
    updated_at: new Date().toISOString()
  };
  
  // If it's a trial, add trial dates
  if (isTrial || subscription.status === 'trialing') {
    updateData.status = 'trial';
    updateData.trial_start = subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null;
    updateData.trial_end = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null;
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
      
      // CRITICAL FIX: ALWAYS enable all agents regardless of status
      // This ensures maximum reliability for user access
      const updateData = {
        status: subscription.status === 'trialing' ? 'trial' : subscription.status,
        // Always set all agents to true
        markus: true,
        kara: true,
        jerry: true, // Make sure jerry is included
        connor: true,
        chloe: true,
        luther: true,
        all_in_one: true,
        updated_at: new Date().toISOString()
      };
      
      // If it's a trial, add trial dates
      if (subscription.status === 'trialing') {
        updateData.trial_start = subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null;
        updateData.trial_end = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null;
      }
      
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update(updateData)
        .eq("id", userSubscriptionByUserId.id);
        
      if (updateError) {
        console.error("Error updating subscription status:", updateError);
      }
      return;
    }
    return;
  }
  
  // CRITICAL FIX: ALWAYS enable all agents for reliability
  // This ensures users never lose access unexpectedly
  const updateData = {
    status: subscription.status === 'trialing' ? 'trial' : subscription.status,
    // Always set all agents to true, even for non-trial subscriptions
    markus: true,
    kara: true,
    jerry: true, // Make sure jerry is included
    connor: true,
    chloe: true,
    luther: true,
    all_in_one: true,
    updated_at: new Date().toISOString()
  };
  
  // If it's a trial, add trial dates
  if (subscription.status === 'trialing') {
    updateData.trial_start = subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null;
    updateData.trial_end = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null;
  }
  
  const { error: updateError } = await supabase
    .from("subscriptions")
    .update(updateData)
    .eq("id", userSubscription.id);
    
  if (updateError) {
    console.error("Error updating subscription status:", updateError);
  }
};

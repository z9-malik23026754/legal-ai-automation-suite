
import Stripe from "https://esm.sh/stripe@14.21.0";
import { prepareAgentUpdateData, prepareFrontendSubscription } from "./subscriptionData.ts";

// Initialize Stripe client
export const initStripeClient = () => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  
  return new Stripe(stripeKey, {
    apiVersion: "2023-10-16",
  });
};

// Check Stripe subscription status and update database accordingly
export const checkStripeSubscription = async (stripe: any, supabase: any, subscription: any, userId: string) => {
  if (!subscription?.stripe_subscription_id) return subscription;
  
  try {
    console.log("Checking Stripe subscription:", subscription.stripe_subscription_id);
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
    console.log("Stripe subscription status:", stripeSubscription.status);
    
    // Handle trial subscriptions
    if (stripeSubscription.status === 'trialing') {
      return handleTrialSubscription(supabase, subscription, stripeSubscription, userId);
    }
    
    // Handle active subscriptions
    if (stripeSubscription.status === 'active') {
      return handleActiveSubscription(supabase, subscription, userId);
    }
    
    // Handle expired subscriptions
    if (stripeSubscription.status !== "active" && stripeSubscription.status !== "trialing" && 
        (subscription.status === 'active' || subscription.status === 'trial')) {
      return handleExpiredSubscription(supabase, subscription, stripeSubscription, userId);
    }
    
    return subscription;
  } catch (stripeError) {
    console.error("Error checking Stripe subscription:", stripeError);
    return subscription;
  }
};

// Handle trial subscriptions
const handleTrialSubscription = async (supabase: any, subscription: any, stripeSubscription: any, userId: string) => {
  console.log("User has an active trial - unlocking all agents");
  
  // Prepare update data
  const updateData = prepareAgentUpdateData(subscription, {
    status: 'trial',
    updated_at: new Date().toISOString(),
    trial_start: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000).toISOString() : undefined,
    trial_end: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : undefined
  });
  
  const { error: updateError } = await supabase
    .from("subscriptions")
    .update(updateData)
    .eq("user_id", userId);
    
  if (updateError) {
    console.error("Error updating trial subscription:", updateError);
  }
    
  // Return the subscription with trial data
  const frontendSubscription = prepareFrontendSubscription(subscription, 'trial', stripeSubscription);
  return frontendSubscription;
};

// Handle active subscriptions
const handleActiveSubscription = async (supabase: any, subscription: any, userId: string) => {
  console.log("User has an active subscription - ensuring all agents are accessible");
  
  // Prepare update data to unlock all agents
  const updateData = prepareAgentUpdateData(subscription, {
    status: 'active',
    updated_at: new Date().toISOString()
  });
  
  const { error: updateActiveError } = await supabase
    .from("subscriptions")
    .update(updateData)
    .eq("user_id", userId);
    
  if (updateActiveError) {
    console.error("Error updating active subscription:", updateActiveError);
  }
  
  return { ...subscription, status: 'active' };
};

// Handle expired subscriptions
const handleExpiredSubscription = async (supabase: any, subscription: any, stripeSubscription: any, userId: string) => {
  console.log("Updating expired subscription status");
  
  // Prepare update data to lock all agents
  const updateData = prepareAgentUpdateData(subscription, {
    status: stripeSubscription.status,
    updated_at: new Date().toISOString()
  }, false); // false means disable all agents
  
  await supabase
    .from("subscriptions")
    .update(updateData)
    .eq("user_id", userId);
    
  return {
    markus: false,
    kara: false,
    connor: false,
    chloe: false,
    luther: false,
    allInOne: false,
    status: stripeSubscription.status
  };
};

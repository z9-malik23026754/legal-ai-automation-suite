
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client
const initSupabaseClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Get user from auth header
const getUserFromAuth = async (supabase, authHeader) => {
  if (!authHeader) {
    throw new Error("No authorization header");
  }
  
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  
  if (userError || !user) {
    throw new Error("Invalid user token");
  }
  
  return user;
};

// Get user's subscription from database
const getUserSubscription = async (supabase, userId) => {
  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();
    
  if (subError && subError.code !== 'PGRST116') { // Ignore "no rows returned" error
    console.error("Error fetching subscription:", subError);
    return null;
  }
  
  return subscription;
};

// Initialize Stripe client
const initStripeClient = () => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  
  return new Stripe(stripeKey, {
    apiVersion: "2023-10-16",
  });
};

// Check Stripe subscription status and update database accordingly
const checkStripeSubscription = async (stripe, supabase, subscription, userId) => {
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
const handleTrialSubscription = async (supabase, subscription, stripeSubscription, userId) => {
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
const handleActiveSubscription = async (supabase, subscription, userId) => {
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
const handleExpiredSubscription = async (supabase, subscription, stripeSubscription, userId) => {
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

// Ensure trial status in database has all agents enabled
const ensureTrialHasAllAgents = async (supabase, subscription, userId) => {
  if (subscription?.status !== 'trial') return subscription;
  
  console.log("User has trial status in database - ensuring all agents are unlocked");
  
  // Check which agents need to be updated
  let needsUpdate = false;
  let updateData = { updated_at: new Date().toISOString() };
  
  // Only update fields that exist and need to be updated
  if ('markus' in subscription && !subscription.markus) {
    updateData.markus = true;
    needsUpdate = true;
  }
  if ('kara' in subscription && !subscription.kara) {
    updateData.kara = true;
    needsUpdate = true;
  }
  if ('connor' in subscription && !subscription.connor) {
    updateData.connor = true;
    needsUpdate = true;
  }
  if ('chloe' in subscription && !subscription.chloe) {
    updateData.chloe = true;
    needsUpdate = true;
  }
  if ('luther' in subscription && !subscription.luther) {
    updateData.luther = true;
    needsUpdate = true;
  }
  if ('all_in_one' in subscription && !subscription.all_in_one) {
    updateData.all_in_one = true;
    needsUpdate = true;
  }
  
  if (needsUpdate) {
    await supabase
      .from("subscriptions")
      .update(updateData)
      .eq("user_id", userId);
  }
  
  return subscription;
};

// Prepare agent update data with enabled/disabled status
const prepareAgentUpdateData = (subscription, baseData = {}, enableAgents = true) => {
  const updateData = { ...baseData };
  
  // Only add fields if they exist in the subscription table
  if ('markus' in subscription) updateData.markus = enableAgents;
  if ('kara' in subscription) updateData.kara = enableAgents;
  if ('connor' in subscription) updateData.connor = enableAgents;
  if ('chloe' in subscription) updateData.chloe = enableAgents;
  if ('luther' in subscription) updateData.luther = enableAgents;
  if ('all_in_one' in subscription) updateData.all_in_one = enableAgents;
  
  return updateData;
};

// Prepare subscription object for frontend use
const prepareFrontendSubscription = (subscription, status, stripeSubscription = null) => {
  const frontendSub = {
    markus: true,
    kara: true,
    connor: true,
    chloe: true,
    luther: true,
    allInOne: true,
    status: status
  };
  
  // Add trial dates if available from Stripe
  if (stripeSubscription) {
    if (stripeSubscription.trial_start && 'trial_start' in subscription) {
      frontendSub.trialStart = new Date(stripeSubscription.trial_start * 1000).toISOString();
    }
    
    if (stripeSubscription.trial_end && 'trial_end' in subscription) {
      frontendSub.trialEnd = new Date(stripeSubscription.trial_end * 1000).toISOString();
    }
  }
  
  return frontendSub;
};

// Convert DB subscription to frontend format
const convertToFrontendSubscription = (subscription) => {
  if (!subscription) return null;
  
  return {
    ...subscription,
    allInOne: subscription.all_in_one,
    trialStart: subscription.trial_start,
    trialEnd: subscription.trial_end
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = initSupabaseClient();
    
    // Get the user from the auth header
    const authHeader = req.headers.get("Authorization");
    const user = await getUserFromAuth(supabase, authHeader);
    
    console.log("Checking subscription for user:", user.id);
    
    // Get user's subscription from database
    let subscription = await getUserSubscription(supabase, user.id);
    console.log("Found subscription from database:", subscription);
    
    // Check Stripe subscription if available
    if (subscription?.stripe_subscription_id) {
      const stripe = initStripeClient();
      subscription = await checkStripeSubscription(stripe, supabase, subscription, user.id);
    }
    
    // Ensure trial subscriptions have all agents enabled
    if (subscription) {
      subscription = await ensureTrialHasAllAgents(supabase, subscription, user.id);
    }
    
    // Prepare the final response
    const frontendSubscription = subscription ? convertToFrontendSubscription(subscription) : null;
    
    return new Response(JSON.stringify({ subscription: frontendSubscription }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

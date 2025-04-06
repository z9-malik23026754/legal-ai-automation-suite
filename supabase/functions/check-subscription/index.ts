
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getUserFromAuth, initSupabaseClient } from "./auth.ts";
import { getUserSubscription, ensureTrialHasAllAgents, convertToFrontendSubscription } from "./subscriptionData.ts";
import { checkStripeSubscription, initStripeClient } from "./stripeIntegration.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

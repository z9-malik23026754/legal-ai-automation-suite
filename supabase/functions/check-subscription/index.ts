
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get the user from the auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid user token");
    }
    
    console.log("Checking subscription for user:", user.id);
    
    // Get user's subscription details from database
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();
      
    if (subError && subError.code !== 'PGRST116') { // Ignore "no rows returned" error
      console.error("Error fetching subscription:", subError);
      return new Response(JSON.stringify({ subscription: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    console.log("Found subscription from database:", subscription);
    
    // If there's a Stripe subscription ID, verify its status with Stripe
    if (subscription?.stripe_subscription_id) {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeKey) {
        throw new Error("STRIPE_SECRET_KEY is not set");
      }
      
      const stripe = new Stripe(stripeKey, {
        apiVersion: "2023-10-16",
      });
      
      try {
        console.log("Checking Stripe subscription:", subscription.stripe_subscription_id);
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
        console.log("Stripe subscription status:", stripeSubscription.status);
        
        // For trial subscriptions, ensure all agents are accessible
        if (stripeSubscription.status === 'trialing') {
          console.log("User has an active trial - unlocking all agents");
          
          // Update database with trial status
          const { error: updateError } = await supabase
            .from("subscriptions")
            .update({
              status: 'trial',
              markus: true,
              kara: true,
              connor: true,
              chloe: true,
              luther: true,
              all_in_one: true,
              trial_start: new Date(stripeSubscription.trial_start * 1000).toISOString(),
              trial_end: new Date(stripeSubscription.trial_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq("user_id", user.id);
            
          if (updateError) {
            console.error("Error updating trial subscription:", updateError);
          }
            
          // Return the updated subscription
          return new Response(JSON.stringify({ 
            subscription: {
              markus: true,
              kara: true,
              connor: true,
              chloe: true,
              luther: true,
              allInOne: true,
              status: 'trial',
              trialStart: new Date(stripeSubscription.trial_start * 1000).toISOString(),
              trialEnd: new Date(stripeSubscription.trial_end * 1000).toISOString()
            }
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
        
        // If subscription is active, ensure all agents are accessible
        if (stripeSubscription.status === 'active') {
          console.log("User has an active subscription - checking plan-specific access");
          
          // For simplicity, we're granting access to all agents with an active subscription
          // In a real app, you would check which specific plan they purchased
          const { error: updateActiveError } = await supabase
            .from("subscriptions")
            .update({
              status: 'active',
              // Enable all agents or specific ones based on the plan
              updated_at: new Date().toISOString()
            })
            .eq("user_id", user.id);
            
          if (updateActiveError) {
            console.error("Error updating active subscription:", updateActiveError);
          }
        }
        
        // If subscription is no longer active, update the database
        if (stripeSubscription.status !== "active" && stripeSubscription.status !== "trialing" && 
            (subscription.status === 'active' || subscription.status === 'trial')) {
          console.log("Updating expired subscription status");
          
          await supabase
            .from("subscriptions")
            .update({
              markus: false,
              kara: false,
              connor: false,
              chloe: false,
              luther: false, 
              all_in_one: false,
              status: stripeSubscription.status,
              updated_at: new Date().toISOString()
            })
            .eq("user_id", user.id);
            
          return new Response(JSON.stringify({ 
            subscription: {
              markus: false,
              kara: false,
              connor: false,
              chloe: false,
              luther: false,
              allInOne: false,
              status: stripeSubscription.status
            }
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      } catch (stripeError) {
        console.error("Error checking Stripe subscription:", stripeError);
      }
    }
    
    // If the subscription already has trial status in our database, ensure all agents are enabled
    if (subscription?.status === 'trial') {
      console.log("User has trial status in database - ensuring all agents are unlocked");
      
      // Ensure all agents are enabled
      if (!subscription.markus || !subscription.kara || !subscription.connor || 
          !subscription.chloe || !subscription.luther || !subscription.all_in_one) {
        
        await supabase
          .from("subscriptions")
          .update({
            markus: true,
            kara: true,
            connor: true,
            chloe: true,
            luther: true,
            all_in_one: true,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id);
          
        return new Response(JSON.stringify({ 
          subscription: {
            ...subscription,
            markus: true,
            kara: true,
            connor: true,
            chloe: true,
            luther: true,
            allInOne: true,
            status: 'trial'
          }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }
    
    // Convert database field all_in_one to camelCase allInOne for frontend
    if (subscription) {
      subscription.allInOne = subscription.all_in_one;
      
      // Convert trial_start and trial_end to camelCase
      if (subscription.trial_start) {
        subscription.trialStart = subscription.trial_start;
      }
      if (subscription.trial_end) {
        subscription.trialEnd = subscription.trial_end;
      }
    }
    
    return new Response(JSON.stringify({ subscription }), {
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

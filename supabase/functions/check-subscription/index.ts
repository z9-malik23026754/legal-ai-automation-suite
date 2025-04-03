
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
    
    // Get user's subscription details from database
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();
      
    if (subError) {
      console.error("Error fetching subscription:", subError);
      return new Response(JSON.stringify({ subscription: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // If there's a Stripe subscription ID, verify it's status with Stripe
    if (subscription?.stripe_subscription_id) {
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2023-10-16",
      });
      
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
        
        // Update local subscription status based on Stripe's status
        if (stripeSubscription.status !== "active") {
          await supabase
            .from("subscriptions")
            .update({
              markus: false,
              kara: false,
              connor: false,
              all_in_one: false
            })
            .eq("user_id", user.id);
            
          return new Response(JSON.stringify({ 
            subscription: {
              markus: false,
              kara: false,
              connor: false,
              all_in_one: false
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

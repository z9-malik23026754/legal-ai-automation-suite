
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
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("session_id");
    
    if (!sessionId) {
      throw new Error("No session ID provided");
    }
    
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Check if the payment was successful
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }
    
    // Get plan and user info from metadata
    const planId = session.metadata?.plan_id;
    const userId = session.metadata?.user_id;
    
    if (!planId || !userId) {
      throw new Error("Missing plan or user information");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Update subscription status in database
    let updateData = {};
    
    switch (planId) {
      case 'markus':
        updateData = { markus: true };
        break;
      case 'kara':
        updateData = { kara: true };
        break;
      case 'connor':
        updateData = { connor: true };
        break;
      case 'all-in-one':
        updateData = { markus: true, kara: true, connor: true, all_in_one: true };
        break;
      default:
        throw new Error("Invalid plan ID");
    }
    
    // If this is a subscription (not one-time payment)
    if (session.mode === 'subscription' && session.subscription) {
      updateData = {
        ...updateData,
        stripe_subscription_id: session.subscription
      };
    }
    
    // Update the subscription
    const { error } = await supabase
      .from("subscriptions")
      .update(updateData)
      .eq("user_id", userId);
      
    if (error) {
      throw new Error(`Error updating subscription: ${error.message}`);
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Payment processed successfully",
      plan: planId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("Payment verification error:", error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

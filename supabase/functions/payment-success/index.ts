
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("Payment success function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("session_id");
    
    console.log("Processing session:", sessionId);
    
    if (!sessionId) {
      console.error("No session ID provided");
      return new Response(JSON.stringify({
        success: false,
        error: "No session ID provided"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY is not set");
      return new Response(JSON.stringify({
        success: false,
        error: "Stripe configuration error"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });
    
    // Retrieve the session
    console.log("Retrieving Stripe session");
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      console.error("Error retrieving session:", error);
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid session ID"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Check if the payment was successful
    if (session.payment_status !== "paid") {
      console.error(`Payment not completed. Status: ${session.payment_status}`);
      return new Response(JSON.stringify({
        success: false,
        error: `Payment not completed. Status: ${session.payment_status}`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Get plan and user info from metadata
    const planId = session.metadata?.plan_id;
    const userId = session.metadata?.user_id;
    
    console.log("Session metadata:", { planId, userId });
    
    if (!planId || !userId) {
      console.error("Missing plan or user information");
      return new Response(JSON.stringify({
        success: false,
        error: "Missing plan or user information in session"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      return new Response(JSON.stringify({
        success: false,
        error: "Database configuration error"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    console.log("Initializing Supabase client");
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
      case 'chloe':
        updateData = { chloe: true };
        break;
      case 'all-in-one':
        updateData = { markus: true, kara: true, connor: true, chloe: true, all_in_one: true };
        break;
      default:
        console.error("Invalid plan ID:", planId);
        return new Response(JSON.stringify({
          success: false,
          error: "Invalid plan ID"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
    }
    
    console.log("Updating subscription with data:", updateData);
    
    // Retrieve existing subscription record or create a new one
    const { data: existingSubscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
      
    if (fetchError) {
      console.error("Error fetching subscription:", fetchError);
    }

    console.log("Existing subscription:", existingSubscription);
    
    let dbOperation;
    
    if (existingSubscription) {
      // Update existing subscription
      console.log("Updating existing subscription");
      dbOperation = supabase
        .from("subscriptions")
        .update({
          ...updateData,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);
    } else {
      // Create new subscription
      console.log("Creating new subscription");
      dbOperation = supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          ...updateData,
          status: 'active'
        });
    }
    
    const { error } = await dbOperation;
      
    if (error) {
      console.error("Error updating subscription:", error);
      return new Response(JSON.stringify({
        success: false,
        error: `Database error: ${error.message}`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    console.log("Successfully processed payment for plan:", planId);
    
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
      error: error.message || "Unknown error"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

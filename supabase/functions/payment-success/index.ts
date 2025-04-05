
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Stripe client
function initializeStripe() {
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    console.error("STRIPE_SECRET_KEY is not set");
    throw new Error("Stripe configuration error");
  }
  
  return new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
  });
}

// Initialize Supabase client
function initializeSupabase() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables");
    throw new Error("Database configuration error");
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Retrieve the Stripe session
async function retrieveStripeSession(stripe: Stripe, sessionId: string) {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    console.error("Error retrieving session:", error);
    throw new Error("Invalid session ID");
  }
}

// Get plan-specific subscription data
function getSubscriptionData(planId: string) {
  switch (planId) {
    case 'markus':
      return { markus: true };
    case 'kara':
      return { kara: true };
    case 'connor':
      return { connor: true };
    case 'chloe':
      return { chloe: true };
    case 'luther':
      return { luther: true };
    case 'all-in-one':
      return { 
        markus: true, 
        kara: true, 
        connor: true, 
        chloe: true, 
        luther: true, 
        all_in_one: true 
      };
    default:
      console.error("Invalid plan ID:", planId);
      throw new Error("Invalid plan ID");
  }
}

// Update or create subscription record in database
async function updateSubscriptionRecord(supabase: any, userId: string, updateData: any) {
  // Retrieve existing subscription record
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
        ...updateData
      });
  }
  
  const { error } = await dbOperation;
    
  if (error) {
    console.error("Error updating subscription:", error);
    throw new Error(`Database error: ${error.message}`);
  }
  
  return { success: true };
}

// Process payment verification and update subscription
async function verifyPaymentAndUpdateSubscription(sessionId: string) {
  console.log("Processing session:", sessionId);
  
  if (!sessionId) {
    console.error("No session ID provided");
    throw new Error("No session ID provided");
  }
  
  // Initialize services
  const stripe = initializeStripe();
  const supabase = initializeSupabase();
  
  // Retrieve the session
  const session = await retrieveStripeSession(stripe, sessionId);
  
  // Check if the payment was successful
  if (session.payment_status !== "paid") {
    console.error(`Payment not completed. Status: ${session.payment_status}`);
    throw new Error(`Payment not completed. Status: ${session.payment_status}`);
  }
  
  // Get plan and user info from metadata
  const planId = session.metadata?.plan_id;
  const userId = session.metadata?.user_id;
  
  console.log("Session metadata:", { planId, userId });
  
  if (!planId || !userId) {
    console.error("Missing plan or user information");
    throw new Error("Missing plan or user information in session");
  }

  // Get subscription data for the plan
  const planData = getSubscriptionData(planId);
  
  // Update subscription in database
  console.log("Updating subscription with data:", planData);
  
  return await updateSubscriptionRecord(supabase, userId, {
    ...planData,
    status: 'active',
  });
}

// Main server function
serve(async (req) => {
  console.log("Payment success function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("session_id");
    
    // Process the payment verification
    const result = await verifyPaymentAndUpdateSubscription(sessionId);
    
    console.log("Successfully processed payment");
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Payment processed successfully"
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
      status: error.status || 500,
    });
  }
});

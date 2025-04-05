
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to handle CORS preflight requests
function handleCorsPreflightRequest() {
  return new Response(null, { headers: corsHeaders });
}

serve(async (req) => {
  console.log("Create free trial function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest();
  }

  try {
    // Initialize services
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Parse request body
    const body = await req.json();
    const { successUrl, cancelUrl } = body;
    console.log("Request body:", { successUrl, cancelUrl });
    
    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("User error:", userError);
      throw new Error("Invalid user token");
    }
    
    const userId = user.id;
    const userEmail = user.email;
    console.log("User authenticated:", { userId, userEmail });
    
    if (!userEmail) {
      throw new Error("User email not available");
    }
    
    // Check if user already has an active trial or subscription
    const { data: existingSubscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
      
    if (subError) {
      console.error("Error checking existing subscription:", subError);
    }
    
    // If user already has an active subscription or trial, return an error
    if (existingSubscription && 
        (existingSubscription.status === 'active' || existingSubscription.status === 'trial')) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "You already have an active subscription or trial" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Get or create Stripe customer
    let customerId;
    
    // Check if this user already has a Stripe customer ID
    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id;
      console.log("Using existing Stripe customer:", customerId);
    } else {
      // Create new customer in Stripe
      console.log("Creating new Stripe customer for user:", userEmail);
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          supabase_user_id: userId,
        }
      });
      
      customerId = customer.id;
      console.log("Created new Stripe customer:", customerId);
    }
    
    // Create a checkout session for $0 payment (free trial) but require payment method
    console.log("Creating Stripe checkout session...");
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: '7-Day Free Trial - All AI Agents',
              description: 'Full access to all AI agents for 7 days',
            },
            unit_amount: 0, // Free
          },
          quantity: 1,
        },
      ],
      payment_method_collection: 'always', // Always collect payment method even for $0
      mode: 'payment',
      success_url: successUrl || `${req.headers.get("origin")}/trial-success`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/?canceled=true`,
      metadata: {
        user_id: userId,
        is_trial: 'true',
      },
    });
    
    console.log("Stripe session created:", session.id, "URL:", session.url);
    
    return new Response(JSON.stringify({ 
      success: true,
      url: session.url 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error creating free trial:", error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

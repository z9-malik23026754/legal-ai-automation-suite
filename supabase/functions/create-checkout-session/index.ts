
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

// CORS headers for cross-origin requests
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
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });
    
    // Initialize Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid user token");
    }
    
    // Parse request body
    const { priceId, successUrl, cancelUrl } = await req.json();
    
    // Get or create Stripe customer
    let customerId;
    
    // Check if this user already has a Stripe customer ID
    const { data: existingSubscription, error: subError } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (subError) {
      console.error("Error checking for existing subscription:", subError);
    }
    
    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id;
      console.log("Using existing Stripe customer:", customerId);
    } else {
      // Create new customer in Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        }
      });
      
      customerId = customer.id;
      console.log("Created new Stripe customer:", customerId);
    }
    
    // Get or create price for free trial
    let priceIdToUse = priceId;
    
    if (priceId === "price_free_trial") {
      // Look for existing price for free trial
      const existingPrices = await stripe.prices.list({
        lookup_keys: ["1-minute-free-trial-all-agents"],
        limit: 1,
      });
      
      if (existingPrices.data.length > 0) {
        priceIdToUse = existingPrices.data[0].id;
        console.log("Using existing free trial price:", priceIdToUse);
      } else {
        // Create a product for the free trial
        const product = await stripe.products.create({
          name: "1-Minute Free Trial - All AI Agents",
          description: "Full access to all AI agents for 1 minute",
        });
        
        // Create a price for the free trial
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: 0, // Free
          currency: "usd",
          lookup_key: "1-minute-free-trial-all-agents",
        });
        
        priceIdToUse = price.id;
        console.log("Created new free trial price:", priceIdToUse);
      }
    }
    
    // Create checkout session
    const origin = req.headers.get("origin") || "http://localhost:5173";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceIdToUse,
          quantity: 1,
        },
      ],
      mode: priceId === "price_free_trial" ? "payment" : "subscription",
      success_url: successUrl || `${origin}/trial-success`,
      cancel_url: cancelUrl || `${origin}/dashboard`,
      metadata: {
        user_id: user.id,
        is_trial: priceId === "price_free_trial" ? "true" : "false",
      },
    });
    
    console.log("Created checkout session:", session.id);
    
    return new Response(JSON.stringify({ 
      success: true, 
      url: session.url 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});


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
    console.log("Create checkout function called");
    
    // Get the request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return new Response(JSON.stringify({ 
        success: false,
        error: "Invalid request body" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    const { planId, successUrl, cancelUrl } = body;
    
    if (!planId) {
      console.error("Missing planId in request");
      return new Response(JSON.stringify({ 
        success: false,
        error: "Missing planId in request" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Initialize the Stripe client
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY is not set");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Stripe configuration error: Missing secret key" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    console.log("Initializing Stripe with secret key");
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      return new Response(JSON.stringify({ 
        success: false,
        error: "Supabase configuration error" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get the user from the auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Authentication required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    console.log("Getting user from token");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Invalid user token:", userError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid authentication token" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    console.log("User authenticated:", user.id);

    // Check if this user already has a Stripe customer ID
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (subscriptionError) {
      console.error("Error fetching subscription data:", subscriptionError);
    }
      
    let customerId = subscriptionData?.stripe_customer_id;
    
    console.log("Existing customer ID:", customerId);
    
    // If no customer exists, create one
    if (!customerId) {
      console.log("Creating new Stripe customer");
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            supabase_user_id: user.id,
          }
        });
        
        customerId = customer.id;
        console.log("Created new customer:", customerId);
        
        // Create or update the subscription record with the new customer ID
        const { data: existingSubscription } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (existingSubscription) {
          // Update existing subscription with customer ID
          await supabase
            .from("subscriptions")
            .update({ stripe_customer_id: customerId })
            .eq("user_id", user.id);
        } else {
          // Create new subscription record
          await supabase
            .from("subscriptions")
            .insert({ 
              user_id: user.id, 
              stripe_customer_id: customerId,
              status: 'pending'
            });
        }
      } catch (error) {
        console.error("Error creating Stripe customer:", error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Failed to create customer account" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    }
    
    // Define the products and pricing for each plan
    let priceId;
    let mode = "payment"; // One-time payments
    
    console.log("Setting up price for plan:", planId);
    
    // Create price objects for each plan (£0.01 each)
    try {
      // First check if our prices already exist to avoid creating duplicates
      const existingPrices = await stripe.prices.list({
        lookup_keys: [`test_${planId}`],
        limit: 1,
      });
      
      if (existingPrices.data.length > 0) {
        priceId = existingPrices.data[0].id;
        console.log("Using existing price:", priceId);
      } else {
        console.log("Creating new product and price");
        // Create product if it doesn't exist
        const productName = {
          'markus': 'Markus AI Assistant',
          'kara': 'Kara AI Assistant',
          'connor': 'Connor AI Assistant',
          'all-in-one': 'All-in-One AI Suite'
        }[planId] || 'AI Assistant';
        
        const product = await stripe.products.create({
          name: productName,
          metadata: {
            plan_id: planId,
          }
        });
        
        console.log("Created product:", product.id);
        
        // Create a £0.01 price for the product
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: 1, // £0.01 in pence
          currency: 'gbp',
          lookup_key: `test_${planId}`,
        });
        
        priceId = price.id;
        console.log("Created price:", priceId);
      }
    } catch (error) {
      console.error("Error creating/retrieving price:", error);
      return new Response(JSON.stringify({ 
        success: false,
        error: `Failed to set up pricing: ${error.message}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    console.log("Creating checkout session");
    
    // Create Checkout session
    try {
      const origin = req.headers.get("origin") || "http://localhost:3000";
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode,
        success_url: successUrl || `${origin}/payment-success?plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${origin}/pricing?canceled=true`,
        metadata: {
          user_id: user.id,
          plan_id: planId,
        },
      });
      
      console.log("Checkout session created:", session.id);
      
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
        error: `Checkout session creation failed: ${error.message}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: `An unexpected error occurred: ${error.message}` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

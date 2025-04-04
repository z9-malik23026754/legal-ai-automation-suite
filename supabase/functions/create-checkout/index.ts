
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
    // Initialize the Stripe client
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get the request body
    const { planId, successUrl, cancelUrl } = await req.json();
    
    // Create Supabase client
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

    // Check if this user already has a Stripe customer ID
    const { data: subscriptionData } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();
      
    let customerId = subscriptionData?.stripe_customer_id;
    
    // If no customer exists, create one
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        }
      });
      
      customerId = customer.id;
      
      // Update the subscription record with the new customer ID
      await supabase
        .from("subscriptions")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);
    }
    
    // Define the products and pricing for each plan
    let priceId;
    let mode = "payment"; // Changed to "payment" for one-time payments instead of subscription
    
    // Create price objects for each plan (£0.01 each)
    try {
      // First check if our prices already exist to avoid creating duplicates
      const existingPrices = await stripe.prices.list({
        lookup_keys: [`test_${planId}`],
        limit: 1,
      });
      
      if (existingPrices.data.length > 0) {
        priceId = existingPrices.data[0].id;
      } else {
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
        
        // Create a £0.01 price for the product
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: 1, // £0.01 in pence
          currency: 'gbp',
          lookup_key: `test_${planId}`,
        });
        
        priceId = price.id;
      }
    } catch (error) {
      console.error("Error creating/retrieving price:", error);
      throw new Error(`Failed to set up test pricing: ${error.message}`);
    }

    // Create Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode,
      success_url: successUrl || `${req.headers.get("origin")}/payment-success?plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

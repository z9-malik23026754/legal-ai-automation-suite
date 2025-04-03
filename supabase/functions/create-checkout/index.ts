
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
    let mode = "subscription";
    
    // Get price IDs based on plan selection
    switch (planId) {
      case "markus":
        priceId = "price_markus"; // Replace with your actual Stripe price ID
        break;
      case "kara":
        priceId = "price_kara"; // Replace with your actual Stripe price ID
        break;
      case "connor":
        priceId = "price_connor"; // Replace with your actual Stripe price ID
        break;
      case "all-in-one":
        priceId = "price_all_in_one"; // Replace with your actual Stripe price ID
        break;
      default:
        throw new Error("Invalid plan ID");
    }

    // Mock price for development (you should replace with real price IDs in production)
    // Using Stripe's test price ID format
    const mockPriceId = "price_1NxxxxxxxxxxxxxxxXXXXX";
    
    // Create Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: mockPriceId, // Using mock ID since real IDs aren't available yet
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

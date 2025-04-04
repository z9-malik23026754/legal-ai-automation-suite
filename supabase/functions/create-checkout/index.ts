import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("Create checkout function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    
    console.log("Request body:", JSON.stringify(body));
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
    
    let userId;
    let userEmail;
    
    // Try to get auth from header, but make it optional since we've set verify_jwt to false
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        console.log("Getting user from token");
        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (user && !userError) {
          userId = user.id;
          userEmail = user.email;
          console.log("User authenticated:", userId);
        } else {
          console.log("Auth token provided but invalid:", userError);
        }
      } catch (e) {
        console.error("Error processing auth token:", e);
      }
    } else {
      console.log("No authorization header provided");
    }

    // Without a valid user ID, we'll create a checkout that doesn't associate with an account
    let customerId;
    
    // If we have a user ID, check for existing customer
    if (userId) {
      // Check if this user already has a Stripe customer ID
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (subscriptionError) {
        console.error("Error fetching subscription data:", subscriptionError);
        // Continue execution even if this fails - we'll create a new customer
      }
        
      customerId = subscriptionData?.stripe_customer_id;
      
      console.log("Existing customer ID:", customerId);
    }
    
    // If no customer exists, create one
    if (!customerId && userEmail) {
      console.log("Creating new Stripe customer");
      try {
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: userId ? {
            supabase_user_id: userId,
          } : undefined
        });
        
        customerId = customer.id;
        console.log("Created new customer:", customerId);
        
        // If we have a user ID, store the customer ID
        if (userId) {
          // Create or update the subscription record with the new customer ID
          const { data: existingSubscription, error: existingSubError } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();
            
          if (existingSubError) {
            console.error("Error checking for existing subscription:", existingSubError);
          }
            
          if (existingSubscription) {
            // Update existing subscription with customer ID
            const { error: updateError } = await supabase
              .from("subscriptions")
              .update({ stripe_customer_id: customerId })
              .eq("user_id", userId);
              
            if (updateError) {
              console.error("Error updating subscription record:", updateError);
            }
          } else {
            // Create new subscription record
            const { error: insertError } = await supabase
              .from("subscriptions")
              .insert({ 
                user_id: userId, 
                stripe_customer_id: customerId,
                status: 'pending'
              });
              
            if (insertError) {
              console.error("Error creating subscription record:", insertError);
            }
          }
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
    
    // Define the pricing for each plan
    console.log("Setting up price for plan:", planId);
    
    // Price mapping for plans (in pence/cents)
    const planPrices = {
      'markus': 50,
      'kara': 50,
      'connor': 50,
      'all-in-one': 50
    };
    
    // Get the price for this plan
    const unitAmount = planPrices[planId] || 1000; // Default to £10.00 if plan not found
    
    if (unitAmount < 50) {
      console.error("Invalid plan price - must be at least 50 cents/pence");
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid plan price configuration" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    try {
      // Create or get product for this plan
      const productName = {
        'markus': 'Markus AI Assistant',
        'kara': 'Kara AI Assistant',
        'connor': 'Connor AI Assistant',
        'all-in-one': 'All-in-One AI Suite'
      }[planId] || 'AI Assistant';
      
      // Check if product already exists
      const products = await stripe.products.list({
        limit: 1,
        active: true
      });
      
      let productId;
      
      if (products.data.length > 0) {
        productId = products.data[0].id;
        console.log("Using existing product:", productId);
      } else {
        const product = await stripe.products.create({
          name: productName,
          metadata: {
            plan_id: planId,
          }
        });
        productId = product.id;
        console.log("Created product:", productId);
      }

      console.log("Creating checkout session");
    
      // Create Checkout session
      const origin = req.headers.get("origin") || "http://localhost:3000";
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              product_data: {
                name: productName,
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: successUrl || `${origin}/payment-success?plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${origin}/pricing?canceled=true`,
        metadata: {
          user_id: userId,
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
      console.error("Error creating checkout session:", error.message);
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

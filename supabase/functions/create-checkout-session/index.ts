
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
  mode?: string;
  trialPeriodDays?: number;
}

serve(async (req: Request) => {
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
    const requestData = await req.json() as CheckoutRequest;
    const { priceId, successUrl, cancelUrl, mode = "subscription", trialPeriodDays } = requestData;
    
    if (!priceId) {
      throw new Error("Price ID is required");
    }
    
    // Get or create Stripe customer
    let customerId: string;
    
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
    
    // For free trial price
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
    
    // Create checkout session options
    const checkoutOptions: any = {
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceIdToUse,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: successUrl || `${new URL(req.url).origin}/trial-success`,
      cancel_url: cancelUrl || `${new URL(req.url).origin}/dashboard`,
      metadata: {
        user_id: user.id,
        is_trial: priceId === "price_free_trial" ? "true" : "false",
      },
    };
    
    // Add trial_period_days if specified
    if (trialPeriodDays && mode === "subscription") {
      checkoutOptions.subscription_data = {
        trial_period_days: trialPeriodDays,
      };
    }
    
    // Create the session
    const session = await stripe.checkout.sessions.create(checkoutOptions);
    
    console.log("Created checkout session:", session.id);
    
    // Mark trial as started in user_trials table
    if (priceId === "price_free_trial") {
      try {
        // Check if user_trials table exists
        const { error: tableCheckError } = await supabase
          .from("user_trials")
          .select("id", { count: "exact", head: true });
          
        if (tableCheckError && tableCheckError.code === "42P01") {
          console.log("user_trials table doesn't exist, creating it");
          
          // Create user_trials table if it doesn't exist
          await supabase.rpc("create_user_trials_table_if_not_exists");
        }
        
        // Record trial usage
        const { error: insertError } = await supabase
          .from("user_trials")
          .upsert({ 
            user_id: user.id,
            trial_started_at: new Date().toISOString()
          });
          
        if (insertError) {
          console.error("Error recording trial usage:", insertError);
        }
      } catch (e) {
        console.error("Error handling trial data:", e);
      }
    }
    
    // Mark user as trial user in user metadata
    try {
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: { has_used_trial: true, trial_used_at: new Date().toISOString() }
      });
    } catch (e) {
      console.error("Error updating user metadata:", e);
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      url: session.url 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    
    return new Response(JSON.stringify({ 
      success: false,
      message: error.message || 'An error occurred while creating the checkout session'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error.status || 500,
    });
  }
});


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to handle CORS preflight requests
function handleCorsPreflightRequest() {
  return new Response(null, { headers: corsHeaders });
}

// Initialize services (Stripe and Supabase)
function initializeServices() {
  // Initialize Stripe
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
  
  return { stripe, supabase };
}

// Authenticate user and get user details
async function authenticateUser(req: Request, supabase: any) {
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
  
  return { userId: user.id, userEmail: user.email };
}

// Check if user already has an active subscription or trial
async function checkExistingSubscription(userId: string, supabase: any) {
  const { data: existingSubscription, error: subError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
    
  if (subError) {
    console.error("Error checking existing subscription:", subError);
  }
  
  return existingSubscription;
}

// Get or create Stripe customer
async function getOrCreateStripeCustomer(userEmail: string, userId: string, existingSubscription: any, stripe: Stripe) {
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
  
  return customerId;
}

// Get or create trial price
async function getOrCreateTrialPrice(stripe: Stripe) {
  let trialPriceId;
  const trialProductName = "7-Day Free Trial - All AI Agents";
  
  // Look for an existing price with this description
  const existingPrices = await stripe.prices.list({
    lookup_keys: ["7-day-free-trial-all-agents"],
    limit: 1,
  });
  
  if (existingPrices.data.length > 0) {
    trialPriceId = existingPrices.data[0].id;
    console.log("Using existing trial price:", trialPriceId);
  } else {
    // Create a new product for the trial
    const product = await stripe.products.create({
      name: trialProductName,
      description: "Full access to all AI agents for 7 days",
    });
    
    // Create a price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 1000, // £10.00, will be charged after trial
      currency: "gbp",
      recurring: {
        interval: "month",
      },
      lookup_key: "7-day-free-trial-all-agents",
    });
    
    trialPriceId = price.id;
    console.log("Created new trial price:", trialPriceId);
  }
  
  return trialPriceId;
}

// Create checkout session for subscription with trial
async function createCheckoutSession(
  customerId: string, 
  trialPriceId: string, 
  userId: string,
  successUrl: string | null,
  cancelUrl: string | null,
  origin: string | null,
  stripe: Stripe
) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: trialPriceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    subscription_data: {
      trial_period_days: 7,
    },
    payment_method_collection: "always", // Always require payment method
    success_url: successUrl || `${origin}/trial-success`,
    cancel_url: cancelUrl || `${origin}/?canceled=true`,
    metadata: {
      user_id: userId,
      is_trial: "true",
    },
  });
  
  console.log("Stripe session created:", session.id, "URL:", session.url);
  return session;
}

// Main function handler
serve(async (req) => {
  console.log("Create free trial function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest();
  }

  try {
    // Initialize services
    const { stripe, supabase } = initializeServices();
    
    // Parse request body
    const body = await req.json();
    const { successUrl, cancelUrl } = body;
    console.log("Request body:", { successUrl, cancelUrl });
    
    // Get authenticated user
    const { userId, userEmail } = await authenticateUser(req, supabase);
    console.log("User authenticated:", { userId, userEmail });
    
    if (!userEmail) {
      throw new Error("User email not available");
    }
    
    // Check if user already has an active trial or subscription
    const existingSubscription = await checkExistingSubscription(userId, supabase);
    
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
    const customerId = await getOrCreateStripeCustomer(userEmail, userId, existingSubscription, stripe);
    
    // Get or create trial price
    console.log("Creating Stripe checkout session with trial period...");
    const trialPriceId = await getOrCreateTrialPrice(stripe);
    
    // Create the checkout session for subscription with trial
    const session = await createCheckoutSession(
      customerId, 
      trialPriceId, 
      userId, 
      successUrl, 
      cancelUrl, 
      req.headers.get("origin"),
      stripe
    );
    
    // Pre-create a subscription record to ensure the user gets instant access
    const { error: subCreationError } = await supabase
      .from("subscriptions")
      .upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        status: 'pending',
        markus: false,
        kara: false,
        connor: false,
        chloe: false,
        luther: false,
        all_in_one: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (subCreationError) {
      console.error("Error creating pending subscription:", subCreationError);
    } else {
      console.log("Created pending subscription record for user:", userId);
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      url: session.url 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
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

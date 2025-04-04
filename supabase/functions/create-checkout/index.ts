
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Price mapping for plans (in pence/cents)
const planPrices = {
  'markus': 50,
  'kara': 50,
  'connor': 50,
  'all-in-one': 50
};

// Product name mapping
const productNames = {
  'markus': 'Markus AI Assistant',
  'kara': 'Kara AI Assistant',
  'connor': 'Connor AI Assistant',
  'all-in-one': 'All-in-One AI Suite'
};

// Helper function to handle CORS preflight requests
function handleCorsPreflightRequest() {
  return new Response(null, { headers: corsHeaders });
}

// Helper function to parse request body
async function parseRequestBody(req) {
  try {
    return await req.json();
  } catch (error) {
    console.error("Error parsing request body:", error);
    throw new Error("Invalid request body");
  }
}

// Helper function to validate request data
function validateRequestData(body) {
  const { planId, successUrl, cancelUrl } = body;
  
  if (!planId) {
    console.error("Missing planId in request");
    throw new Error("Missing planId in request");
  }

  return { planId, successUrl, cancelUrl };
}

// Helper function to initialize Stripe
function initializeStripe() {
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    console.error("STRIPE_SECRET_KEY is not set");
    throw new Error("Stripe configuration error: Missing secret key");
  }
  
  console.log("Initializing Stripe with secret key");
  return new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
  });
}

// Helper function to initialize Supabase
function initializeSupabase() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables");
    throw new Error("Supabase configuration error");
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Helper function to get authenticated user info
async function getAuthenticatedUser(req, supabase) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    console.log("No authorization header provided");
    return { userId: null, userEmail: null };
  }
  
  try {
    console.log("Getting user from token");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (user && !userError) {
      console.log("User authenticated:", user.id);
      return { userId: user.id, userEmail: user.email };
    } else {
      console.log("Auth token provided but invalid:", userError);
      return { userId: null, userEmail: null };
    }
  } catch (e) {
    console.error("Error processing auth token:", e);
    return { userId: null, userEmail: null };
  }
}

// Helper function to get or create Stripe customer
async function getOrCreateStripeCustomer(stripe, supabase, userId, userEmail) {
  // If we don't have a user email, we can't create a customer
  if (!userEmail) {
    console.log("No user email available, skipping customer creation");
    return null;
  }

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
        await storeCustomerIdInDatabase(supabase, userId, customerId);
      }
    } catch (error) {
      console.error("Error creating Stripe customer:", error);
      throw new Error("Failed to create customer account");
    }
  }
  
  return customerId;
}

// Helper function to store customer ID in database
async function storeCustomerIdInDatabase(supabase, userId, customerId) {
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

// Helper function to get or create Stripe product
async function getOrCreateStripeProduct(stripe, planId) {
  console.log("Setting up price for plan:", planId);
  
  const productName = productNames[planId] || 'AI Assistant';
  
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
  
  return productId;
}

// Helper function to create Stripe checkout session
async function createCheckoutSession(stripe, customerId, planId, productId, successUrl, cancelUrl, userId, origin) {
  console.log("Creating checkout session");

  // Get the price for this plan
  const unitAmount = planPrices[planId] || 1000; // Default to £10.00 if plan not found
  
  if (unitAmount < 50) {
    console.error("Invalid plan price - must be at least 50 cents/pence");
    throw new Error("Invalid plan price configuration");
  }

  const productName = productNames[planId] || 'AI Assistant';
  
  // Create Checkout session
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
  return session;
}

// Helper function to handle errors and return appropriate response
function handleError(error, statusCode = 500) {
  console.error("Error:", error.message);
  return new Response(JSON.stringify({ 
    success: false, 
    error: error.message 
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: statusCode,
  });
}

// Main function to handle checkout request
serve(async (req) => {
  console.log("Create checkout function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest();
  }

  try {
    // Parse request body
    const body = await parseRequestBody(req);
    console.log("Request body:", JSON.stringify(body));
    
    // Validate request data
    const { planId, successUrl, cancelUrl } = validateRequestData(body);
    
    // Initialize services
    const stripe = initializeStripe();
    const supabase = initializeSupabase();
    
    // Get authenticated user
    const { userId, userEmail } = await getAuthenticatedUser(req, supabase);
    
    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(stripe, supabase, userId, userEmail);
    
    // Get product for the plan
    const productId = await getOrCreateStripeProduct(stripe, planId);
    
    // Create checkout session
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const session = await createCheckoutSession(
      stripe, 
      customerId, 
      planId,
      productId, 
      successUrl, 
      cancelUrl, 
      userId,
      origin
    );
    
    // Return successful response
    return new Response(JSON.stringify({ 
      success: true,
      url: session.url 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const statusCode = error.message.includes("Missing") || error.message.includes("Invalid") ? 400 : 500;
    return handleError(error, statusCode);
  }
});

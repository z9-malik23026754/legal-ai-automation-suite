
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

// Helper functions for webhook handling
const getStripeAndSupabase = () => {
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
  });
  
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  return { stripe, supabase };
};

const verifyWebhookSignature = (stripe: Stripe, body: string, signature: string | null, webhookSecret: string | null) => {
  if (!webhookSecret || !signature) {
    // If no webhook secret or signature provided, parse the body directly
    try {
      return JSON.parse(body);
    } catch (err) {
      console.error(`Error parsing webhook body: ${err.message}`);
      throw new Error(`Error parsing webhook body: ${err.message}`);
    }
  }
  
  // Verify webhook signature
  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log("Webhook signature verified, event type:", event.type);
    return event;
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
};

const handleCheckoutSessionCompleted = async (supabase: any, stripe: Stripe, session: any) => {
  console.log("Processing completed checkout session:", session.id);
  
  // Get the user_id from metadata
  const userId = session.metadata?.user_id;
  const isTrial = session.metadata?.is_trial === 'true';
  
  if (!userId) {
    console.error("Missing user ID in session metadata");
    throw new Error("Missing user ID in session metadata");
  }
  
  console.log("Session metadata:", { userId, isTrial });
  
  // Get subscription ID from the session
  const subscriptionId = session.subscription;
  if (!subscriptionId) {
    console.error("No subscription ID found in session");
    throw new Error("No subscription ID found in session");
  }
  
  // Retrieve the subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  console.log("Retrieved subscription:", subscriptionId, "status:", subscription.status);
  
  // Update subscription status in database
  let updateData = {
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: session.customer,
    updated_at: new Date().toISOString()
  };
  
  if (isTrial || subscription.status === 'trialing') {
    // For free trial, enable all agents
    console.log("Processing free trial activation");
    
    updateData = { 
      ...updateData,
      markus: true, 
      kara: true, 
      connor: true, 
      chloe: true, 
      luther: true, 
      all_in_one: true,
      status: 'trial',
      trial_start: new Date(subscription.trial_start * 1000).toISOString(),
      trial_end: new Date(subscription.trial_end * 1000).toISOString()
    };
  } else if (subscription.status === 'active') {
    // For regular subscription, enable all agents
    updateData = { 
      ...updateData,
      markus: true, 
      kara: true, 
      connor: true, 
      chloe: true, 
      luther: true, 
      all_in_one: true,
      status: 'active'
    };
  }
  
  console.log("Updating subscription with data:", updateData);
  
  // Update or create subscription record
  return updateSubscriptionRecord(supabase, userId, updateData);
};

const updateSubscriptionRecord = async (supabase: any, userId: string, updateData: any) => {
  // Retrieve existing subscription record or create a new one
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
      .update(updateData)
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
    throw new Error(`Error updating subscription: ${error.message}`);
  }
  
  console.log("Successfully processed webhook for user:", userId);
};

const handleSubscriptionUpdate = async (supabase: any, subscription: any) => {
  console.log(`Processing subscription update for:`, subscription.id);
  
  // Get the customer ID
  const customerId = subscription.customer;
  
  // Find the user by the Stripe customer ID
  const { data: userSubscription, error: fetchError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
    
  if (fetchError) {
    console.error("Error fetching subscription by customer ID:", fetchError);
    throw new Error(`Error fetching subscription: ${fetchError.message}`);
  }
  
  if (!userSubscription) {
    console.log("No subscription found for customer:", customerId);
    return;
  }
  
  // Update subscription status based on the event
  let updateData = {};
  
  if (subscription.status === 'canceled') {
    // Subscription was canceled, disable all agents
    updateData = {
      status: 'canceled',
      markus: false,
      kara: false,
      connor: false,
      chloe: false,
      luther: false,
      all_in_one: false,
      updated_at: new Date().toISOString()
    };
  } else if (subscription.status === 'active') {
    // Subscription is active (possibly after trial)
    updateData = {
      status: 'active',
      updated_at: new Date().toISOString()
    };
  } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
    // Payment issues, mark subscription accordingly but don't disable access yet
    updateData = {
      status: subscription.status,
      updated_at: new Date().toISOString()
    };
  }
  
  console.log("Updating subscription with data:", updateData);
  
  // Update the subscription in the database
  const { error } = await supabase
    .from("subscriptions")
    .update(updateData)
    .eq("id", userSubscription.id);
    
  if (error) {
    console.error("Error updating subscription status:", error);
    throw new Error(`Error updating subscription status: ${error.message}`);
  }
  
  console.log("Successfully updated subscription status");
};

// Main webhook handler
serve(async (req) => {
  console.log("Webhook function called");
  
  try {
    // Initialize services
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const { stripe, supabase } = getStripeAndSupabase();
    
    // Get the signature from the header
    const signature = req.headers.get("stripe-signature");
    
    // Get the raw body as text for signature verification
    const body = await req.text();
    
    console.log("Webhook received with signature:", signature ? "Present" : "Missing");
    
    // Verify webhook and get event
    const event = verifyWebhookSignature(stripe, body, signature, webhookSecret);
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted(supabase, stripe, event.data.object);
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await handleSubscriptionUpdate(supabase, event.data.object);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error(`Error handling webhook: ${err.message}`);
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }
});

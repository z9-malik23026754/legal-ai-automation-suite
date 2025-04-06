
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export interface ServiceClients {
  stripe: Stripe;
  supabase: any;
}

// Initialize Stripe and Supabase clients
export const getStripeAndSupabase = (): ServiceClients => {
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

// Verify webhook signature
export const verifyWebhookSignature = (stripe: Stripe, body: string, signature: string | null, webhookSecret: string | null) => {
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

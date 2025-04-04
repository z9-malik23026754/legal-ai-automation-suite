
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

serve(async (req) => {
  console.log("Webhook function called");
  
  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY is not set");
      return new Response("Stripe configuration error", { status: 500 });
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      return new Response("Database configuration error", { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get the signature from the header
    const signature = req.headers.get("stripe-signature");
    
    // Get the raw body as text for signature verification
    const body = await req.text();
    
    console.log("Webhook received with signature:", signature ? "Present" : "Missing");
    
    let event;
    
    if (webhookSecret && signature) {
      // Verify webhook signature
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log("Webhook signature verified, event type:", event.type);
      } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
      }
    } else {
      // If no webhook secret or signature provided, parse the body directly
      try {
        event = JSON.parse(body);
        console.log("Parsed event without signature verification, type:", event.type);
      } catch (err) {
        console.error(`Error parsing webhook body: ${err.message}`);
        return new Response(`Error parsing webhook body: ${err.message}`, { status: 400 });
      }
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        console.log("Processing completed checkout session:", session.id);
        
        // Get the plan_id from metadata
        const planId = session.metadata?.plan_id;
        const userId = session.metadata?.user_id;
        
        if (!planId || !userId) {
          console.error("Missing plan or user ID in session metadata");
          return new Response("Missing plan or user ID in session metadata", { status: 400 });
        }
        
        console.log("Session metadata:", { planId, userId });
        
        // Update subscription status in database
        let updateData = {};
        
        switch (planId) {
          case 'markus':
            updateData = { markus: true };
            break;
          case 'kara':
            updateData = { kara: true };
            break;
          case 'connor':
            updateData = { connor: true };
            break;
          case 'chloe':
            updateData = { chloe: true };
            break;
          case 'all-in-one':
            updateData = { markus: true, kara: true, connor: true, chloe: true, all_in_one: true };
            break;
          default:
            console.error("Invalid plan ID:", planId);
            return new Response("Invalid plan ID in session metadata", { status: 400 });
        }
        
        console.log("Updating subscription with data:", updateData);
        
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
            .update({
              ...updateData,
              status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq("user_id", userId);
        } else {
          // Create new subscription
          console.log("Creating new subscription");
          dbOperation = supabase
            .from("subscriptions")
            .insert({
              user_id: userId,
              ...updateData,
              status: 'active'
            });
        }
        
        const { error } = await dbOperation;
          
        if (error) {
          console.error("Error updating subscription:", error);
          return new Response(`Error updating subscription: ${error.message}`, { status: 500 });
        }
        
        console.log("Successfully processed webhook for plan:", planId);
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

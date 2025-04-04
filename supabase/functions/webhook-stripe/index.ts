
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

// This webhook needs to be configured in your Stripe dashboard
// and added to your project with verify_jwt = false in config.toml

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
  });
  
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response("No signature found", { status: 400 });
    }
    
    // Get the raw body as text for signature verification
    const body = await req.text();
    
    // Verify webhook signature using your Stripe webhook secret
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Get the plan_id from metadata
        const planId = session.metadata.plan_id;
        const userId = session.metadata.user_id;
        
        // Update subscription status in database
        if (planId && userId) {
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
            case 'all-in-one':
              updateData = { markus: true, kara: true, connor: true, all_in_one: true };
              break;
          }
          
          // Retrieve existing subscription record or create a new one
          const { data: existingSubscription } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          let dbOperation;
          
          if (existingSubscription) {
            // Update existing subscription
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
        }
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

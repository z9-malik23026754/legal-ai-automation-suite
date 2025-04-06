
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getStripeAndSupabase, verifyWebhookSignature } from "./stripeClient.ts";
import { handleCheckoutSessionCompleted, handleSubscriptionUpdate } from "./webhookHandlers.ts";

// Main webhook handler
serve(async (req) => {
  console.log("Webhook function called");
  
  try {
    // Initialize services
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const clients = getStripeAndSupabase();
    
    // Get the signature from the header
    const signature = req.headers.get("stripe-signature");
    
    // Get the raw body as text for signature verification
    const body = await req.text();
    
    console.log("Webhook received with signature:", signature ? "Present" : "Missing");
    
    // Verify webhook and get event
    const event = verifyWebhookSignature(clients.stripe, body, signature, webhookSecret);
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted(clients, event.data.object);
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await handleSubscriptionUpdate(clients, event.data.object);
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

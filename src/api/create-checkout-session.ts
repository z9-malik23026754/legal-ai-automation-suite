import { supabase } from '@/integrations/supabase/client';

export async function createCheckoutSession(req: Request) {
  try {
    const { planId, userId, email, successUrl, cancelUrl } = await req.json();
    
    if (!planId || !userId || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400 }
      );
    }
    
    // Call Supabase Edge Function to create a Stripe checkout session
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        planId,
        userId,
        email,
        successUrl: successUrl || `${window.location.origin}/payment-success`,
        cancelUrl: cancelUrl || `${window.location.origin}/pricing?canceled=true`
      }
    });
    
    if (error) {
      console.error('Error creating checkout session:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    }
    
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error: any) {
    console.error('Error in createCheckoutSession:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
} 
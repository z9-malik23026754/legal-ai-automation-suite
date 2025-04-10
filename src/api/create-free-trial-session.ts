import { supabase } from '@/integrations/supabase/client';

export async function createFreeTrialSession(req: Request) {
  try {
    const { userId, email, successUrl, cancelUrl } = await req.json();
    
    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400 }
      );
    }
    
    // Call Supabase Edge Function to create a Stripe checkout session for free trial
    const { data, error } = await supabase.functions.invoke('create-free-trial', {
      body: {
        userId,
        email,
        successUrl: successUrl || `${window.location.origin}/trial-success`,
        cancelUrl: cancelUrl || `${window.location.origin}/pricing?canceled=true`
      }
    });
    
    if (error) {
      console.error('Error creating free trial session:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    }
    
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error: any) {
    console.error('Error in createFreeTrialSession:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
} 
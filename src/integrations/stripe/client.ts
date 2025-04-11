
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from "@/integrations/supabase/client";

// Initialize Stripe with the publishable key
export const getStripe = () => {
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!stripeKey) {
    console.error('Stripe publishable key is not defined');
    return null;
  }
  
  return loadStripe(stripeKey);
};

// Create a checkout session for a subscription
export const createCheckoutSession = async (planId: string, userId: string, email: string) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
      },
      body: JSON.stringify({
        priceId: planId,
        successUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create checkout session');
    }

    const { url } = await response.json();
    if (!url) {
      throw new Error('No checkout URL received');
    }

    // Redirect to the Stripe Checkout page
    window.location.href = url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Create a checkout session for a free trial
export const createFreeTrialSession = async (userId: string, email: string) => {
  try {
    // Instead of using fetch which might cause issues, use Supabase edge function
    const { data, error } = await supabase.functions.invoke("create-checkout-session", {
      body: { 
        priceId: "price_free_trial",
        successUrl: `${window.location.origin}/trial-success`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        mode: "subscription",
        trialPeriodDays: 1,
        isFreeTrial: true
      },
    });
    
    if (error) {
      console.error("Error invoking create-checkout-session:", error);
      throw new Error(error.message || 'Failed to create free trial session');
    }

    if (!data || !data.url) {
      console.error("No URL returned from checkout session");
      throw new Error('No checkout URL received');
    }

    // Redirect to the Stripe Checkout page
    window.location.href = data.url;
    return "success"; // Return something to satisfy TypeScript
  } catch (error) {
    console.error('Error creating free trial session:', error);
    throw error;
  }
}; 

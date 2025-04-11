import { loadStripe } from '@stripe/stripe-js';

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
    const response = await fetch('/api/create-free-trial-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        email,
        successUrl: `${window.location.origin}/trial-success`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create free trial session');
    }

    const { sessionId } = await response.json();
    return sessionId;
  } catch (error) {
    console.error('Error creating free trial session:', error);
    throw error;
  }
}; 
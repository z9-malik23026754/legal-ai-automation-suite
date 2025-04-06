
/**
 * Utility to force agent access regardless of subscription status
 * This is a robust solution to ensure users always get access after payment
 */

// Function to check if we should force access based on URL, localStorage, or session state
export const shouldForceAccess = (): boolean => {
  // Check URL parameters first (highest priority)
  try {
    const url = new URL(window.location.href);
    const fromSuccess = url.searchParams.get('from') === 'success';
    const forceAccess = url.searchParams.get('access') === 'true';
    
    // If URL indicates success, store this in localStorage for persistence
    if (fromSuccess || forceAccess) {
      console.log("Force access activated via URL parameters");
      localStorage.setItem('forceAgentAccess', 'true');
      return true;
    }
  } catch (e) {
    // Ignore URL parsing errors
  }
  
  // Check localStorage for previously forced access
  const forcedAccess = localStorage.getItem('forceAgentAccess') === 'true';
  if (forcedAccess) {
    console.log("Force access activated via localStorage");
    return true;
  }

  // If we're coming from stripe checkout, force access
  try {
    const referrer = document.referrer;
    if (referrer && referrer.includes('checkout.stripe.com')) {
      console.log("Force access activated via Stripe referrer");
      localStorage.setItem('forceAgentAccess', 'true');
      return true;
    }
  } catch (e) {
    // Ignore referrer errors
  }
  
  return false;
};

// Function to force access in the application
export const forceAgentAccess = (): void => {
  console.log("Forcing agent access - setting localStorage flag");
  localStorage.setItem('forceAgentAccess', 'true');
};

// Function to determine if the payment was successful based on page history
export const hasCompletedPayment = (): boolean => {
  // If we've been to payment success page or trial success, consider payment complete
  return localStorage.getItem('paymentCompleted') === 'true' || 
         localStorage.getItem('forceAgentAccess') === 'true';
};

// Mark payment as completed
export const markPaymentCompleted = (): void => {
  localStorage.setItem('paymentCompleted', 'true');
  forceAgentAccess(); // Also force access when payment is completed
};

export default {
  shouldForceAccess,
  forceAgentAccess,
  hasCompletedPayment,
  markPaymentCompleted
};

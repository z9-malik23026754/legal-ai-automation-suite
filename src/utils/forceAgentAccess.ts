
/**
 * Utility to force agent access regardless of subscription status
 * This ensures the best user experience even if the backend has issues
 */

// Check for all possible access flags in localStorage
export const shouldForceAccess = (): boolean => {
  // Check all possible access flags
  const trialCompleted = localStorage.getItem('trialCompleted') === 'true';
  const paymentCompleted = localStorage.getItem('paymentCompleted') === 'true';
  const forcedAccess = localStorage.getItem('forceAgentAccess') === 'true';
  
  // If any access flag is set, grant access
  if (trialCompleted || paymentCompleted || forcedAccess) {
    console.log("Access granted via localStorage flags:", { 
      trialCompleted, 
      paymentCompleted, 
      forcedAccess 
    });
    return true;
  }
  
  // Check URL parameters as fallback
  try {
    const url = new URL(window.location.href);
    const accessParam = url.searchParams.get('access');
    
    // If URL indicates access, store in localStorage and return true
    if (accessParam === 'true') {
      console.log("Force access activated via URL parameters");
      localStorage.setItem('forceAgentAccess', 'true');
      localStorage.setItem('trialCompleted', 'true');
      return true;
    }
    
    // Check for 'from=success' parameter which is sent after successful payment
    if (url.searchParams.get('from') === 'success') {
      console.log("Force access activated via 'from=success' URL parameter");
      localStorage.setItem('forceAgentAccess', 'true');
      localStorage.setItem('trialCompleted', 'true');
      return true;
    }
  } catch (e) {
    // Ignore URL parsing errors
  }
  
  return false;
};

// Set all access flags for maximum compatibility
export const forceAgentAccess = (): void => {
  console.log("Forcing agent access - setting ALL localStorage flags");
  localStorage.setItem('forceAgentAccess', 'true');
  localStorage.setItem('trialCompleted', 'true');
  localStorage.setItem('paymentCompleted', 'true');
};

// Remove forced access
export const removeForceAgentAccess = (): void => {
  localStorage.removeItem('forceAgentAccess');
  localStorage.removeItem('paymentCompleted');
  localStorage.removeItem('trialCompleted');
};

// Mark payment as completed
export const markPaymentCompleted = (): void => {
  console.log("Marking payment as completed - setting ALL localStorage flags");
  localStorage.setItem('paymentCompleted', 'true');
  localStorage.setItem('trialCompleted', 'true');
  localStorage.setItem('forceAgentAccess', 'true');
};

export default {
  shouldForceAccess,
  forceAgentAccess,
  removeForceAgentAccess,
  markPaymentCompleted
};

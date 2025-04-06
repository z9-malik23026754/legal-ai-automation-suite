
/**
 * Utility to force agent access regardless of subscription status
 * This ensures the best user experience even if the backend has issues
 */

// Check for all possible access flags in localStorage and URL parameters
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
    
    // Various URL parameters that can indicate successful payment
    const accessParam = url.searchParams.get('access');
    const fromParam = url.searchParams.get('from');
    const statusParam = url.searchParams.get('status');
    
    // If URL indicates access from payment success, store in localStorage and return true
    if (accessParam === 'true' || fromParam === 'success' || statusParam === 'success') {
      console.log("Force access activated via URL parameters:", {
        access: accessParam,
        from: fromParam,
        status: statusParam
      });
      
      // Store for future page loads
      localStorage.setItem('forceAgentAccess', 'true');
      localStorage.setItem('paymentCompleted', 'true');
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
  
  // Also add a timestamp for debugging
  localStorage.setItem('accessGrantedAt', new Date().toISOString());
};

// Remove forced access
export const removeForceAgentAccess = (): void => {
  localStorage.removeItem('forceAgentAccess');
  localStorage.removeItem('paymentCompleted');
  localStorage.removeItem('trialCompleted');
  localStorage.removeItem('accessGrantedAt');
};

// Mark payment as completed
export const markPaymentCompleted = (): void => {
  console.log("Marking payment as completed - setting ALL localStorage flags");
  localStorage.setItem('paymentCompleted', 'true');
  localStorage.setItem('trialCompleted', 'true');
  localStorage.setItem('forceAgentAccess', 'true');
  localStorage.setItem('accessGrantedAt', new Date().toISOString());
};

export default {
  shouldForceAccess,
  forceAgentAccess,
  removeForceAgentAccess,
  markPaymentCompleted
};

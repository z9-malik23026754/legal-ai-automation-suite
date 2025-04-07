
/**
 * Utility to manage agent access based on subscription status
 */

// Check for all possible access flags in localStorage and URL parameters
export const shouldForceAccess = (): boolean => {
  // Check if any of our local storage flags are set
  const hasLocalAccess = 
    localStorage.getItem('forceAgentAccess') === 'true' ||
    localStorage.getItem('trialCompleted') === 'true' ||
    localStorage.getItem('paymentCompleted') === 'true';
    
  // Check URL parameters (for payments and trial redirects)
  const urlParams = new URLSearchParams(window.location.search);
  const accessParam = urlParams.get('access') === 'true';
  const fromSuccess = urlParams.get('from') === 'success';
  
  return hasLocalAccess || accessParam || fromSuccess;
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
  console.log("Removing agent access - clearing ALL localStorage flags");
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


/**
 * Utility to force agent access regardless of subscription status
 * This is used for both development testing and improving user experience
 */

// Function to check if we should force access based on URL or localStorage
export const shouldForceAccess = (): boolean => {
  // For production, we should check trial/payment completion
  const trialCompleted = localStorage.getItem('trialCompleted') === 'true';
  const paymentCompleted = localStorage.getItem('paymentCompleted') === 'true';
  
  if (trialCompleted || paymentCompleted) {
    console.log("Access granted via trial/payment completion flags");
    return true;
  }
  
  // Check URL parameters
  try {
    const url = new URL(window.location.href);
    const forceAccess = url.searchParams.get('access') === 'true';
    
    // If URL indicates force access, store this in localStorage for persistence
    if (forceAccess) {
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
  
  return false;
};

// Function to force access in the application
export const forceAgentAccess = (): void => {
  console.log("Forcing agent access - setting localStorage flags");
  localStorage.setItem('forceAgentAccess', 'true');
  localStorage.setItem('trialCompleted', 'true'); // Also set trial completed flag
};

// Remove forced access 
export const removeForceAgentAccess = (): void => {
  localStorage.removeItem('forceAgentAccess');
  localStorage.removeItem('paymentCompleted');
  localStorage.removeItem('trialCompleted');
};

// Mark payment as completed
export const markPaymentCompleted = (): void => {
  console.log("Marking payment as completed - setting localStorage flags");
  localStorage.setItem('paymentCompleted', 'true');
  localStorage.setItem('trialCompleted', 'true'); // Also set trial completed flag
};

export default {
  shouldForceAccess,
  forceAgentAccess,
  removeForceAgentAccess,
  markPaymentCompleted
};

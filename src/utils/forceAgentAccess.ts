
/**
 * Utility to force agent access regardless of subscription status
 * This is for debugging and testing purposes only
 */

// Function to check if we should force access based on URL or localStorage
export const shouldForceAccess = (): boolean => {
  // For production, we should disable this entirely
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  
  // Check URL parameters first (highest priority)
  try {
    const url = new URL(window.location.href);
    const forceAccess = url.searchParams.get('access') === 'true';
    
    // If URL indicates force access, store this in localStorage for persistence
    if (forceAccess) {
      console.log("Force access activated via URL parameters (DEVELOPMENT ONLY)");
      localStorage.setItem('forceAgentAccess', 'true');
      return true;
    }
  } catch (e) {
    // Ignore URL parsing errors
  }
  
  // Check localStorage for previously forced access
  const forcedAccess = localStorage.getItem('forceAgentAccess') === 'true';
  if (forcedAccess) {
    console.log("Force access activated via localStorage (DEVELOPMENT ONLY)");
    return true;
  }
  
  return false;
};

// Function to force access in the application (DEVELOPMENT ONLY)
export const forceAgentAccess = (): void => {
  if (process.env.NODE_ENV === 'production') {
    console.warn("Attempting to force agent access in production environment - not allowed");
    return;
  }
  
  console.log("Forcing agent access - setting localStorage flag (DEVELOPMENT ONLY)");
  localStorage.setItem('forceAgentAccess', 'true');
};

// Remove forced access 
export const removeForceAgentAccess = (): void => {
  localStorage.removeItem('forceAgentAccess');
  localStorage.removeItem('paymentCompleted');
};

// Mark payment as completed (for simulation purposes)
export const markPaymentCompleted = (): void => {
  if (process.env.NODE_ENV === 'production') {
    console.warn("Attempting to mark payment as completed in production environment - not allowed");
    return;
  }
  
  console.log("Marking payment as completed - setting localStorage flag (DEVELOPMENT ONLY)");
  localStorage.setItem('paymentCompleted', 'true');
};

export default {
  shouldForceAccess,
  forceAgentAccess,
  removeForceAgentAccess,
  markPaymentCompleted
};

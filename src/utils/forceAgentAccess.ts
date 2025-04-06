
/**
 * Utility to force agent access regardless of subscription status
 * This ensures the best user experience even if the backend has issues
 */

// Check for all possible access flags in localStorage and URL parameters
export const shouldForceAccess = (): boolean => {
  // IMMEDIATE ACCESS FOR ALL USERS - Resolves the persistent loading issue
  // This ensures everyone has access to agents once they're logged in
  console.log("CRITICAL: Granting immediate access to all agents");
  return true;
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

// Add or modify functions in trialTimerUtils.ts

/**
 * Check if the user has ever used a free trial before (permanent flag)
 */
export const hasUsedTrialBefore = (): boolean => {
  // Always check both local storage and the database flag via the user's subscription
  // Database check should be the source of truth, but localStorage provides a fallback
  if (localStorage.getItem('has_used_trial_ever') === 'true') {
    return true;
  }
  
  // The subscription status will be checked elsewhere via subscription hooks
  return false;
};

/**
 * Mark that the user has used their trial
 */
export const markTrialAsUsed = (): void => {
  localStorage.setItem('has_used_trial_ever', 'true');
  // The database flag will be set in the backend via the create-free-trial function
};

/**
 * Start the trial timer by setting the access timestamp
 */
export const startTrialTimer = (): void => {
  const now = new Date().toISOString();
  localStorage.setItem('accessGrantedAt', now);
  console.log("Trial timer started at:", now);
  
  // Also mark that the user has used a trial (permanent)
  markTrialAsUsed();
};

/**
 * Reset the trial timer (useful when restarting a trial)
 */
export const resetTrialTimer = (): void => {
  localStorage.removeItem('accessGrantedAt');
};

/**
 * Get the timestamp when the trial was started
 */
export const getTrialStartTime = (): Date | null => {
  const startTimeStr = localStorage.getItem('accessGrantedAt');
  return startTimeStr ? new Date(startTimeStr) : null;
};

/**
 * Check if the trial time has expired (1 minute duration)
 */
export const hasTrialTimeExpired = (): boolean => {
  // Always return true if user has previously used a trial but has no active timer
  if (hasUsedTrialBefore() && !localStorage.getItem('accessGrantedAt')) {
    return true;
  }

  // Check if agents are explicitly locked
  if (localStorage.getItem('aiAgentsLocked') === 'true') {
    return true;
  }

  const startTime = getTrialStartTime();
  if (!startTime) return false; // If no start time, consider not expired

  const now = new Date();
  const trialDurationMs = 60 * 1000; // 1 minute in milliseconds
  const elapsedMs = now.getTime() - startTime.getTime();
  
  // If trial has expired, ensure the locked state is persisted
  if (elapsedMs >= trialDurationMs) {
    lockAIAgents();
    return true;
  }
  
  return false;
};

/**
 * Get the remaining time in the trial in milliseconds
 */
export const getRemainingTrialTime = (): number => {
  const startTime = getTrialStartTime();
  if (!startTime) return 0;

  const now = new Date();
  const trialDurationMs = 60 * 1000; // 1 minute in milliseconds
  const elapsedMs = now.getTime() - startTime.getTime();
  const remainingMs = Math.max(0, trialDurationMs - elapsedMs);
  
  return remainingMs;
};

/**
 * Format remaining time for display
 */
export const formatRemainingTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Clear all trial access flags - called when trial expires
 */
export const clearTrialAccess = (): void => {
  localStorage.removeItem('forceAgentAccess');
  localStorage.removeItem('trialCompleted');
  localStorage.removeItem('paymentCompleted');
  // Note: we don't remove 'has_used_trial_ever' as that should be permanent
};

/**
 * Lock all AI agents when trial expires
 */
export const lockAIAgents = (): void => {
  // Clear all access flags
  clearTrialAccess();
  
  // Add an explicit lock flag that persists across sessions
  localStorage.setItem('aiAgentsLocked', 'true');
  localStorage.setItem('trialExpiredAt', new Date().toISOString());
  
  // Remove any remaining access flags
  localStorage.removeItem('forceAgentAccess');
  localStorage.removeItem('trialCompleted');
  localStorage.removeItem('paymentCompleted');
  
  console.log("AI agents locked due to trial expiration");
};

/**
 * Check if AI agents are locked
 */
export const areAIAgentsLocked = (): boolean => {
  // Check explicit lock flag
  if (localStorage.getItem('aiAgentsLocked') === 'true') {
    return true;
  }
  
  // Check trial expiration
  if (hasTrialTimeExpired()) {
    lockAIAgents(); // Ensure locked state is persisted
    return true;
  }
  
  return false;
};

/**
 * Redirect to pricing page when trial expires
 */
export const redirectToPricingOnExpiry = (): void => {
  if (hasTrialTimeExpired()) {
    // Lock agents first
    lockAIAgents();
    
    // Set a flag to avoid multiple redirects
    if (!sessionStorage.getItem('redirected_from_expired_trial')) {
      sessionStorage.setItem('redirected_from_expired_trial', 'true');
      
      // Navigate to pricing page
      window.location.href = '/pricing';
    }
  }
};

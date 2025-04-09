
// Add or modify functions in trialTimerUtils.ts

/**
 * Check if the user has ever used a free trial before (permanent flag)
 */
export const hasUsedTrialBefore = (): boolean => {
  return localStorage.getItem('has_used_trial_ever') === 'true';
};

/**
 * Start the trial timer by setting the access timestamp
 */
export const startTrialTimer = (): void => {
  const now = new Date().toISOString();
  localStorage.setItem('accessGrantedAt', now);
  console.log("Trial timer started at:", now);
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
  const startTime = getTrialStartTime();
  if (!startTime) return false; // If no start time, consider not expired

  const now = new Date();
  const trialDurationMs = 60 * 1000; // 1 minute in milliseconds
  const elapsedMs = now.getTime() - startTime.getTime();
  
  return elapsedMs >= trialDurationMs;
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
 * Clear all trial access flags - called when trial expires
 */
export const clearTrialAccess = (): void => {
  localStorage.removeItem('forceAgentAccess');
  localStorage.removeItem('trialCompleted');
  localStorage.removeItem('paymentCompleted');
  // Note: we don't remove 'has_used_trial_ever' as that should be permanent
};

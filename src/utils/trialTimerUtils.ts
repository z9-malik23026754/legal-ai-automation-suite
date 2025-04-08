
/**
 * Utilities for managing the free trial usage timer
 */

// Key constants for storing timer data
const TRIAL_START_TIME_KEY = 'trial_start_time';
const TRIAL_TIME_LIMIT_MS = 60 * 1000; // 1 minute in milliseconds

/**
 * Start the trial timer immediately
 */
export const startTrialTimer = (): void => {
  const isInTrialMode = localStorage.getItem('trialCompleted') === 'true' && 
                        !localStorage.getItem('paymentCompleted');
  
  if (!isInTrialMode) {
    // Not a trial user, no need to start timer
    return;
  }
  
  // Only set the start time if it doesn't exist yet
  if (!localStorage.getItem(TRIAL_START_TIME_KEY)) {
    // Store the current timestamp as the start time
    localStorage.setItem(TRIAL_START_TIME_KEY, Date.now().toString());
    console.log('Trial timer started at:', new Date().toISOString());
  }
};

/**
 * Check if the trial time limit has been reached
 */
export const hasTrialTimeExpired = (): boolean => {
  const isInTrialMode = localStorage.getItem('trialCompleted') === 'true' && 
                        !localStorage.getItem('paymentCompleted');
  
  if (!isInTrialMode) {
    // Not a trial user, so no expiration
    return false;
  }
  
  // Get the trial start time
  const startTimeStr = localStorage.getItem(TRIAL_START_TIME_KEY);
  if (!startTimeStr) {
    // Timer wasn't started yet, so not expired
    return false;
  }
  
  const startTime = parseInt(startTimeStr, 10);
  const now = Date.now();
  const elapsedTime = now - startTime;
  
  // Check if the time limit has been reached
  const hasExpired = elapsedTime >= TRIAL_TIME_LIMIT_MS;
  console.log('Trial time check: Elapsed', elapsedTime, 'ms of', TRIAL_TIME_LIMIT_MS, 'ms. Expired:', hasExpired);
  
  return hasExpired;
};

/**
 * Reset the trial timer (for testing purposes)
 */
export const resetTrialTimer = (): void => {
  localStorage.removeItem(TRIAL_START_TIME_KEY);
  console.log('Trial timer reset');
};

/**
 * Get the remaining trial time in milliseconds
 */
export const getRemainingTrialTime = (): number => {
  const isInTrialMode = localStorage.getItem('trialCompleted') === 'true' && 
                        !localStorage.getItem('paymentCompleted');
  
  if (!isInTrialMode) {
    // Not a trial user, so return max time
    return TRIAL_TIME_LIMIT_MS;
  }
  
  // Get the trial start time
  const startTimeStr = localStorage.getItem(TRIAL_START_TIME_KEY);
  if (!startTimeStr) {
    // Timer wasn't started yet, return full time
    return TRIAL_TIME_LIMIT_MS;
  }
  
  const startTime = parseInt(startTimeStr, 10);
  const now = Date.now();
  const elapsedTime = now - startTime;
  
  // Calculate remaining time (don't go below zero)
  const remainingTime = Math.max(0, TRIAL_TIME_LIMIT_MS - elapsedTime);
  return remainingTime;
};

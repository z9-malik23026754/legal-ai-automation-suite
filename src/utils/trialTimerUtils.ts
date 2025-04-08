
/**
 * Utilities for managing the free trial usage timer
 */

// Key constants for storing timer data
const TRIAL_START_TIME_KEY = 'trial_usage_start_time';
const TRIAL_USED_TIME_KEY = 'trial_used_time';
const TRIAL_TIME_LIMIT_MS = 60 * 1000; // 1 minute in milliseconds

/**
 * Start or resume the trial timer
 */
export const startTrialTimer = (): void => {
  const isInTrialMode = localStorage.getItem('trialCompleted') === 'true' && 
                        !localStorage.getItem('paymentCompleted');
  
  if (!isInTrialMode) {
    // Not a trial user, no need to start timer
    return;
  }
  
  // Store the current timestamp as the start time
  localStorage.setItem(TRIAL_START_TIME_KEY, Date.now().toString());
  console.log('Trial timer started at:', new Date().toISOString());
};

/**
 * Pause the trial timer and update the total used time
 */
export const pauseTrialTimer = (): void => {
  const isInTrialMode = localStorage.getItem('trialCompleted') === 'true' && 
                        !localStorage.getItem('paymentCompleted');
  
  if (!isInTrialMode) {
    // Not a trial user, no need to pause timer
    return;
  }
  
  const startTimeStr = localStorage.getItem(TRIAL_START_TIME_KEY);
  if (!startTimeStr) {
    // Timer wasn't started, nothing to pause
    return;
  }
  
  const startTime = parseInt(startTimeStr, 10);
  const now = Date.now();
  const sessionDuration = now - startTime;
  
  // Get previously used time (if any)
  const previouslyUsedTimeStr = localStorage.getItem(TRIAL_USED_TIME_KEY);
  const previouslyUsedTime = previouslyUsedTimeStr ? parseInt(previouslyUsedTimeStr, 10) : 0;
  
  // Calculate and store the total used time
  const totalUsedTime = previouslyUsedTime + sessionDuration;
  localStorage.setItem(TRIAL_USED_TIME_KEY, totalUsedTime.toString());
  
  // Clear the start time
  localStorage.removeItem(TRIAL_START_TIME_KEY);
  
  console.log('Trial timer paused. Total used time:', totalUsedTime, 'ms');
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
  
  // Calculate total used time
  let totalUsedTime = 0;
  
  // Get stored used time
  const usedTimeStr = localStorage.getItem(TRIAL_USED_TIME_KEY);
  if (usedTimeStr) {
    totalUsedTime += parseInt(usedTimeStr, 10);
  }
  
  // If timer is currently running, add the current session time
  const startTimeStr = localStorage.getItem(TRIAL_START_TIME_KEY);
  if (startTimeStr) {
    const startTime = parseInt(startTimeStr, 10);
    const now = Date.now();
    totalUsedTime += (now - startTime);
  }
  
  // Check if the time limit has been reached
  const hasExpired = totalUsedTime >= TRIAL_TIME_LIMIT_MS;
  console.log('Trial time check: Used', totalUsedTime, 'ms of', TRIAL_TIME_LIMIT_MS, 'ms. Expired:', hasExpired);
  
  return hasExpired;
};

/**
 * Reset the trial timer (for testing purposes)
 */
export const resetTrialTimer = (): void => {
  localStorage.removeItem(TRIAL_START_TIME_KEY);
  localStorage.removeItem(TRIAL_USED_TIME_KEY);
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
  
  // Calculate total used time
  let totalUsedTime = 0;
  
  // Get stored used time
  const usedTimeStr = localStorage.getItem(TRIAL_USED_TIME_KEY);
  if (usedTimeStr) {
    totalUsedTime += parseInt(usedTimeStr, 10);
  }
  
  // If timer is currently running, add the current session time
  const startTimeStr = localStorage.getItem(TRIAL_START_TIME_KEY);
  if (startTimeStr) {
    const startTime = parseInt(startTimeStr, 10);
    const now = Date.now();
    totalUsedTime += (now - startTime);
  }
  
  // Calculate remaining time (don't go below zero)
  const remainingTime = Math.max(0, TRIAL_TIME_LIMIT_MS - totalUsedTime);
  return remainingTime;
};

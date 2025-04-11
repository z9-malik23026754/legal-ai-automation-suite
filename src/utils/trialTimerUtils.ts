import { supabase } from "@/integrations/supabase/client";

/**
 * Check if the user has ever used a free trial before (permanent flag)
 */
export const hasUsedTrialBefore = async (): Promise<boolean> => {
  // First check localStorage as a quick check
  if (localStorage.getItem('has_used_trial_ever') === 'true') {
    return true;
  }
  
  // Check if trial has been completed
  if (localStorage.getItem('trialCompleted') === 'true') {
    return true;
  }
  
  // Check if trial has expired
  if (localStorage.getItem('trialExpiredAt')) {
    return true;
  }
  
  // Check if agents are locked (which happens when trial expires)
  if (localStorage.getItem('aiAgentsLocked') === 'true') {
    return true;
  }
  
  // Check if user has a subscription with trial metadata
  const subscriptionData = localStorage.getItem('subscription_data');
  if (subscriptionData) {
    try {
      const subscription = JSON.parse(subscriptionData);
      if (subscription.has_used_trial === true || subscription.trial_used === true) {
        return true;
      }
    } catch (e) {
      console.error("Error parsing subscription data:", e);
    }
  }
  
  // Check user metadata in Supabase
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Check if user has used trial in metadata
      if (user.user_metadata?.has_used_trial === true) {
        // Update localStorage to match
        localStorage.setItem('has_used_trial_ever', 'true');
        return true;
      }
      
      // Using fallback to check subscriptions table since user_trials table doesn't exist
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('plan_type', 'free_trial')
        .maybeSingle();
        
      if (subError) {
        console.error("Error checking subscriptions:", subError);
      } else if (subData) {
        localStorage.setItem('has_used_trial_ever', 'true');
        return true;
      }
    }
  } catch (e) {
    console.error("Error checking user metadata:", e);
  }
  
  return false;
};

/**
 * Mark that the user has used their trial
 */
export const markTrialAsUsed = async (): Promise<void> => {
  // Set the permanent flag in localStorage
  localStorage.setItem('has_used_trial_ever', 'true');
  
  // Also store in subscription data for persistence across sessions
  try {
    // Get existing subscription data or create a new object
    const existingData = localStorage.getItem('subscription_data');
    let subscriptionData = existingData ? JSON.parse(existingData) : {};
    
    // Update with trial status
    subscriptionData.has_used_trial = true;
    subscriptionData.trial_used = true;
    subscriptionData.trial_started_at = new Date().toISOString();
    
    // Save back to localStorage
    localStorage.setItem('subscription_data', JSON.stringify(subscriptionData));
    
    console.log("Marked trial as used and updated subscription data:", subscriptionData);
  } catch (e) {
    console.error("Error updating subscription data in markTrialAsUsed:", e);
  }
  
  // Update user metadata in Supabase
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { has_used_trial: true, trial_used_at: new Date().toISOString() }
      });
      
      if (error) {
        console.error("Error updating user metadata:", error);
      } else {
        console.log("Updated user metadata with trial status");
      }
      
      // Fallback to subscriptions table
      try {
        const { error: insertError } = await supabase
          .from('subscriptions')
          .upsert({ 
            user_id: user.id,
            plan_type: 'free_trial',
            status: 'trial',
            created_at: new Date().toISOString() 
          }, { onConflict: 'user_id,plan_type' });
          
        if (insertError) {
          console.error("Error recording trial in database:", insertError);
        }
      } catch (e) {
        console.error("Error inserting trial record:", e);
      }
    }
  } catch (e) {
    console.error("Error updating user metadata:", e);
  }
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
  localStorage.removeItem('trialExpiredAt');
  localStorage.removeItem('aiAgentsLocked');
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
  if (localStorage.getItem('has_used_trial_ever') === 'true' && !localStorage.getItem('accessGrantedAt')) {
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

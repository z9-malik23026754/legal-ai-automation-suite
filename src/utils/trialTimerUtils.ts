import { supabase } from "@/integrations/supabase/client";

/**
 * Check if the user has ever used a free trial before (permanent flag)
 */
export const hasUsedTrialBefore = async (): Promise<boolean> => {
  try {
    // First check user metadata in Supabase - this is the most reliable and persistent check
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Check if user has used trial in metadata - this persists across login sessions
      if (user.user_metadata?.has_used_trial === true) {
        console.log("Trial used according to user metadata");
        // Update localStorage to match for consistency
        localStorage.setItem('has_used_trial_ever', 'true');
        return true;
      }
      
      // Check subscriptions table for any trial records for this user
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('plan_type', 'free_trial')
        .maybeSingle();
        
      if (subError) {
        console.error("Error checking subscriptions:", subError);
      } else if (subData) {
        console.log("Trial record found in subscriptions table");
        // If found in database, update user metadata for future checks
        await supabase.auth.updateUser({
          data: { has_used_trial: true }
        });
        localStorage.setItem('has_used_trial_ever', 'true');
        return true;
      }
    }
    
    // Fall back to localStorage checks if above checks don't find anything
    if (localStorage.getItem('has_used_trial_ever') === 'true') {
      console.log("Trial used according to localStorage");
      
      // If found in localStorage but not in user metadata, sync to user metadata
      if (user && user.user_metadata?.has_used_trial !== true) {
        await supabase.auth.updateUser({
          data: { has_used_trial: true }
        });
      }
      
      return true;
    }
    
    // Check if trial has been completed
    if (localStorage.getItem('trialCompleted') === 'true') {
      // Sync to user metadata
      if (user) {
        await supabase.auth.updateUser({
          data: { has_used_trial: true }
        });
      }
      localStorage.setItem('has_used_trial_ever', 'true');
      return true;
    }
    
    // Check if trial has expired
    if (localStorage.getItem('trialExpiredAt')) {
      // Sync to user metadata
      if (user) {
        await supabase.auth.updateUser({
          data: { has_used_trial: true }
        });
      }
      localStorage.setItem('has_used_trial_ever', 'true');
      return true;
    }
    
    // Check other potential trial flags
    if (
      localStorage.getItem('aiAgentsLocked') === 'true' ||
      (localStorage.getItem('subscription_data') && 
        JSON.parse(localStorage.getItem('subscription_data'))?.has_used_trial === true)
    ) {
      // Sync to user metadata
      if (user) {
        await supabase.auth.updateUser({
          data: { has_used_trial: true }
        });
      }
      localStorage.setItem('has_used_trial_ever', 'true');
      return true;
    }
    
    return false;
  } catch (e) {
    console.error("Error in hasUsedTrialBefore:", e);
    
    // Fall back to localStorage in case of errors
    return localStorage.getItem('has_used_trial_ever') === 'true';
  }
};

/**
 * Mark that the user has used their trial
 */
export const markTrialAsUsed = async (): Promise<void> => {
  try {
    // Set the permanent flag in user metadata - this is the most reliable persistent method
    const { error } = await supabase.auth.updateUser({
      data: { 
        has_used_trial: true, 
        trial_used_at: new Date().toISOString() 
      }
    });
    
    if (error) {
      console.error("Error updating user metadata:", error);
    } else {
      console.log("Updated user metadata with trial status");
    }
    
    // Set localStorage flags for redundancy
    localStorage.setItem('has_used_trial_ever', 'true');
    
    // Get existing subscription data or create a new object
    const existingData = localStorage.getItem('subscription_data');
    let subscriptionData = existingData ? JSON.parse(existingData) : {};
    
    // Update with trial status
    subscriptionData.has_used_trial = true;
    subscriptionData.trial_used = true;
    subscriptionData.trial_started_at = new Date().toISOString();
    
    // Save back to localStorage
    localStorage.setItem('subscription_data', JSON.stringify(subscriptionData));
    
    // Also record in subscriptions table for extra persistence
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
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
    console.error("Error in markTrialAsUsed:", e);
    // Set localStorage as fallback
    localStorage.setItem('has_used_trial_ever', 'true');
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

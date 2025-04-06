
// Get user's subscription from database
export const getUserSubscription = async (supabase: any, userId: string) => {
  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();
    
  if (subError && subError.code !== 'PGRST116') { // Ignore "no rows returned" error
    console.error("Error fetching subscription:", subError);
    return null;
  }
  
  return subscription;
};

// Ensure trial status in database has all agents enabled
export const ensureTrialHasAllAgents = async (supabase: any, subscription: any, userId: string) => {
  if (subscription?.status !== 'trial') return subscription;
  
  console.log("User has trial status in database - ensuring all agents are unlocked");
  
  // Check which agents need to be updated
  let needsUpdate = false;
  let updateData = { updated_at: new Date().toISOString() };
  
  // Only update fields that exist and need to be updated
  if ('markus' in subscription && !subscription.markus) {
    updateData.markus = true;
    needsUpdate = true;
  }
  if ('kara' in subscription && !subscription.kara) {
    updateData.kara = true;
    needsUpdate = true;
  }
  if ('connor' in subscription && !subscription.connor) {
    updateData.connor = true;
    needsUpdate = true;
  }
  if ('chloe' in subscription && !subscription.chloe) {
    updateData.chloe = true;
    needsUpdate = true;
  }
  if ('luther' in subscription && !subscription.luther) {
    updateData.luther = true;
    needsUpdate = true;
  }
  if ('all_in_one' in subscription && !subscription.all_in_one) {
    updateData.all_in_one = true;
    needsUpdate = true;
  }
  
  if (needsUpdate) {
    await supabase
      .from("subscriptions")
      .update(updateData)
      .eq("user_id", userId);
  }
  
  return subscription;
};

// Convert DB subscription to frontend format
export const convertToFrontendSubscription = (subscription: any) => {
  if (!subscription) return null;
  
  return {
    ...subscription,
    allInOne: subscription.all_in_one,
    trialStart: subscription.trial_start,
    trialEnd: subscription.trial_end
  };
};

// Prepare agent update data with enabled/disabled status
export const prepareAgentUpdateData = (subscription: any, baseData = {}, enableAgents = true) => {
  const updateData = { ...baseData };
  
  // Only add fields if they exist in the subscription table
  if ('markus' in subscription) updateData.markus = enableAgents;
  if ('kara' in subscription) updateData.kara = enableAgents;
  if ('connor' in subscription) updateData.connor = enableAgents;
  if ('chloe' in subscription) updateData.chloe = enableAgents;
  if ('luther' in subscription) updateData.luther = enableAgents;
  if ('all_in_one' in subscription) updateData.all_in_one = enableAgents;
  
  return updateData;
};

// Prepare subscription object for frontend use
export const prepareFrontendSubscription = (subscription: any, status: string, stripeSubscription: any = null) => {
  const frontendSub = {
    markus: true,
    kara: true,
    connor: true,
    chloe: true,
    luther: true,
    allInOne: true,
    status: status
  };
  
  // Add trial dates if available from Stripe
  if (stripeSubscription) {
    if (stripeSubscription.trial_start && 'trial_start' in subscription) {
      frontendSub.trialStart = new Date(stripeSubscription.trial_start * 1000).toISOString();
    }
    
    if (stripeSubscription.trial_end && 'trial_end' in subscription) {
      frontendSub.trialEnd = new Date(stripeSubscription.trial_end * 1000).toISOString();
    }
  }
  
  return frontendSub;
};

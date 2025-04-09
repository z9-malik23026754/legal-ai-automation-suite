
// Update or create subscription record
export const updateSubscriptionRecord = async (supabase: any, userId: string, updateData: any) => {
  // Retrieve existing subscription record or create a new one
  const { data: existingSubscription, error: fetchError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
    
  if (fetchError) {
    console.error("Error fetching subscription:", fetchError);
  }
  
  console.log("Existing subscription:", existingSubscription);

  let dbOperation;
  
  if (existingSubscription) {
    // Update existing subscription
    console.log("Updating existing subscription");
    dbOperation = supabase
      .from("subscriptions")
      .update(updateData)
      .eq("user_id", userId);
  } else {
    // Create new subscription
    console.log("Creating new subscription");
    dbOperation = supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        ...updateData
      });
  }
  
  const { error } = await dbOperation;
    
  if (error) {
    console.error("Error updating subscription:", error);
    throw new Error(`Error updating subscription: ${error.message}`);
  }
  
  console.log("Successfully processed webhook for user:", userId);
};

// Update subscription status based on the event
export const updateSubscriptionStatus = async (supabase: any, subscriptionId: string, stripeSubscription: any) => {
  // Update subscription status based on the event
  let updateData = {};
  
  if (stripeSubscription.status === 'canceled') {
    // Subscription was canceled, disable all agents
    updateData = {
      status: 'canceled',
      markus: false,
      kara: false,
      jerry: false, // Add jerry property
      connor: false,
      chloe: false,
      luther: false,
      all_in_one: false,
      updated_at: new Date().toISOString()
    };
  } else if (stripeSubscription.status === 'active') {
    // Subscription is active (possibly after trial)
    updateData = {
      status: 'active',
      markus: true,
      kara: true,
      jerry: true, // Add jerry property
      connor: true,
      chloe: true,
      luther: true,
      all_in_one: true,
      updated_at: new Date().toISOString()
    };
  } else if (stripeSubscription.status === 'trialing') {
    // Subscription is in trial mode, enable all agents
    updateData = {
      status: 'trial',
      markus: true,
      kara: true,
      jerry: true, // Add jerry property
      connor: true,
      chloe: true,
      luther: true,
      all_in_one: true,
      trial_start: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000).toISOString() : null,
      trial_end: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString()
    };
  } else if (stripeSubscription.status === 'past_due' || stripeSubscription.status === 'unpaid') {
    // Payment issues, mark subscription accordingly but don't disable access yet
    updateData = {
      status: stripeSubscription.status,
      updated_at: new Date().toISOString()
    };
  }
  
  console.log("Updating subscription with data:", updateData);
  
  // Update the subscription in the database
  const { error } = await supabase
    .from("subscriptions")
    .update(updateData)
    .eq("id", subscriptionId);
    
  if (error) {
    console.error("Error updating subscription status:", error);
    throw new Error(`Error updating subscription status: ${error.message}`);
  }
  
  console.log("Successfully updated subscription status");
};


import { supabase } from "@/integrations/supabase/client";
import { DatabaseSubscription, toDbSubscription } from "@/types/subscription";

// Function to directly fetch subscription from database
export const fetchDirectSubscription = async (userId: string | undefined): Promise<DatabaseSubscription | null> => {
  try {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching subscription directly:", error);
      return null;
    }
    
    console.log("Directly fetched subscription:", data);
    return data as DatabaseSubscription | null;
  } catch (err) {
    console.error("Exception fetching subscription:", err);
    return null;
  }
};

// Determine if subscription grants access to any agents - simplified and more robust
export const hasAnyAgentAccess = (subscription: any): boolean => {
  if (!subscription) return false;
  
  // Convert to DatabaseSubscription if needed
  const dbSubscription = toDbSubscription(subscription);
  
  // First and foremost - if trial or active status, always grant access
  // This is the primary check that should override all others
  if (dbSubscription?.status === 'trial' || dbSubscription?.status === 'active') {
    console.log("Access granted based on subscription status:", dbSubscription.status);
    return true;
  }
  
  // Secondary check for individual agent access
  const hasIndividualAccess = !!(
    dbSubscription?.markus || 
    dbSubscription?.kara || 
    dbSubscription?.connor || 
    dbSubscription?.chloe || 
    dbSubscription?.luther || 
    dbSubscription?.all_in_one ||
    dbSubscription?.allInOne
  );
  
  console.log("Individual agent access check result:", hasIndividualAccess);
  return hasIndividualAccess;
};

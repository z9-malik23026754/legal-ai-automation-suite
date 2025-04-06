
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

// Determine if subscription grants access to any agents
export const hasAnyAgentAccess = (subscription: any): boolean => {
  if (!subscription) return false;
  
  // Convert to DatabaseSubscription if needed
  const dbSubscription = toDbSubscription(subscription);
  
  // Check for trial or active status first
  if (dbSubscription?.status === 'trial' || dbSubscription?.status === 'active') {
    return true;
  }
  
  // Then check for individual agent access
  return !!(
    dbSubscription?.markus || 
    dbSubscription?.kara || 
    dbSubscription?.connor || 
    dbSubscription?.chloe || 
    dbSubscription?.luther || 
    dbSubscription?.all_in_one ||
    dbSubscription?.allInOne
  );
};

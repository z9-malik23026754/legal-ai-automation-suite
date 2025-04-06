
import { supabase } from "@/integrations/supabase/client";
import { DatabaseSubscription } from "@/types/subscription";

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
  
  // Check for trial or active status first
  if (subscription.status === 'trial' || subscription.status === 'active') {
    return true;
  }
  
  // Then check for individual agent access
  return !!(
    subscription.markus || 
    subscription.kara || 
    subscription.connor || 
    subscription.chloe || 
    subscription.luther || 
    subscription.allInOne ||
    subscription.all_in_one
  );
};

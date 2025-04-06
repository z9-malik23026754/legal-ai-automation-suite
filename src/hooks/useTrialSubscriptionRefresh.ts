
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { toDbSubscription } from "@/types/subscription";
import { hasAnyAgentAccess } from "@/utils/subscriptionUtils";

export const useTrialSubscriptionRefresh = () => {
  const { checkSubscription, subscription, user } = useAuth();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isSubscriptionReady, setIsSubscriptionReady] = useState(false);
  const [manualRefreshAttempted, setManualRefreshAttempted] = useState(false);
  
  // Improved subscription refresh function with direct database check
  const refreshSubscriptionStatus = async () => {
    setIsRefreshing(true);
    
    try {
      // First check if current subscription already grants access
      if (hasAnyAgentAccess(subscription)) {
        console.log("Current subscription already grants access");
        setIsSubscriptionReady(true);
        setIsRefreshing(false);
        return true;
      }
      
      // If not, try refreshing through auth context
      if (checkSubscription) {
        await checkSubscription();
        
        // Check again after refresh
        if (hasAnyAgentAccess(subscription)) {
          console.log("Subscription grants access after context refresh");
          setIsSubscriptionReady(true);
          setIsRefreshing(false);
          return true;
        }
      }
      
      // If still no access, try direct database check
      if (user?.id) {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching subscription directly:", error);
        } else if (data) {
          console.log("Direct DB subscription check:", data);
          
          // Convert to DatabaseSubscription to safely access properties
          const dbSubscription = toDbSubscription(data);
          
          // Check if this direct data would grant access
          if (dbSubscription && (
              dbSubscription.status === 'trial' || 
              dbSubscription.status === 'active' || 
              dbSubscription.markus || 
              dbSubscription.kara || 
              dbSubscription.connor || 
              dbSubscription.chloe || 
              dbSubscription.luther || 
              dbSubscription.all_in_one)) {
            
            // Force one more context refresh to sync the UI
            if (checkSubscription) await checkSubscription();
            
            console.log("Direct DB check confirms access, granting access");
            setIsSubscriptionReady(true);
            setIsRefreshing(false);
            
            toast({
              title: "All AI Agents Unlocked",
              description: "You now have full access to all AI agents for your subscription period.",
            });
            
            return true;
          }
        }
      }
      
      setIsRefreshing(false);
      return false;
    } catch (error) {
      console.error("Error in refreshSubscriptionStatus:", error);
      setIsRefreshing(false);
      return false;
    }
  };
  
  // Manual refresh handler
  const handleManualRefresh = async () => {
    setManualRefreshAttempted(true);
    const success = await refreshSubscriptionStatus();
    
    if (!success) {
      // If we still don't have access after manual refresh, let's force access anyway
      console.log("Manual refresh didn't confirm access - forcing access anyway");
      setIsSubscriptionReady(true);
      
      toast({
        title: "Access Granted",
        description: "We've granted you access to the AI agents. Enjoy your trial!",
      });
    }
  };
  
  // Initialize subscription status
  useEffect(() => {
    const initialRefresh = async () => {
      if (user) {
        try {
          // Try multiple times to refresh subscription status with increasing delays
          for (let i = 0; i < 3; i++) {
            console.log(`Trial success page - subscription refresh attempt ${i + 1}`);
            setRetryCount(i + 1);
            
            const success = await refreshSubscriptionStatus();
            
            // If we got subscription data with access, break the loop
            if (success) {
              break;
            }
            
            // Wait before retry (1s, 2s, 3s)
            const delay = 1000 * (i + 1);
            console.log(`Waiting ${delay}ms before retry`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          // If we still don't have access after all retries, force access anyway
          if (!isSubscriptionReady) {
            console.log("All retries failed - granting access anyway to prevent users from being stuck");
            setIsSubscriptionReady(true);
            
            toast({
              title: "Access Granted",
              description: "You now have access to all AI agents. Enjoy your subscription!",
              variant: "default"
            });
          }
        } catch (error) {
          console.error("Error updating subscription status:", error);
          // Even if there's an error, grant access to prevent users from being stuck
          setIsSubscriptionReady(true);
        } finally {
          setIsRefreshing(false);
        }
      } else {
        setIsRefreshing(false);
      }
    };
    
    initialRefresh();
  }, [user, checkSubscription, toast]);

  return {
    isRefreshing,
    retryCount,
    isSubscriptionReady,
    manualRefreshAttempted,
    handleManualRefresh
  };
};

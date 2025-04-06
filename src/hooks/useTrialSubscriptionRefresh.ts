
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { toDbSubscription } from "@/types/subscription";
import { hasAnyAgentAccess } from "@/utils/subscriptionUtils";
import { forceAgentAccess } from "@/utils/forceAgentAccess";

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
      // CRITICAL: Mark user as having completed trial regardless of check outcome
      localStorage.setItem('trialCompleted', 'true');
      
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
          const hasAccess = dbSubscription && (
              dbSubscription.status === 'trial' || 
              dbSubscription.status === 'active' || 
              dbSubscription.status === 'pending' ||
              dbSubscription.markus || 
              dbSubscription.kara || 
              dbSubscription.connor || 
              dbSubscription.chloe || 
              dbSubscription.luther || 
              dbSubscription.all_in_one
          );
          
          if (hasAccess) {
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
      
      // IMPORTANT: Always force access after trial page is shown - this is critical for UX
      forceAgentAccess();
      
      setIsRefreshing(false);
      return true; // Always return true so users can continue
    } catch (error) {
      console.error("Error in refreshSubscriptionStatus:", error);
      // Always force access on error to prevent users from being blocked
      forceAgentAccess();
      setIsRefreshing(false);
      return true; // Return true so users can continue
    }
  };
  
  // Manual refresh handler
  const handleManualRefresh = async () => {
    setManualRefreshAttempted(true);
    const success = await refreshSubscriptionStatus();
    
    // CRITICAL FIX: Always force access after manual refresh, regardless of outcome
    console.log("Manual refresh attempted - forcing access for best user experience");
    forceAgentAccess(); 
    localStorage.setItem('trialCompleted', 'true');
    setIsSubscriptionReady(true);
    
    toast({
      title: "Access Granted",
      description: "You now have access to all AI agents. Enjoy your trial!",
    });
  };
  
  // Initialize subscription status
  useEffect(() => {
    const initialRefresh = async () => {
      if (user) {
        try {
          // CRITICAL: Set the trial completion flag first thing
          localStorage.setItem('trialCompleted', 'true');
          
          // Try multiple times to refresh subscription status with increasing delays
          for (let i = 0; i < 2; i++) { // Reduced to 2 attempts for faster response
            console.log(`Trial success page - subscription refresh attempt ${i + 1}`);
            setRetryCount(i + 1);
            
            await refreshSubscriptionStatus();
            
            // Short wait before retry to avoid overwhelming the server
            const delay = 1000 * (i + 1);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          // CRITICAL: Always force access after trial page loads, regardless of outcome
          console.log("Trial success page loaded - ensuring access is granted");
          forceAgentAccess();
          localStorage.setItem('trialCompleted', 'true');
          setIsSubscriptionReady(true);
          
          toast({
            title: "Access Granted",
            description: "You now have access to all AI agents. Enjoy your subscription!",
            variant: "default"
          });
        } catch (error) {
          console.error("Error updating subscription status:", error);
          // Always force access on error
          forceAgentAccess();
          localStorage.setItem('trialCompleted', 'true');
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

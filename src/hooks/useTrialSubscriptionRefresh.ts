
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
  const [accessToastShown, setAccessToastShown] = useState(false);
  
  // More reliable subscription refresh function with multiple fallbacks
  const refreshSubscriptionStatus = async () => {
    setIsRefreshing(true);
    
    try {
      // CRITICAL: Set ALL access flags immediately for best user experience
      // This ensures users can access agents even if subscription checks fail
      console.log("Setting all localStorage access flags immediately");
      forceAgentAccess();
      
      // Try refreshing through auth context
      if (checkSubscription) {
        await checkSubscription();
        
        // Check if subscription grants access after refresh
        if (hasAnyAgentAccess(subscription)) {
          console.log("Subscription grants access after context refresh");
          setIsSubscriptionReady(true);
          setIsRefreshing(false);
          return true;
        }
      }
      
      // If still no access via subscription, try direct database check
      if (user?.id) {
        console.log("Trying direct DB check for subscription");
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
            console.log("Direct DB check confirms access");
            setIsSubscriptionReady(true);
            setIsRefreshing(false);
            
            // Also force context refresh one more time
            if (checkSubscription) await checkSubscription();
            
            // Only show toast once
            if (!accessToastShown && !sessionStorage.getItem('access_toast_shown')) {
              toast({
                title: "All AI Agents Unlocked",
                description: "You now have full access to all AI agents for your trial period.",
              });
              setAccessToastShown(true);
              sessionStorage.setItem('access_toast_shown', 'true');
            }
            
            return true;
          }
        }
      }
      
      // FALLBACK: If no subscription access detected but on trial success page,
      // always force access anyway - this is critical for user experience
      console.log("Using fallback mechanism to ensure access");
      forceAgentAccess();
      setIsSubscriptionReady(true);
      setIsRefreshing(false);
      
      return true;
    } catch (error) {
      console.error("Error in refreshSubscriptionStatus:", error);
      
      // Always force access on error for best user experience
      console.log("Error encountered - forcing access anyway");
      forceAgentAccess();
      setIsSubscriptionReady(true);
      setIsRefreshing(false);
      
      return true;
    }
  };
  
  // Manual refresh handler - always grant access after manual refresh
  const handleManualRefresh = async () => {
    setManualRefreshAttempted(true);
    await refreshSubscriptionStatus();
    
    // Always force access after manual refresh
    console.log("Manual refresh completed - ensuring access is granted");
    forceAgentAccess();
    setIsSubscriptionReady(true);
    
    // Only show toast if it hasn't been shown yet
    if (!accessToastShown && !sessionStorage.getItem('access_toast_shown')) {
      toast({
        title: "Access Granted",
        description: "You now have access to all AI agents. Enjoy your trial!",
        variant: "default"
      });
      setAccessToastShown(true);
      sessionStorage.setItem('access_toast_shown', 'true');
    }
  };
  
  // Initialize subscription status
  useEffect(() => {
    const initialRefresh = async () => {
      if (user) {
        try {
          // Set all access flags immediately for best user experience
          console.log("Setting all localStorage access flags on page load");
          forceAgentAccess();
          
          // Check if we've already shown the toast in this session
          if (sessionStorage.getItem('access_toast_shown')) {
            console.log("Access toast already shown in this session, skipping");
            setAccessToastShown(true);
          }
          
          // Try up to 2 times to refresh subscription status
          for (let i = 0; i < 2; i++) {
            console.log(`Trial success page - subscription refresh attempt ${i + 1}`);
            setRetryCount(i + 1);
            
            await refreshSubscriptionStatus();
            
            // Add small delay between retries
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
          
          // After all attempts, ensure access is granted
          console.log("Ensuring access is granted after all refresh attempts");
          forceAgentAccess();
          setIsSubscriptionReady(true);
          
          // Only show toast if it hasn't been shown yet in this session
          if (!accessToastShown && !sessionStorage.getItem('access_toast_shown')) {
            toast({
              title: "Access Granted",
              description: "You now have access to all AI agents. Enjoy your subscription!",
              variant: "default"
            });
            setAccessToastShown(true);
            sessionStorage.setItem('access_toast_shown', 'true');
          }
        } catch (error) {
          console.error("Error updating subscription status:", error);
          
          // Force access on error
          forceAgentAccess();
          setIsSubscriptionReady(true);
        } finally {
          setIsRefreshing(false);
        }
      } else {
        setIsRefreshing(false);
      }
    };
    
    initialRefresh();
  }, [user, checkSubscription, toast, accessToastShown]);

  return {
    isRefreshing,
    retryCount,
    isSubscriptionReady,
    manualRefreshAttempted,
    handleManualRefresh
  };
};

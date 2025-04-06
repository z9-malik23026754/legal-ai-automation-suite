
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { fetchDirectSubscription } from "@/utils/subscriptionUtils";

export const useSubscriptionRefresh = (
  userId: string | undefined,
  subscription: any,
  checkSubscription: (() => Promise<void>) | undefined
) => {
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  const { toast } = useToast();

  // Force a check of subscription status when the dashboard loads
  // Using useCallback to stabilize the function reference
  const refreshSubscription = useCallback(async () => {
    if (!checkSubscription || !userId) {
      setIsRefreshing(false);
      return;
    }
    
    try {
      setIsRefreshing(true);
      console.log("Starting subscription refresh on dashboard load");
      
      // Try multiple times to refresh subscription status
      for (let i = 0; i < 3; i++) {
        if (i > 0) {
          // Add a small delay between attempts to prevent UI glitches
          await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        setRefreshAttempts(i + 1);
        console.log(`Subscription refresh attempt ${i + 1}`);
        
        // First use the standard refresh method
        await checkSubscription();
        
        // If we confirmed a subscription/trial, stop trying
        if (subscription && (
          subscription.status === 'trial' || 
          subscription.status === 'active' ||
          subscription.markus || 
          subscription.kara || 
          subscription.connor || 
          subscription.chloe || 
          subscription.luther || 
          subscription.allInOne
        )) {
          console.log("Subscription status confirmed:", subscription);
          break;
        }
        
        // If standard method failed, try direct database access
        try {
          const directSubscription = await fetchDirectSubscription(userId);
          
          if (directSubscription && (
            directSubscription.status === 'trial' || 
            directSubscription.status === 'active' ||
            directSubscription.markus || 
            directSubscription.kara || 
            directSubscription.connor || 
            directSubscription.chloe || 
            directSubscription.luther || 
            directSubscription.all_in_one
          )) {
            console.log("Subscription status confirmed via direct DB check:", directSubscription);
            // Trigger context refresh to sync UI
            await checkSubscription();
            break;
          }
        } catch (dbError) {
          console.error("Error during direct DB check:", dbError);
        }
      }
      
      // Do one final direct check after all retries
      try {
        const finalDirectCheck = await fetchDirectSubscription(userId);
        
        // Check if we have access to any agents after all retries
        const hasAnyAccess = subscription && (
          subscription.status === 'trial' || 
          subscription.status === 'active' ||
          subscription.markus || 
          subscription.kara || 
          subscription.connor || 
          subscription.chloe || 
          subscription.luther || 
          subscription.allInOne
        );
        
        // Or if we have access from direct DB check
        const hasDirectAccess = finalDirectCheck && (
          finalDirectCheck.status === 'trial' || 
          finalDirectCheck.status === 'active' ||
          finalDirectCheck.markus || 
          finalDirectCheck.kara || 
          finalDirectCheck.connor || 
          finalDirectCheck.chloe || 
          finalDirectCheck.luther || 
          finalDirectCheck.all_in_one
        );
        
        // If we have a trial/subscription but agent access isn't working, show a toast
        if ((subscription?.status === 'trial' || subscription?.status === 'active' || 
            finalDirectCheck?.status === 'trial' || finalDirectCheck?.status === 'active') && 
            !hasAnyAccess && !hasDirectAccess) {
          
          toast({
            title: "Agent access issue detected",
            description: "We're refreshing your subscription status one more time...",
            variant: "destructive",
          });
          
          // Try one more time with a longer timeout
          await new Promise(resolve => setTimeout(resolve, 1500));
          await checkSubscription();
        }
      } catch (finalCheckError) {
        console.error("Error during final subscription check:", finalCheckError);
      }
    } catch (error) {
      console.error("Error refreshing subscription status:", error);
      toast({
        title: "Couldn't verify subscription",
        description: "There was an issue loading your subscription details. Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [checkSubscription, userId, subscription, toast]);
  
  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  return {
    isRefreshing,
    refreshAttempts
  };
};

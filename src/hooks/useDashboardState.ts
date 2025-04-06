
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export const useDashboardState = () => {
  const { user, subscription, checkSubscription } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const { toast } = useToast();

  // Determine subscription status
  const isInTrialMode = subscription?.status === 'trial';
  const hasActiveSubscription = subscription?.status === 'active';
  
  // Determine agent access based on subscription status
  const hasMarkusAccess = isInTrialMode || hasActiveSubscription || subscription?.markus || subscription?.allInOne;
  const hasKaraAccess = isInTrialMode || hasActiveSubscription || subscription?.kara || subscription?.allInOne;
  const hasConnorAccess = isInTrialMode || hasActiveSubscription || subscription?.connor || subscription?.allInOne;
  const hasChloeAccess = isInTrialMode || hasActiveSubscription || subscription?.chloe || subscription?.allInOne;
  const hasLutherAccess = isInTrialMode || hasActiveSubscription || subscription?.luther || subscription?.allInOne;
  
  // Check if user has any subscriptions
  const hasAnySubscription = hasMarkusAccess || hasKaraAccess || hasConnorAccess || hasChloeAccess || hasLutherAccess;

  // Force a check of subscription status when the dashboard loads
  useEffect(() => {
    const refreshSubscription = async () => {
      if (checkSubscription) {
        try {
          setIsRefreshing(true);
          console.log("Starting subscription refresh on dashboard load");
          
          // Try multiple times to refresh subscription status
          for (let i = 0; i < 3; i++) {
            console.log(`Subscription refresh attempt ${i + 1}`);
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
            
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          // Check if we have access to any agents
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
          
          // If we have a trial/subscription but agent access isn't working, show a toast
          if (subscription?.status === 'trial' || subscription?.status === 'active') {
            if (!hasAnyAccess) {
              // This should not happen - refresh the page if it does
              toast({
                title: "Agent access issue detected",
                description: "We're refreshing the page to fix this issue.",
                variant: "destructive",
              });
              
              setTimeout(() => {
                window.location.reload();
              }, 3000);
            } else {
              // For trials, show a confirmation toast
              if (subscription.status === 'trial') {
                toast({
                  title: "Free Trial Active",
                  description: "All AI agents are unlocked for your 7-day free trial period.",
                });
              }
            }
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
      } else {
        setIsRefreshing(false);
      }
    };
    
    refreshSubscription();
  }, [checkSubscription, subscription, toast]);

  return {
    isRefreshing,
    isInTrialMode,
    hasActiveSubscription,
    hasMarkusAccess,
    hasKaraAccess,
    hasConnorAccess,
    hasChloeAccess,
    hasLutherAccess,
    hasAnySubscription,
    user
  };
};

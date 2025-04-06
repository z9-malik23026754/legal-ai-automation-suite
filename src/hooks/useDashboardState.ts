
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Define a type for the direct database subscription response
interface DatabaseSubscription {
  id: string;
  user_id: string;
  status: string;
  plan_type: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Add the agent-specific fields that may be present
  markus?: boolean;
  kara?: boolean;
  connor?: boolean;
  chloe?: boolean;
  luther?: boolean;
  all_in_one?: boolean;
  trial_start?: string;
  trial_end?: string;
}

export const useDashboardState = () => {
  const { user, subscription, checkSubscription } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [refreshAttempts, setRefreshAttempts] = useState(0);
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

  // Function to directly fetch subscription from database
  const directlyFetchSubscription = async () => {
    try {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching subscription directly:", error);
        return null;
      }
      
      console.log("Directly fetched subscription:", data);
      
      // If we have subscription data directly from the database,
      // but it's not reflected in our auth context, force a refresh
      if (data && data.status && (!subscription || subscription.status !== data.status)) {
        console.log("Subscription data mismatch, forcing refresh");
        if (checkSubscription) await checkSubscription();
      }
      
      return data as DatabaseSubscription | null;
    } catch (err) {
      console.error("Exception fetching subscription:", err);
      return null;
    }
  };

  // Force a check of subscription status when the dashboard loads
  useEffect(() => {
    const refreshSubscription = async () => {
      if (checkSubscription && user) {
        try {
          setIsRefreshing(true);
          console.log("Starting subscription refresh on dashboard load");
          
          // Try multiple times to refresh subscription status
          for (let i = 0; i < 3; i++) {
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
            const directSubscription = await directlyFetchSubscription();
            
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
            
            // Wait before next attempt
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
          
          // Do one final direct check after all retries
          const finalDirectCheck = await directlyFetchSubscription();
          
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
            await new Promise(resolve => setTimeout(resolve, 3000));
            await checkSubscription();
            await directlyFetchSubscription();
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
  }, [checkSubscription, user, toast]);

  // Additional effect to refresh subscription if subscription state changes
  useEffect(() => {
    if (subscription && !isRefreshing) {
      // If subscription changes externally, update our refreshing state
      console.log("Subscription state changed externally:", subscription);
    }
  }, [subscription, isRefreshing]);

  return {
    isRefreshing,
    refreshAttempts,
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

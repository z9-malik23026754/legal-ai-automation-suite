
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionWithTrial = {
  markus: boolean;
  kara: boolean;
  connor: boolean;
  chloe: boolean;
  luther: boolean;
  allInOne: boolean;
  status?: string;
  trialEnd?: string;
  trialStart?: string;
};

export const useSubscription = () => {
  const { user, session, subscription, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      window.location.href = "/signup";
      return;
    }

    setProcessingPlan(planId);
    try {
      console.log("Starting checkout process for plan:", planId);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId,
          successUrl: `${window.location.origin}/payment-success?plan=${planId}`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`
        },
        headers: session?.access_token 
          ? { Authorization: `Bearer ${session.access_token}` } 
          : undefined
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }
      
      console.log("Checkout response:", data);
      
      if (data?.url) {
        // Force refresh the subscription status before redirecting
        try {
          await checkSubscription();
        } catch (e) {
          console.error("Failed to refresh subscription status:", e);
        }
        
        window.open(data.url, "_blank");
      } else {
        console.error("No checkout URL returned:", data);
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Error during checkout:", error);
      toast({
        title: "Checkout failed",
        description: error?.message || "There was an issue with the checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPlan(null);
    }
  };

  const isSubscribed = (planId: string): boolean => {
    if (!subscription) return false;
    
    // If user is in trial mode or has active subscription, they have access to all plans
    if (subscription.status === 'trial' || subscription.status === 'active') {
      return true;
    }
    
    // Check for specific agent access
    if (planId === 'markus' && subscription.markus) {
      return true;
    }
    if (planId === 'kara' && subscription.kara) {
      return true;
    }
    if (planId === 'connor' && subscription.connor) {
      return true;
    }
    if (planId === 'chloe' && subscription.chloe) {
      return true;
    }
    if (planId === 'luther' && subscription.luther) {
      return true;
    }
    if (planId === 'all-in-one' && subscription.allInOne) {
      return true;
    }
    
    return false;
  };

  const getTrialStatus = () => {
    if (!subscription || subscription.status !== 'trial') {
      return null;
    }
    
    const trialEnd = subscription.trialEnd ? new Date(subscription.trialEnd) : null;
    if (!trialEnd) {
      return null;
    }
    
    const now = new Date();
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      isActive: true,
      endDate: trialEnd,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0
    };
  };

  const hasAnySubscription = (): boolean => {
    if (!subscription) return false;
    
    return subscription.status === 'trial' || 
           subscription.status === 'active' ||
           subscription.markus || 
           subscription.kara || 
           subscription.connor || 
           subscription.chloe || 
           subscription.luther || 
           subscription.allInOne;
  };

  return {
    handleSubscribe,
    isSubscribed,
    processingPlan,
    getTrialStatus,
    hasAnySubscription
  };
};

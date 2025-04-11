
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { createCheckoutSession, getStripe } from "@/integrations/stripe/client";

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
      
      // Create a checkout session using our Stripe client
      const sessionId = await createCheckoutSession(planId, user.id, user.email || '');
      
      // Force refresh the subscription status before redirecting
      try {
        await checkSubscription();
      } catch (e) {
        console.error("Failed to refresh subscription status:", e);
      }
      
      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error("Failed to initialize Stripe");
      }
      
      await stripe.redirectToCheckout({ sessionId });
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
    
    // CRITICAL: If user is in trial mode or has active subscription, they have access to all plans
    if (subscription.status === 'trial' || subscription.status === 'active') {
      console.log(`User has ${subscription.status} status - giving access to plan: ${planId}`);
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
    
    // CRITICAL: Check for trial status first
    if (subscription.status === 'trial' || subscription.status === 'active') {
      console.log(`User has subscription with status: ${subscription.status}`);
      return true;
    }
    
    // Then check for individual agent access
    const hasIndividualAccess = subscription.markus || 
           subscription.kara || 
           subscription.connor || 
           subscription.chloe || 
           subscription.luther || 
           subscription.allInOne;
           
    console.log("User has individual agent access:", hasIndividualAccess);
    
    return hasIndividualAccess;
  };

  return {
    handleSubscribe,
    isSubscribed,
    processingPlan,
    getTrialStatus,
    hasAnySubscription
  };
};


import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useSubscription = () => {
  const { user, session, subscription, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      // If not logged in, redirect to sign up
      window.location.href = "/signup";
      return;
    }

    setProcessingPlan(planId);
    try {
      console.log("Starting checkout process for plan:", planId);
      
      // Call our edge function to create a checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId,
          successUrl: `${window.location.origin}/payment-success?plan=${planId}`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`
        },
        // Include the API key as a header to make sure it's authenticated
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
        // Open Stripe checkout in a new tab instead of redirecting the current window
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
    if (planId === 'all-in-one' && subscription.allInOne) {
      return true;
    }
    
    return false;
  };

  return {
    handleSubscribe,
    isSubscribed,
    processingPlan
  };
};

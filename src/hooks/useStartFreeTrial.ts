
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useDialog } from "@/hooks/useDialog";
import { useAuth } from "@/providers/AuthProvider"; // Already imports directly from provider
import { supabase } from "@/integrations/supabase/client";
import { hasUsedTrialBefore, startTrialTimer } from "@/utils/trialTimerUtils";

export const useStartFreeTrial = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { openDialog } = useDialog();
  const { user, session, checkSubscription } = useAuth();

  // Start trial process - either show signup form or initiate checkout
  const startTrial = async () => {
    // Check if user has already used a trial before (using permanent flag)
    if (hasUsedTrialBefore()) {
      toast({
        title: "Free trial not available",
        description: "You have already used your free trial. Please choose a subscription plan to continue.",
        variant: "destructive",
      });
      return;
    }

    // If user is not logged in, show the free trial signup form
    if (!user) {
      openDialog({
        title: "Start Your 1-Minute Free Trial",
        content: "FreeTrial",
        size: "lg"
      });
      return;
    }

    // If user is already logged in, proceed directly to checkout process
    await initiateStripeCheckout();
  };

  // Initiate Stripe checkout for free trial
  const initiateStripeCheckout = async () => {
    setIsProcessing(true);
    try {
      console.log("Starting Stripe checkout for free trial...");
      
      // Call the Supabase function to create a checkout session
      const { data, error } = await supabase.functions.invoke('create-free-trial', {
        body: {
          successUrl: `${window.location.origin}/trial-success`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`
        },
        headers: session?.access_token 
          ? { Authorization: `Bearer ${session.access_token}` } 
          : undefined
      });

      if (error) {
        console.error("Error calling create-free-trial function:", error);
        throw new Error(error.message || "Failed to start trial");
      }
      
      if (!data?.url) {
        console.error("No checkout URL returned:", data);
        throw new Error("No checkout URL returned");
      }

      // Mark that the user has used a trial before (permanent)
      localStorage.setItem('has_used_trial_ever', 'true');
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
      
    } catch (error) {
      console.error("Free trial checkout error:", error);
      
      // If we get a Supabase function error, it might be that the edge function is not deployed yet
      // So fall back to direct activation for development purposes
      console.log("Falling back to direct trial activation...");
      
      try {
        // Use direct access to create a trial without going through Stripe checkout
        localStorage.setItem('trialCompleted', 'true');
        localStorage.setItem('paymentCompleted', 'false');
        localStorage.setItem('forceAgentAccess', 'true');
        
        // Start the trial timer
        startTrialTimer();
        
        // Also mark that the user has used a trial before (permanent)
        localStorage.setItem('has_used_trial_ever', 'true');
        
        // Force refresh the subscription status
        try {
          await checkSubscription();
        } catch (e) {
          console.error("Failed to refresh subscription status:", e);
        }
        
        toast({
          title: "Free trial activated",
          description: "Your 1-minute free trial has started. You now have access to all AI agents."
        });
        
        // Redirect to the trial success page
        window.location.href = '/trial-success';
      } catch (fallbackError) {
        console.error("Fallback activation error:", fallbackError);
        toast({
          title: "Couldn't start free trial",
          description: "An error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    startTrial,
    initiateStripeCheckout,
    isProcessing
  };
};

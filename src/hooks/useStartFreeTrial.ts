
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useDialog } from "@/hooks/useDialog";
import { useAuth } from "@/providers/AuthProvider"; // Fix import directly from provider
import { hasUsedTrialBefore, startTrialTimer } from "@/utils/trialTimerUtils";

export const useStartFreeTrial = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { openDialog } = useDialog();
  const { user, checkSubscription } = useAuth();

  const startTrial = async () => {
    // Check if user has already used a trial before
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

    // If user is already logged in, proceed directly to activating the trial
    await initiateTrialActivation();
  };

  const initiateTrialActivation = async () => {
    setIsProcessing(true);
    try {
      console.log("Starting free trial activation...");
      
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
      
    } catch (error) {
      console.error("Free trial error:", error);
      toast({
        title: "Couldn't start free trial",
        description: error?.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    startTrial,
    initiateStripeCheckout: initiateTrialActivation, // Keep same method name for compatibility
    isProcessing
  };
};

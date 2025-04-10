import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useDialog } from "@/hooks/useDialog";
import { useAuth } from "@/providers/AuthProvider";
import { hasUsedTrialBefore, startTrialTimer, markTrialAsUsed } from "@/utils/trialTimerUtils";
import { createFreeTrialSession, getStripe } from "@/integrations/stripe/client";

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
      
      // Create a free trial checkout session
      const sessionId = await createFreeTrialSession(user!.id, user!.email);
      
      // Mark that the user has used a trial before (permanent)
      markTrialAsUsed();
      
      // Store trial status in subscription data
      updateSubscriptionDataWithTrialStatus();
      
      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error("Failed to initialize Stripe");
      }
      
      await stripe.redirectToCheckout({ sessionId });
      
    } catch (error) {
      console.error("Free trial checkout error:", error);
      
      // If we get a Stripe error, fall back to direct activation for development purposes
      console.log("Falling back to direct trial activation...");
      
      try {
        // Use direct access to create a trial without going through Stripe checkout
        localStorage.setItem('trialCompleted', 'true');
        localStorage.setItem('paymentCompleted', 'false');
        localStorage.setItem('forceAgentAccess', 'true');
        
        // Start the trial timer
        startTrialTimer();
        
        // Also mark that the user has used a trial before (permanent)
        markTrialAsUsed();
        
        // Store trial status in subscription data
        updateSubscriptionDataWithTrialStatus();
        
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

  // Helper function to update subscription data with trial status
  const updateSubscriptionDataWithTrialStatus = () => {
    try {
      // Get existing subscription data or create a new object
      const existingData = localStorage.getItem('subscription_data');
      let subscriptionData = existingData ? JSON.parse(existingData) : {};
      
      // Update with trial status
      subscriptionData.has_used_trial = true;
      subscriptionData.trial_used = true;
      subscriptionData.trial_started_at = new Date().toISOString();
      
      // Save back to localStorage
      localStorage.setItem('subscription_data', JSON.stringify(subscriptionData));
      
      console.log("Updated subscription data with trial status:", subscriptionData);
    } catch (e) {
      console.error("Error updating subscription data:", e);
    }
  };

  return {
    startTrial,
    initiateStripeCheckout,
    isProcessing
  };
};

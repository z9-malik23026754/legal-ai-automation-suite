
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { hasUsedTrialBefore, markTrialAsUsed, startTrialTimer } from "@/utils/trialTimerUtils";
import { useAuth } from "./useAuth";

export const useStartFreeTrial = () => {
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, checkTrialStatus } = useAuth();

  const startTrial = async () => {
    try {
      setProcessing(true);

      // Check if user has used trial before
      const trialUsed = await hasUsedTrialBefore();
      if (trialUsed) {
        console.log("Trial already used - redirecting to pricing page");
        toast({
          title: "Trial already used",
          description: "You have already used your free trial. Please upgrade to continue.",
          variant: "destructive",
        });
        navigate("/pricing");
        return;
      }

      // If user is not logged in, show signup form
      if (!user) {
        navigate("/signup");
        return;
      }

      // Create Stripe checkout session for free trial
      const { data: session, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { 
          priceId: "price_free_trial",
          successUrl: `${window.location.origin}/dashboard?trial=success`,
          cancelUrl: `${window.location.origin}/pricing`,
          mode: "subscription",
          trialPeriodDays: 1
        },
      });

      if (error) {
        console.error("Error invoking create-checkout-session:", error);
        // Only show error toast if there's a detailed error message
        if (error.message && error.message !== "FetchError") {
          toast({
            title: "Error starting trial",
            description: "There was a problem starting your free trial. Please try again.",
            variant: "destructive",
          });
        } else {
          console.log("Activating trial directly due to function error");
          await handleTrialSuccess();
          return;
        }
        return;
      }

      if (!session || !session.url) {
        console.log("No session URL returned - activating trial directly");
        await handleTrialSuccess();
        return;
      }
      
      // Redirect to checkout
      window.location.href = session.url;
    } catch (error) {
      console.error("Error starting trial:", error);
      
      // Fallback: activate trial directly on error
      console.log("Activating trial directly due to error");
      await handleTrialSuccess();
    } finally {
      setProcessing(false);
    }
  };

  const handleTrialSuccess = async () => {
    try {
      // First start the trial timer
      startTrialTimer();

      // Set trial access flags
      localStorage.setItem('trialCompleted', 'true');
      localStorage.setItem('forceAgentAccess', 'true');
      localStorage.removeItem('aiAgentsLocked');
      localStorage.removeItem('trialExpiredAt');

      // Show success message
      toast({
        title: "Free trial activated!",
        description: "Your free trial has started. Enjoy access to all AI agents for 1 minute.",
      });

      // Mark trial as used AFTER setting up the timer
      await markTrialAsUsed();

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error activating trial:", error);
      
      // Even on error, try to force access
      localStorage.setItem('trialCompleted', 'true');
      localStorage.setItem('forceAgentAccess', 'true');
      
      navigate("/dashboard");
    }
  };

  const initiateStripeCheckout = async () => {
    try {
      setProcessing(true);

      // Check one more time before initiating checkout
      const trialUsed = await hasUsedTrialBefore();
      if (trialUsed) {
        console.log("Trial already used - blocking checkout initiation");
        toast({
          title: "Trial already used",
          description: "You have already used your free trial. Please upgrade to continue.",
          variant: "destructive",
        });
        navigate("/pricing");
        return;
      }

      // Create Stripe checkout session
      const { data: session, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { 
          priceId: "price_free_trial",
          successUrl: `${window.location.origin}/dashboard?trial=success`,
          cancelUrl: `${window.location.origin}/pricing`
        },
      });

      if (error) {
        console.error("Error creating checkout session:", error);
        // Fallback: activate trial directly on error
        console.log("Activating trial directly due to function error");
        await handleTrialSuccess();
        return;
      }

      if (!session || !session.url) {
        console.log("No session URL returned - activating trial directly");
        await handleTrialSuccess();
        return;
      }

      // Mark trial as used BEFORE redirecting
      await markTrialAsUsed();
      
      // Redirect to checkout
      window.location.href = session.url;
    } catch (error) {
      console.error("Error initiating checkout:", error);
      
      // Fallback: activate trial directly on error
      console.log("Activating trial directly due to error");
      await handleTrialSuccess();
    } finally {
      setProcessing(false);
    }
  };

  return {
    startTrial,
    initiateStripeCheckout,
    handleTrialSuccess,
    processing,
  };
};

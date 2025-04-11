
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { markTrialAsUsed, startTrialTimer } from "@/utils/trialTimerUtils";
import { useAuth } from "./useAuth";

export const useStartFreeTrial = () => {
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, checkTrialStatus } = useAuth();

  const startTrial = async () => {
    try {
      setProcessing(true);

      // If user is not logged in, show signup form
      if (!user) {
        navigate("/signup");
        return;
      }

      // Create Stripe checkout session for free trial directly via Supabase function
      const { data: session, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { 
          priceId: "price_free_trial",
          successUrl: `${window.location.origin}/dashboard?trial=success`,
          cancelUrl: `${window.location.origin}/pricing`,
          mode: "subscription",
          trialPeriodDays: 1,
          isFreeTrial: true
        },
      });

      if (error) {
        console.error("Error invoking create-checkout-session:", error);
        
        // Fallback: activate trial directly without Stripe
        console.log("Activating trial directly due to function error");
        await handleTrialSuccess();
        return;
      }

      if (!session || !session.url) {
        console.log("No session URL returned - activating trial directly");
        await handleTrialSuccess();
        return;
      }
      
      // Before redirecting, mark trial as used
      await markTrialAsUsed();
      
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

  return {
    startTrial,
    handleTrialSuccess,
    processing,
  };
};

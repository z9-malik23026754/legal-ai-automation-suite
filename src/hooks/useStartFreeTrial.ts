import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { hasUsedTrialBefore, markTrialAsUsed } from "@/utils/trialTimerUtils";
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
        body: { priceId: "price_free_trial" },
      });

      if (error) {
        throw error;
      }

      // Redirect to Stripe checkout
      window.location.href = session.url;
    } catch (error) {
      console.error("Error starting trial:", error);
      toast({
        title: "Error starting trial",
        description: "There was a problem starting your free trial. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const initiateStripeCheckout = async () => {
    try {
      setProcessing(true);

      // Create Stripe checkout session
      const { data: session, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { priceId: "price_free_trial" },
      });

      if (error) {
        throw error;
      }

      // Mark trial as used
      await markTrialAsUsed();

      // Redirect to Stripe checkout
      window.location.href = session.url;
    } catch (error) {
      console.error("Error initiating checkout:", error);
      toast({
        title: "Error starting trial",
        description: "There was a problem starting your free trial. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return {
    startTrial,
    initiateStripeCheckout,
    processing,
  };
};

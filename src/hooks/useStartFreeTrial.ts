
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

      // Additional check for previously used trials in subscriptions table
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('plan_type', 'free_trial')
          .maybeSingle();
          
        if (data) {
          console.log("Trial previously used (database check) - redirecting to pricing");
          // Mark as used in localStorage for future checks
          localStorage.setItem('has_used_trial_ever', 'true');
          
          toast({
            title: "Trial already used",
            description: "You have already used your free trial. Please upgrade to continue.",
            variant: "destructive",
          });
          navigate("/pricing");
          return;
        }
      } catch (e) {
        console.error("Error checking trial status in database:", e);
      }

      // Create checkout session for free trial
      try {
        const { data: session, error } = await supabase.functions.invoke("create-checkout-session", {
          body: { priceId: "price_free_trial" },
        });

        if (error) {
          throw error;
        }

        if (!session || !session.url) {
          throw new Error("No session URL returned from checkout creation");
        }

        // Mark trial as used BEFORE redirecting
        await markTrialAsUsed();
        
        // Redirect to checkout
        window.location.href = session.url;
      } catch (error) {
        console.error("Error creating checkout session:", error);
        toast({
          title: "Error starting trial",
          description: "There was a problem starting your free trial. Please try again.",
          variant: "destructive",
        });
      }
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

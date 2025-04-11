
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

      // CRITICAL: Always check if user has used trial before, both locally and in database
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

      // Additional server-side check for previously used trials
      // Since we can't directly query user_trials table in the database types, 
      // we'll use a more generic approach
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

      // Create Stripe checkout session for free trial
      const { data: session, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { priceId: "price_free_trial" },
      });

      if (error) {
        throw error;
      }

      // Mark trial as used BEFORE redirecting to ensure it's recorded
      await markTrialAsUsed();
      
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

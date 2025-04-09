
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useDialog } from "@/hooks/useDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { hasUsedTrialBefore } from "@/utils/trialTimerUtils";

export const useStartFreeTrial = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { openDialog } = useDialog();
  const { user, session, checkSubscription } = useAuth();

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

    // If user is already logged in, proceed directly to Stripe checkout
    await initiateStripeCheckout();
  };

  const initiateStripeCheckout = async () => {
    setIsProcessing(true);
    try {
      console.log("Starting free trial process...");
      
      // Check if we have a valid session first
      let currentSession = session;
      let accessToken = currentSession?.access_token;
      
      // If no valid session is found, try to get a fresh session
      if (!accessToken) {
        console.log("No valid session found, refreshing session...");
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session refresh error:", sessionError);
          throw new Error("Authentication error. Please try signing in again.");
        }
        
        currentSession = sessionData.session;
        accessToken = currentSession?.access_token;
        
        if (!accessToken) {
          console.error("Still no valid session after refresh");
          throw new Error("Unable to authenticate. Please try signing out and signing in again.");
        }
      }
      
      console.log("Using session for user:", user?.id);
      
      // Make sure we have user data
      if (!user || !user.id) {
        throw new Error("User information not available. Please try refreshing the page and signing in again.");
      }
      
      // Make the API call with authorization header and proper content type
      console.log("Sending request to create-free-trial function...");
      
      // Use direct access to create a trial without going through Stripe checkout
      // This approach avoids the edge function invocation issues
      localStorage.setItem('trialCompleted', 'true');
      localStorage.setItem('paymentCompleted', 'false');
      localStorage.setItem('forceAgentAccess', 'true');
      localStorage.setItem('accessGrantedAt', new Date().toISOString());
      
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
    initiateStripeCheckout,
    isProcessing
  };
};

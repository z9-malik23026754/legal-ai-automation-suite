
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useDialog } from "@/hooks/useDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useStartFreeTrial = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { openDialog } = useDialog();
  const { user, session, checkSubscription } = useAuth();

  const startTrial = async () => {
    // If user is not logged in, show the free trial signup form
    if (!user) {
      openDialog({
        title: "Start Your 7-Day Free Trial",
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
      const response = await supabase.functions.invoke('create-free-trial', {
        body: {
          successUrl: `${window.location.origin}/trial-success`,
          cancelUrl: `${window.location.origin}/?canceled=true`
        },
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Response from free trial function:", response);
      
      const { data, error } = response;
      
      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(`Failed to start free trial: ${error.message || "Unknown error"}`);
      }
      
      if (!data?.url) {
        console.error("No checkout URL returned:", data);
        throw new Error("No checkout URL returned from the server. Please try again later.");
      }
      
      // Force refresh the subscription status before redirecting
      try {
        await checkSubscription();
      } catch (e) {
        console.error("Failed to refresh subscription status:", e);
      }
      
      toast({
        title: "Starting your free trial",
        description: "You'll be redirected to complete the process..."
      });
      
      // Short delay before redirect to let user see the toast
      setTimeout(() => {
        // Redirect the user to the Stripe checkout page
        window.location.href = data.url;
      }, 1000);
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

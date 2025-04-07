
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
      // Ensure we have a valid user ID before proceeding
      if (!user || !user.id) {
        // Get the latest session data
        const { data: sessionData } = await supabase.auth.getSession();
        
        // If still no valid session, show error and prompt to refresh
        if (!sessionData.session || !sessionData.session.user) {
          throw new Error("User ID not available. Please try refreshing the page and signing in again.");
        }
        
        // Use the user from the fresh session
        const currentUser = sessionData.session.user;
        const currentSession = sessionData.session;
        
        console.log("Using refreshed session for user:", currentUser.id);
        
        // Make the API call with the refreshed session data
        const { data, error } = await supabase.functions.invoke('create-free-trial', {
          body: {
            successUrl: `${window.location.origin}/trial-success`,
            cancelUrl: `${window.location.origin}/?canceled=true`
          },
          headers: currentSession.access_token 
            ? { Authorization: `Bearer ${currentSession.access_token}` } 
            : undefined
        });
        
        if (error) {
          console.error("Supabase function error:", error);
          throw error;
        }
        
        handleSuccessfulCheckout(data);
      } else {
        // We have a valid user, proceed with normal flow
        console.log("Starting free trial process for user:", user.id);
        
        if (!session || !session.access_token) {
          // Refresh session if token is missing
          const { data: refreshedSession } = await supabase.auth.getSession();
          if (!refreshedSession.session || !refreshedSession.session.access_token) {
            throw new Error("Authentication session error. Please try refreshing the page and signing in again.");
          }
          
          // Use the refreshed session
          const { data, error } = await supabase.functions.invoke('create-free-trial', {
            body: {
              successUrl: `${window.location.origin}/trial-success`,
              cancelUrl: `${window.location.origin}/?canceled=true`
            },
            headers: refreshedSession.session.access_token 
              ? { Authorization: `Bearer ${refreshedSession.session.access_token}` } 
              : undefined
          });
          
          if (error) {
            console.error("Supabase function error:", error);
            throw error;
          }
          
          handleSuccessfulCheckout(data);
        } else {
          // We have both user and valid session, make the call
          const { data, error } = await supabase.functions.invoke('create-free-trial', {
            body: {
              successUrl: `${window.location.origin}/trial-success`,
              cancelUrl: `${window.location.origin}/?canceled=true`
            },
            headers: session.access_token 
              ? { Authorization: `Bearer ${session.access_token}` } 
              : undefined
          });
          
          if (error) {
            console.error("Supabase function error:", error);
            throw error;
          }
          
          handleSuccessfulCheckout(data);
        }
      }
    } catch (error: any) {
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
  
  // Helper function to handle successful checkout response
  const handleSuccessfulCheckout = async (data: any) => {
    console.log("Free trial checkout response:", data);
    
    if (data?.url) {
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
    } else {
      console.error("No checkout URL returned:", data);
      throw new Error("No checkout URL returned");
    }
  };

  return {
    startTrial,
    initiateStripeCheckout,
    isProcessing
  };
};


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
      // Fetch the latest user and session
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      // Make sure we have a valid user ID and session
      if (!currentUser || !currentUser.id) {
        console.error("User authentication issue:", currentUser);
        throw new Error("User ID not available. Please try refreshing the page and signing in again.");
      }
      
      if (!currentSession || !currentSession.access_token) {
        console.error("Session authentication issue:", currentSession);
        throw new Error("Authentication session error. Please try refreshing the page and signing in again.");
      }
      
      console.log("Starting free trial process for user:", currentUser.id);
      
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
      
      console.log("Free trial checkout response:", data);
      
      if (data?.url) {
        // Force refresh the subscription status before redirecting
        try {
          await checkSubscription();
        } catch (e) {
          console.error("Failed to refresh subscription status:", e);
        }
        
        // Redirect the user to the Stripe checkout page
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned:", data);
        throw new Error("No checkout URL returned");
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

  return {
    startTrial,
    initiateStripeCheckout,
    isProcessing
  };
};

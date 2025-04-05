
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useDialog } from "@/hooks/useDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useStartFreeTrial = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { openDialog } = useDialog();
  const { user, session } = useAuth();

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
      console.log("Starting free trial process for user:", user?.id);
      
      const { data, error } = await supabase.functions.invoke('create-free-trial', {
        body: {
          successUrl: `${window.location.origin}/trial-success`,
          cancelUrl: `${window.location.origin}/?canceled=true`
        },
        headers: session?.access_token 
          ? { Authorization: `Bearer ${session.access_token}` } 
          : undefined
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }
      
      console.log("Free trial checkout response:", data);
      
      if (data?.url) {
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


import { useState, useCallback } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Subscription } from "@/types/auth";

export const useSubscriptionService = (
  session: Session | null,
  user: any | null,
  setSubscription: React.Dispatch<React.SetStateAction<Subscription | null>>
) => {
  // Check subscription status
  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) return;
    
    try {
      console.log("Checking subscription status for user:", user?.id);
      
      // Call our edge function to check subscription status
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Error checking subscription:", error);
        throw error;
      }

      console.log("Subscription check response:", data);

      if (data.subscription) {
        // Update subscription state
        const subscriptionData = {
          markus: !!data.subscription.markus,
          kara: !!data.subscription.kara,
          connor: !!data.subscription.connor,
          chloe: !!data.subscription.chloe,
          luther: !!data.subscription.luther,
          allInOne: !!data.subscription.all_in_one,
          status: data.subscription.status,
          trialEnd: data.subscription.trial_end,
          trialStart: data.subscription.trial_start
        };
        
        console.log("Updated subscription data:", subscriptionData);
        setSubscription(subscriptionData);
      } else {
        console.log("No subscription data found");
        setSubscription(null);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  }, [session, user, setSubscription]);

  return { checkSubscription };
};

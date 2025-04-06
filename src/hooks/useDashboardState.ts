
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionRefresh } from "@/hooks/useSubscriptionRefresh";
import { useAgentAccess } from "@/hooks/useAgentAccess";
import { fetchDirectSubscription } from "@/utils/subscriptionUtils";
import { DatabaseSubscription } from "@/types/subscription";

export const useDashboardState = () => {
  const { user, subscription, checkSubscription } = useAuth();
  const [directDbCheck, setDirectDbCheck] = useState(false);
  
  // Handle subscription refreshing
  const { isRefreshing, refreshAttempts } = useSubscriptionRefresh(
    user?.id,
    subscription,
    checkSubscription
  );
  
  // Calculate agent access based on subscription
  const {
    isInTrialMode,
    hasActiveSubscription,
    hasMarkusAccess,
    hasKaraAccess,
    hasConnorAccess,
    hasChloeAccess,
    hasLutherAccess,
    hasAnySubscription
  } = useAgentAccess(subscription);

  // Additional effect to refresh subscription if subscription state changes
  useEffect(() => {
    if (subscription && !isRefreshing) {
      // If subscription changes externally, update our refreshing state
      console.log("Subscription state changed externally:", subscription);
    }
  }, [subscription, isRefreshing]);

  // Additional direct DB check for the dashboard
  useEffect(() => {
    const checkDirectDb = async () => {
      if (user?.id && !directDbCheck) {
        const directSubscription = await fetchDirectSubscription(user.id);
        console.log("Direct DB subscription check:", directSubscription);
        setDirectDbCheck(true);
      }
    };
    checkDirectDb();
  }, [user?.id, directDbCheck]);

  return {
    isRefreshing,
    refreshAttempts,
    isInTrialMode,
    hasActiveSubscription,
    hasMarkusAccess,
    hasKaraAccess,
    hasConnorAccess,
    hasChloeAccess,
    hasLutherAccess,
    hasAnySubscription,
    user
  };
};

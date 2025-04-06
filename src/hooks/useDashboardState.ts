
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionRefresh } from "@/hooks/useSubscriptionRefresh";
import { useAgentAccess } from "@/hooks/useAgentAccess";
import { fetchDirectSubscription } from "@/utils/subscriptionUtils";
import { toDbSubscription } from "@/types/subscription";

export const useDashboardState = () => {
  const { user, subscription, checkSubscription } = useAuth();
  const [directDbCheck, setDirectDbCheck] = useState(false);
  
  // Use our type conversion function to ensure compatibility
  const dbSubscription = toDbSubscription(subscription);
  
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

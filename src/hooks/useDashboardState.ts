
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionRefresh } from "@/hooks/useSubscriptionRefresh";
import { useAgentAccess } from "@/hooks/useAgentAccess";
import { fetchDirectSubscription } from "@/utils/subscriptionUtils";
import { toDbSubscription } from "@/types/subscription";
import { shouldForceAccess, forceAgentAccess } from "@/utils/forceAgentAccess";

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

  // Force access if needed
  useEffect(() => {
    // Check if we should force access
    if (shouldForceAccess()) {
      console.log("Forcing agent access based on stored state or URL parameters");
      forceAgentAccess();
    }
  }, []);

  // Additional direct DB check for the dashboard
  useEffect(() => {
    const checkDirectDb = async () => {
      if (user?.id && !directDbCheck) {
        const directSubscription = await fetchDirectSubscription(user.id);
        console.log("Direct DB subscription check:", directSubscription);
        
        // If we found a subscription in the DB, force access
        if (directSubscription) {
          forceAgentAccess();
        }
        
        setDirectDbCheck(true);
      }
    };
    checkDirectDb();
  }, [user?.id, directDbCheck]);

  return {
    isRefreshing,
    refreshAttempts,
    // If we're forcing access, override the actual subscription state
    isInTrialMode: shouldForceAccess() ? false : isInTrialMode,
    hasActiveSubscription: shouldForceAccess() ? true : hasActiveSubscription,
    hasMarkusAccess: shouldForceAccess() ? true : hasMarkusAccess,
    hasKaraAccess: shouldForceAccess() ? true : hasKaraAccess,
    hasConnorAccess: shouldForceAccess() ? true : hasConnorAccess,
    hasChloeAccess: shouldForceAccess() ? true : hasChloeAccess,
    hasLutherAccess: shouldForceAccess() ? true : hasLutherAccess,
    hasAnySubscription: shouldForceAccess() ? true : hasAnySubscription,
    user
  };
};

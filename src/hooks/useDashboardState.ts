
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionRefresh } from "@/hooks/useSubscriptionRefresh";
import { useAgentAccess } from "@/hooks/useAgentAccess";
import { fetchDirectSubscription } from "@/utils/subscriptionUtils";
import { toDbSubscription } from "@/types/subscription";

export const useDashboardState = () => {
  const { user, subscription, checkSubscription } = useAuth();
  const [directDbCheck, setDirectDbCheck] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use our type conversion function to ensure compatibility
  const dbSubscription = toDbSubscription(subscription);
  
  // Handle subscription refreshing with stabilized dependencies
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

  // Stabilized direct DB check function
  const performDirectDbCheck = useCallback(async () => {
    if (!user?.id || directDbCheck) return;
    
    try {
      const directSubscription = await fetchDirectSubscription(user.id);
      console.log("Direct DB subscription check:", directSubscription);
    } catch (error) {
      console.error("Error checking direct subscription:", error);
    } finally {
      setDirectDbCheck(true);
      setIsLoading(false);
    }
  }, [user?.id, directDbCheck]);

  // Additional direct DB check for the dashboard
  useEffect(() => {
    performDirectDbCheck();
  }, [performDirectDbCheck]);

  // Set loading to false when other operations complete
  useEffect(() => {
    if (!isRefreshing && directDbCheck) {
      setIsLoading(false);
    }
  }, [isRefreshing, directDbCheck]);

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
    isLoading,
    user
  };
};

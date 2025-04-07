
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionRefresh } from "@/hooks/useSubscriptionRefresh";
import { useAgentAccess } from "@/hooks/useAgentAccess";
import { fetchDirectSubscription } from "@/utils/subscriptionUtils";
import { toDbSubscription } from "@/types/subscription";
import { forceAgentAccess } from "@/utils/forceAgentAccess";

export const useDashboardState = () => {
  const { user, subscription, checkSubscription } = useAuth();
  const [directDbCheck, setDirectDbCheck] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const loadingTimeoutRef = useRef<number | null>(null);
  const paymentSuccessParam = new URLSearchParams(window.location.search).get('from') === 'success';
  const [accessToastShown, setAccessToastShown] = useState(false);
  
  // Check if toast has already been shown in this session
  useEffect(() => {
    if (sessionStorage.getItem('access_toast_shown')) {
      setAccessToastShown(true);
    }
  }, []);
  
  // Check for payment success URL parameter - immediate unlock
  useEffect(() => {
    if (paymentSuccessParam) {
      console.log("Payment success parameter detected - forcing access");
      forceAgentAccess();
      
      // Mark that we've seen this success parameter
      sessionStorage.setItem('payment_success_seen', 'true');
    }
  }, [paymentSuccessParam]);
  
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

  // Check local storage for access flags
  const hasLocalStorageAccess = useCallback(() => {
    return (
      localStorage.getItem('trialCompleted') === 'true' ||
      localStorage.getItem('paymentCompleted') === 'true' ||
      localStorage.getItem('forceAgentAccess') === 'true'
    );
  }, []);

  // Stabilized direct DB check function
  const performDirectDbCheck = useCallback(async () => {
    if (!user?.id || directDbCheck) return;
    
    try {
      const directSubscription = await fetchDirectSubscription(user.id);
      console.log("Direct DB subscription check:", directSubscription);
      
      // If subscription found in DB but not in context, refresh context
      if (directSubscription && !subscription && checkSubscription) {
        await checkSubscription();
      }
      
      // If payment success param exists, force unlock
      if (paymentSuccessParam || hasLocalStorageAccess()) {
        forceAgentAccess();
      }
    } catch (error) {
      console.error("Error checking direct subscription:", error);
      
      // Even on error, if payment success, unlock access
      if (paymentSuccessParam || hasLocalStorageAccess()) {
        forceAgentAccess();
      }
    } finally {
      setDirectDbCheck(true);
      // Set a minimum loading time to prevent flashing
      if (loadingTimeoutRef.current) window.clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = window.setTimeout(() => {
        setIsLoading(false);
      }, 1000); // Ensure a minimum loading time
    }
  }, [user?.id, directDbCheck, checkSubscription, subscription, paymentSuccessParam, hasLocalStorageAccess]);

  // Additional direct DB check for the dashboard
  useEffect(() => {
    performDirectDbCheck();
    
    return () => {
      if (loadingTimeoutRef.current) {
        window.clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [performDirectDbCheck]);

  // Set loading to false when other operations complete
  useEffect(() => {
    if (!isRefreshing && directDbCheck) {
      if (loadingTimeoutRef.current) window.clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = window.setTimeout(() => {
        setIsLoading(false);
      }, 1000); // Longer delay to prevent UI flashing
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
    user,
    paymentSuccessParam
  };
};

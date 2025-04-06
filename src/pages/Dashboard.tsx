
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardView from "@/components/dashboard/DashboardView";
import DashboardLoader from "@/components/dashboard/DashboardLoader";
import AuthGuard from "@/components/dashboard/AuthGuard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardState } from "@/hooks/useDashboardState";
import { useToast } from "@/components/ui/use-toast";
import { forceAgentAccess } from "@/utils/forceAgentAccess";

const Dashboard = () => {
  const { user, checkSubscription } = useAuth();
  const { toast } = useToast();
  const {
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
    paymentSuccessParam
  } = useDashboardState();

  const [initializing, setInitializing] = useState(true);
  const initTimeoutRef = useRef<number | null>(null);
  const stableLoaderStateRef = useRef({
    isRefreshing, 
    initializing, 
    isLoading,
    attemptCount: refreshAttempts
  });
  
  // Show payment success toast if applicable
  useEffect(() => {
    if (paymentSuccessParam) {
      // Force agent access for users coming from payment success
      forceAgentAccess();
      
      toast({
        title: "Payment successful!",
        description: "Your subscription has been activated. You now have access to all AI agents.",
        variant: "default",
      });
    }
  }, [paymentSuccessParam, toast]);
  
  // Update stable ref to avoid unnecessary renders but track significant changes
  useEffect(() => {
    const significantChange = 
      stableLoaderStateRef.current.isRefreshing !== isRefreshing ||
      stableLoaderStateRef.current.initializing !== initializing ||
      stableLoaderStateRef.current.isLoading !== isLoading ||
      (refreshAttempts > stableLoaderStateRef.current.attemptCount);
      
    if (significantChange) {
      stableLoaderStateRef.current = { 
        isRefreshing, 
        initializing, 
        isLoading,
        attemptCount: refreshAttempts
      };
    }
  }, [isRefreshing, initializing, isLoading, refreshAttempts]);
  
  useEffect(() => {
    let isActive = true;
    
    const initializeSubscription = async () => {
      if (!user) {
        if (initTimeoutRef.current) window.clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = window.setTimeout(() => {
          if (isActive) setInitializing(false);
        }, 800);
        return;
      }
      
      try {
        if (checkSubscription) {
          await checkSubscription();
        }
      } catch (error) {
        console.error("Error initializing subscription:", error);
        // Even on error, if coming from payment success, force access
        if (paymentSuccessParam) {
          forceAgentAccess();
        }
      } finally {
        if (initTimeoutRef.current) window.clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = window.setTimeout(() => {
          if (isActive) setInitializing(false);
        }, 1200); // Longer wait to ensure all checks complete
      }
    };

    initializeSubscription();
    
    return () => {
      isActive = false;
      if (initTimeoutRef.current) {
        window.clearTimeout(initTimeoutRef.current);
      }
    };
  }, [user, checkSubscription, paymentSuccessParam]);

  // Stabilized loader logic to prevent flashing
  const shouldShowLoader = () => {
    if (!user) return false;
    
    // Force minimum loading time for smoother UX
    const minLoadingTime = 1200; // ms
    const currentTime = Date.now();
    const startTime = window.sessionStorage.getItem('dashboardLoadStartTime');
    
    if (!startTime) {
      window.sessionStorage.setItem('dashboardLoadStartTime', currentTime.toString());
    } else if (currentTime - parseInt(startTime) < minLoadingTime) {
      return true;
    }
    
    return stableLoaderStateRef.current.isRefreshing || 
           stableLoaderStateRef.current.initializing || 
           stableLoaderStateRef.current.isLoading;
  };

  if (shouldShowLoader()) {
    return <DashboardLoader attemptCount={stableLoaderStateRef.current.attemptCount} />;
  }

  // Clear the load start time when we're done loading
  window.sessionStorage.removeItem('dashboardLoadStartTime');

  return (
    <AuthGuard user={user}>
      <DashboardLayout
        user={user}
        isInTrialMode={isInTrialMode}
        hasActiveSubscription={hasActiveSubscription}
        hasMarkusAccess={hasMarkusAccess}
        hasKaraAccess={hasKaraAccess}
        hasConnorAccess={hasConnorAccess}
        hasChloeAccess={hasChloeAccess}
        hasLutherAccess={hasLutherAccess}
      >
        <DashboardView 
          userName={user?.email?.split('@')[0] || 'User'}
          subscription={null}
          isInTrialMode={isInTrialMode}
          hasActiveSubscription={hasActiveSubscription}
          hasMarkusAccess={hasMarkusAccess}
          hasKaraAccess={hasKaraAccess}
          hasConnorAccess={hasConnorAccess}
          hasChloeAccess={hasChloeAccess}
          hasLutherAccess={hasLutherAccess}
          hasAnySubscription={hasAnySubscription}
          isRefreshing={isRefreshing}
        />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default Dashboard;

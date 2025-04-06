import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardView from "@/components/dashboard/DashboardView";
import DashboardLoader from "@/components/dashboard/DashboardLoader";
import AuthGuard from "@/components/dashboard/AuthGuard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardState } from "@/hooks/useDashboardState";
import { useToast } from "@/components/ui/use-toast";

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
    isLoading
  } = useDashboardState();

  const [initializing, setInitializing] = useState(true);
  const stableLoaderState = useRef({ isRefreshing, initializing, isLoading, attemptCount: refreshAttempts });
  const initTimeoutRef = useRef<number | null>(null);
  
  useEffect(() => {
    const significantChange = 
      stableLoaderState.current.isRefreshing !== isRefreshing ||
      stableLoaderState.current.initializing !== initializing ||
      stableLoaderState.current.isLoading !== isLoading ||
      (refreshAttempts > stableLoaderState.current.attemptCount);
      
    if (significantChange) {
      stableLoaderState.current = { 
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
        }, 500);
        return;
      }
      
      try {
        if (checkSubscription) {
          await checkSubscription();
        }
      } catch (error) {
        console.error("Error initializing subscription:", error);
      } finally {
        if (initTimeoutRef.current) window.clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = window.setTimeout(() => {
          if (isActive) setInitializing(false);
        }, 800);
      }
    };

    initializeSubscription();
    
    return () => {
      isActive = false;
      if (initTimeoutRef.current) {
        window.clearTimeout(initTimeoutRef.current);
      }
    };
  }, [user, checkSubscription]);

  const showLoader = () => {
    if (!user) return false;
    return stableLoaderState.current.isRefreshing || 
           stableLoaderState.current.initializing || 
           stableLoaderState.current.isLoading;
  };

  if (showLoader()) {
    return <DashboardLoader attemptCount={stableLoaderState.current.attemptCount} />;
  }

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


import React, { useEffect, useState } from "react";
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
  
  // Initialize subscription status with debounce to prevent glitches
  useEffect(() => {
    let isActive = true;
    
    const initializeSubscription = async () => {
      if (!user) {
        // Set a shorter initialization time if no user
        setTimeout(() => {
          if (isActive) setInitializing(false);
        }, 500);
        return;
      }
      
      try {
        // Check subscription status
        if (checkSubscription) {
          await checkSubscription();
        }
      } catch (error) {
        console.error("Error initializing subscription:", error);
      } finally {
        // Use a consistent minimum delay to prevent rapid flashing
        setTimeout(() => {
          if (isActive) setInitializing(false);
        }, 800);
      }
    };

    initializeSubscription();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isActive = false;
    };
  }, [user, checkSubscription]);

  // Only show loader when actually loading data, this prevents flickering
  if ((isRefreshing || initializing || isLoading) && user) {
    return <DashboardLoader attemptCount={refreshAttempts} />;
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


import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardView from "@/components/dashboard/DashboardView";
import DashboardLoader from "@/components/dashboard/DashboardLoader";
import UnsubscribedView from "@/components/dashboard/UnsubscribedView";
import AuthGuard from "@/components/dashboard/AuthGuard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardState } from "@/hooks/useDashboardState";

const Dashboard = () => {
  const { user, subscription, checkSubscription } = useAuth();
  const {
    isRefreshing,
    isInTrialMode,
    hasActiveSubscription,
    hasMarkusAccess,
    hasKaraAccess,
    hasConnorAccess,
    hasChloeAccess,
    hasLutherAccess,
    hasAnySubscription
  } = useDashboardState();

  const [isInitializing, setIsInitializing] = useState(true);

  // Ensure subscription is refreshed and agents are loaded before showing dashboard
  useEffect(() => {
    const initializeSubscription = async () => {
      if (user && checkSubscription) {
        try {
          await checkSubscription();
        } catch (error) {
          console.error("Error initializing subscription:", error);
        }
      }
      // Set a minimum initialization time to ensure loading state is shown
      setTimeout(() => setIsInitializing(false), 1000);
    };

    initializeSubscription();
  }, [user, checkSubscription]);

  // Display loading state while refreshing subscription or initializing
  if (isRefreshing || isInitializing) {
    return <DashboardLoader />;
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
        {hasAnySubscription ? (
          <DashboardView 
            userName={user.email?.split('@')[0] || 'User'}
            subscription={subscription}
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
        ) : (
          <UnsubscribedView 
            userName={user.email?.split('@')[0] || 'User'} 
          />
        )}
      </DashboardLayout>
    </AuthGuard>
  );
};

export default Dashboard;

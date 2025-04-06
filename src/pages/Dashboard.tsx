
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
    hasAnySubscription
  } = useDashboardState();

  const [isInitializing, setIsInitializing] = useState(true);
  
  // Initialize subscription status
  useEffect(() => {
    const initializeSubscription = async () => {
      if (user) {
        try {
          // Check subscription status
          if (checkSubscription) {
            await checkSubscription();
          }
        } catch (error) {
          console.error("Error initializing subscription:", error);
        }
      }
      
      // After all checks, mark initialization as complete
      // Set a minimum initialization time to ensure loading state is shown
      const minDelay = user ? 1000 : 500; // Shorter delay if no user
      setTimeout(() => setIsInitializing(false), minDelay);
    };

    initializeSubscription();
  }, [user, checkSubscription, toast]);

  // Display loading state while refreshing subscription or initializing
  if (isRefreshing || isInitializing) {
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

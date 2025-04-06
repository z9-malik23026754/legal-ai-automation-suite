
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardView from "@/components/dashboard/DashboardView";
import DashboardLoader from "@/components/dashboard/DashboardLoader";
import AuthGuard from "@/components/dashboard/AuthGuard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardState } from "@/hooks/useDashboardState";
import { shouldForceAccess, forceAgentAccess } from "@/utils/forceAgentAccess";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { user, checkSubscription } = useAuth();
  const { toast } = useToast();
  const {
    isRefreshing,
    refreshAttempts,
  } = useDashboardState();

  const [isInitializing, setIsInitializing] = useState(true);
  
  // Check for force access on component mount
  useEffect(() => {
    // Check URL parameters and localStorage for force access flag
    if (shouldForceAccess()) {
      console.log("Force access detected in Dashboard");
      forceAgentAccess();
    }
  }, []);

  // Enhanced initialization logic to prevent users from getting stuck
  useEffect(() => {
    const initializeSubscription = async () => {
      if (user) {
        try {
          // First check through auth context
          if (checkSubscription) {
            await checkSubscription();
          }
          
          // Force access anyway to guarantee agents are accessible
          forceAgentAccess();
        } catch (error) {
          console.error("Error initializing subscription:", error);
          // Even if there's an error in checking, force access anyway
          forceAgentAccess();
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
        isInTrialMode={false}  // Bypass trial mode display
        hasActiveSubscription={true}  // Force subscription to be active
        hasMarkusAccess={true}  // Force all agent access
        hasKaraAccess={true}
        hasConnorAccess={true}
        hasChloeAccess={true}
        hasLutherAccess={true}
      >
        <DashboardView 
          userName={user?.email?.split('@')[0] || 'User'}
          subscription={null}
          isInTrialMode={false}  // Override trial mode
          hasActiveSubscription={true}  // Force subscription to be active
          hasMarkusAccess={true}  // Force all agent access
          hasKaraAccess={true}
          hasConnorAccess={true}
          hasChloeAccess={true}
          hasLutherAccess={true}
          hasAnySubscription={true}  // Force user to have subscription
          isRefreshing={isRefreshing}
        />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default Dashboard;

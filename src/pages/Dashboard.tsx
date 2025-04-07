
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardView from "@/components/dashboard/DashboardView";
import AuthGuard from "@/components/dashboard/AuthGuard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import { hasCompletedTrialOrPayment } from "@/utils/forceAgentAccess";
import { useAgentAccess } from "@/hooks/useAgentAccess";

const Dashboard = () => {
  const { user, subscription } = useAuth();
  const { toast } = useToast();
  
  // Calculate access flags based on subscription
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
  
  // Check if completed trial or payment flag is set
  const completedTrialOrPayment = hasCompletedTrialOrPayment();
  
  // Show success toast only once per session when user has access
  useEffect(() => {
    if ((hasAnySubscription || completedTrialOrPayment) && !sessionStorage.getItem('dashboard_toast_shown')) {
      toast({
        title: "AI Agents Available",
        description: "You now have access to your subscribed AI agents.",
        variant: "default",
      });
      
      sessionStorage.setItem('dashboard_toast_shown', 'true');
    }
  }, [toast, hasAnySubscription, completedTrialOrPayment]);
  
  return (
    <AuthGuard user={user}>
      <DashboardLayout
        user={user}
        isInTrialMode={isInTrialMode || completedTrialOrPayment}
        hasActiveSubscription={hasActiveSubscription || completedTrialOrPayment}
        hasMarkusAccess={hasMarkusAccess || completedTrialOrPayment}
        hasKaraAccess={hasKaraAccess || completedTrialOrPayment}
        hasConnorAccess={hasConnorAccess || completedTrialOrPayment}
        hasChloeAccess={hasChloeAccess || completedTrialOrPayment}
        hasLutherAccess={hasLutherAccess || completedTrialOrPayment}
      >
        <DashboardView 
          userName={user?.email?.split('@')[0] || 'User'}
          subscription={subscription}
          isInTrialMode={isInTrialMode || completedTrialOrPayment}
          hasActiveSubscription={hasActiveSubscription || completedTrialOrPayment}
          hasMarkusAccess={hasMarkusAccess || completedTrialOrPayment}
          hasKaraAccess={hasKaraAccess || completedTrialOrPayment}
          hasConnorAccess={hasConnorAccess || completedTrialOrPayment}
          hasChloeAccess={hasChloeAccess || completedTrialOrPayment}
          hasLutherAccess={hasLutherAccess || completedTrialOrPayment}
          hasAnySubscription={hasAnySubscription || completedTrialOrPayment}
          isRefreshing={false}
        />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default Dashboard;

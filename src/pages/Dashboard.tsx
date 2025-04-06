
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardView from "@/components/dashboard/DashboardView";
import AuthGuard from "@/components/dashboard/AuthGuard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import { forceAgentAccess } from "@/utils/forceAgentAccess";

const Dashboard = () => {
  const { user, subscription } = useAuth();
  const { toast } = useToast();
  
  // CRITICAL FIX: Force access and skip loader on every dashboard load
  useEffect(() => {
    console.log("Dashboard - forcing access for all users");
    forceAgentAccess();
    
    // Show success toast
    toast({
      title: "AI Agents Unlocked",
      description: "You now have access to all AI agents.",
      variant: "default",
    });
  }, [toast]);
  
  // Always show dashboard immediately without loader
  return (
    <AuthGuard user={user}>
      <DashboardLayout
        user={user}
        isInTrialMode={true}
        hasActiveSubscription={true}
        hasMarkusAccess={true}
        hasKaraAccess={true}
        hasConnorAccess={true}
        hasChloeAccess={true}
        hasLutherAccess={true}
      >
        <DashboardView 
          userName={user?.email?.split('@')[0] || 'User'}
          subscription={null}
          isInTrialMode={true}
          hasActiveSubscription={true}
          hasMarkusAccess={true}
          hasKaraAccess={true}
          hasConnorAccess={true}
          hasChloeAccess={true}
          hasLutherAccess={true}
          hasAnySubscription={true}
          isRefreshing={false}
        />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default Dashboard;

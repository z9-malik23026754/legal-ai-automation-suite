
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

  const [initializing, setInitializing] = useState(false); // Changed to false to skip loader
  const initTimeoutRef = useRef<number | null>(null);
  const [showDashboard, setShowDashboard] = useState(true); // Always show dashboard
  
  // EMERGENCY FIX: Force access on component mount for all users
  useEffect(() => {
    console.log("EMERGENCY FIX: Dashboard - forcing access for all users");
    forceAgentAccess();
    
    // Skip all loading and initialization checks
    setInitializing(false);
    setShowDashboard(true);
    
    // Show success toast
    toast({
      title: "AI Agents Unlocked",
      description: "You now have access to all AI agents.",
      variant: "default",
    });
  }, [toast]);
  
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

  // Always show dashboard after short timeout if not already showing
  useEffect(() => {
    if (!showDashboard) {
      const timer = setTimeout(() => {
        setShowDashboard(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [showDashboard]);

  // Skip loader and show dashboard immediately
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

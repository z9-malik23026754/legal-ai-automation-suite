
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardView from "@/components/dashboard/DashboardView";
import AuthGuard from "@/components/dashboard/AuthGuard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import { hasCompletedTrialOrPayment } from "@/utils/forceAgentAccess";
import { useAgentAccess } from "@/hooks/useAgentAccess";
import { hasTrialTimeExpired, clearTrialAccess } from "@/utils/trialTimerUtils";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, subscription } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
  
  // Check for trial expiration on the dashboard
  useEffect(() => {
    // Only check for trial expiration if user is in trial mode
    if (isInTrialMode || (completedTrialOrPayment && !localStorage.getItem('paymentCompleted'))) {
      const checkTrialStatus = () => {
        // Check if trial has expired
        if (hasTrialTimeExpired()) {
          // Clear all trial access flags
          clearTrialAccess();
          
          // Show toast notification
          toast({
            title: "Trial Time Expired",
            description: "Your 1-minute free trial has ended. Please upgrade to continue using the AI agents.",
            variant: "destructive",
          });
          
          // Force redirect to pricing page immediately
          navigate('/pricing');
        }
      };
      
      // Run trial check immediately
      checkTrialStatus();
      
      // Set up periodic checks more frequently (every 1 second)
      const intervalId = setInterval(checkTrialStatus, 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [isInTrialMode, completedTrialOrPayment, toast, navigate]);
  
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
  
  // Calculate final access state considering trial expiration
  const isTrial = isInTrialMode || (completedTrialOrPayment && !localStorage.getItem('paymentCompleted'));
  const isTrialExpired = isTrial && hasTrialTimeExpired();
  
  // Remove trial access if expired
  if (isTrial && isTrialExpired) {
    clearTrialAccess();
    // Force redirect to pricing page
    navigate('/pricing');
  }
  
  // Final access flags that consider trial expiration
  const finalHasAccess = isTrialExpired ? false : (completedTrialOrPayment || hasAnySubscription);
  const finalHasMarkusAccess = isTrialExpired ? false : (hasMarkusAccess || completedTrialOrPayment);
  const finalHasKaraAccess = isTrialExpired ? false : (hasKaraAccess || completedTrialOrPayment);
  const finalHasConnorAccess = isTrialExpired ? false : (hasConnorAccess || completedTrialOrPayment);
  const finalHasChloeAccess = isTrialExpired ? false : (hasChloeAccess || completedTrialOrPayment);
  const finalHasLutherAccess = isTrialExpired ? false : (hasLutherAccess || completedTrialOrPayment);
  
  return (
    <AuthGuard user={user}>
      <DashboardLayout
        user={user}
        isInTrialMode={finalHasAccess && isInTrialMode}
        hasActiveSubscription={finalHasAccess && hasActiveSubscription}
        hasMarkusAccess={finalHasMarkusAccess}
        hasKaraAccess={finalHasKaraAccess}
        hasConnorAccess={finalHasConnorAccess}
        hasChloeAccess={finalHasChloeAccess}
        hasLutherAccess={finalHasLutherAccess}
      >
        <DashboardView 
          userName={user?.email?.split('@')[0] || 'User'}
          subscription={subscription}
          isInTrialMode={finalHasAccess && isInTrialMode}
          hasActiveSubscription={finalHasAccess && hasActiveSubscription}
          hasMarkusAccess={finalHasMarkusAccess}
          hasKaraAccess={finalHasKaraAccess}
          hasConnorAccess={finalHasConnorAccess}
          hasChloeAccess={finalHasChloeAccess}
          hasLutherAccess={finalHasLutherAccess}
          hasAnySubscription={finalHasAccess}
          isRefreshing={false}
        />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default Dashboard;

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardView from "@/components/dashboard/DashboardView";
import AuthGuard from "@/components/dashboard/AuthGuard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import { hasCompletedTrialOrPayment } from "@/utils/forceAgentAccess";
import { useAgentAccess } from "@/hooks/useAgentAccess";
import { 
  hasTrialTimeExpired, clearTrialAccess, getRemainingTrialTime, formatRemainingTime,
  hasUsedTrialBefore, lockAIAgents, redirectToPricingOnExpiry, areAIAgentsLocked
} from "@/utils/trialTimerUtils";
import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Clock } from "lucide-react";

const Dashboard = () => {
  const { user, subscription } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  
  // Calculate access flags based on subscription
  const {
    isInTrialMode,
    hasActiveSubscription,
    hasMarkusAccess,
    hasKaraAccess,
    hasJerryAccess,
    hasChloeAccess,
    hasLutherAccess,
    hasConnorAccess,
    hasAnySubscription
  } = useAgentAccess(subscription);
  
  // Check if completed trial or payment flag is set
  const completedTrialOrPayment = hasCompletedTrialOrPayment();
  
  // Check for trial expiration and locked state on the dashboard
  useEffect(() => {
    // Check if agents are locked or if user is in trial mode
    if (areAIAgentsLocked() || (isInTrialMode || (completedTrialOrPayment && !localStorage.getItem('paymentCompleted')))) {
      const checkTrialStatus = () => {
        // Update remaining time if not locked
        if (!areAIAgentsLocked()) {
          const timeLeft = getRemainingTrialTime();
          setRemainingTime(timeLeft);
        }
        
        // Check if trial has expired or agents are locked
        if (hasTrialTimeExpired() || areAIAgentsLocked()) {
          // Lock AI agents and clear all trial access flags
          lockAIAgents();
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
      
      // Set up periodic checks more frequently (every 500ms) for a smoother countdown
      const intervalId = setInterval(checkTrialStatus, 500);
      
      return () => clearInterval(intervalId);
    }
  }, [isInTrialMode, completedTrialOrPayment, toast, navigate]);
  
  // Additional check on every render to catch any edge cases
  useEffect(() => {
    // Check if trial has expired or agents are locked and redirect if needed
    if (hasTrialTimeExpired() || areAIAgentsLocked()) {
      redirectToPricingOnExpiry();
    }
  });
  
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
    lockAIAgents();
    clearTrialAccess();
    // Force redirect to pricing page
    navigate('/pricing');
    return null; // Don't render anything else
  }
  
  // Final access flags that consider trial expiration
  const finalHasAccess = isTrialExpired ? false : (completedTrialOrPayment || hasAnySubscription);
  const finalHasMarkusAccess = isTrialExpired ? false : (hasMarkusAccess || completedTrialOrPayment);
  const finalHasKaraAccess = isTrialExpired ? false : (hasKaraAccess || completedTrialOrPayment);
  const finalHasJerryAccess = isTrialExpired ? false : (hasJerryAccess || completedTrialOrPayment);
  const finalHasChloeAccess = isTrialExpired ? false : (hasChloeAccess || completedTrialOrPayment);
  const finalHasLutherAccess = isTrialExpired ? false : (hasLutherAccess || completedTrialOrPayment);
  const finalHasConnorAccess = isTrialExpired ? false : (hasConnorAccess || completedTrialOrPayment);
  
  // Render trial warning for users in trial mode
  const renderTrialWarning = () => {
    if (isTrial && !isTrialExpired && remainingTime !== null) {
      return (
        <Alert variant="default" className="mb-6 mt-2 mx-4 bg-amber-50 border-amber-200 text-amber-800">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="flex items-center">
            Free Trial Active - Time Remaining: {formatRemainingTime(remainingTime)}
          </AlertTitle>
          <AlertDescription>
            ⚠️ Your free trial will expire soon! You have limited time to explore the AI agents.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };
  
  return (
    <AuthGuard user={user}>
      <DashboardLayout
        user={user}
        isInTrialMode={finalHasAccess && isInTrialMode}
        hasActiveSubscription={finalHasAccess && hasActiveSubscription}
        hasMarkusAccess={finalHasMarkusAccess}
        hasKaraAccess={finalHasKaraAccess}
        hasJerryAccess={finalHasJerryAccess}
        hasChloeAccess={finalHasChloeAccess}
        hasLutherAccess={finalHasLutherAccess}
        hasConnorAccess={finalHasConnorAccess}
      >
        {renderTrialWarning()}
        <DashboardView 
          userName={user?.email?.split('@')[0] || 'User'}
          subscription={subscription}
          isInTrialMode={finalHasAccess && isInTrialMode}
          hasActiveSubscription={finalHasAccess && hasActiveSubscription}
          hasMarkusAccess={finalHasMarkusAccess}
          hasKaraAccess={finalHasKaraAccess}
          hasJerryAccess={finalHasJerryAccess}
          hasChloeAccess={finalHasChloeAccess}
          hasLutherAccess={finalHasLutherAccess}
          hasConnorAccess={finalHasConnorAccess}
          hasAnySubscription={finalHasAccess}
          isRefreshing={false}
        />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default Dashboard;

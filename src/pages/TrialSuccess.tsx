
import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTrialSubscriptionRefresh } from "@/hooks/useTrialSubscriptionRefresh";
import { TrialStatusIndicator } from "@/components/trial/TrialStatusIndicator";
import { TrialInfoCards } from "@/components/trial/TrialInfoCards";
import { TrialActionButtons } from "@/components/trial/TrialActionButtons";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { forceAgentAccess } from "@/utils/forceAgentAccess";
import { resetTrialTimer } from "@/utils/trialTimerUtils";
import { Clock } from "lucide-react";

const TrialSuccess = () => {
  const { checkSubscription } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    isRefreshing,
    retryCount,
    isSubscriptionReady,
    handleManualRefresh
  } = useTrialSubscriptionRefresh();

  // Immediately set all access flags when page loads
  useEffect(() => {
    console.log("TrialSuccess - Setting all access flags on page load");
    localStorage.setItem('trialCompleted', 'true');
    localStorage.setItem('paymentCompleted', 'false'); // Set to false for trial
    localStorage.setItem('forceAgentAccess', 'true');
    
    // Reset the trial timer to ensure it starts fresh
    resetTrialTimer();
    
    // Show success toast only if it hasn't been shown yet in this session
    if (!sessionStorage.getItem('access_toast_shown')) {
      toast({
        title: "Trial Activated",
        description: "Your 7-day free trial has been activated. You now have access to all AI agents for 1 minute of usage.",
      });
      sessionStorage.setItem('access_toast_shown', 'true');
    }
  }, [toast]);

  // Attempt an immediate subscription refresh when the page loads
  useEffect(() => {
    const refreshSubscription = async () => {
      try {
        // CRITICAL: Always mark trial as completed and force access
        console.log("TrialSuccess - Forcing access and marking trial as completed");
        forceAgentAccess();
        
        // Force a subscription check
        if (checkSubscription) {
          await checkSubscription();
          console.log("Subscription status refreshed");
        }
      } catch (error) {
        console.error("Error refreshing subscription:", error);
        // Even on error, force agent access for best user experience
        forceAgentAccess();
      }
    };
    
    refreshSubscription();
    
    // Set a timeout to auto-redirect after 5 seconds
    const redirectTimer = setTimeout(() => {
      if (!isRefreshing) {
        console.log("Auto-redirecting to dashboard with access flag");
        navigate("/dashboard?access=true");
      }
    }, 5000);
    
    return () => clearTimeout(redirectTimer);
  }, [checkSubscription, toast, navigate, isRefreshing]);

  // If subscription is ready or manually passed, redirect to dashboard
  if (isSubscriptionReady && !isRefreshing) {
    console.log("Subscription ready - redirecting to dashboard with access flag");
    return <Navigate to="/dashboard?access=true" />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="text-center mb-8">
            <TrialStatusIndicator 
              isRefreshing={isRefreshing} 
              retryCount={retryCount} 
            />
            
            <h1 className="text-3xl font-bold mb-2">Free Trial Activated!</h1>
            <p className="text-muted-foreground mb-6">
              Your 7-day free trial has been successfully activated. You now have full access to all AI agents.
            </p>
            
            {/* Usage limit information */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center">
              <Clock className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
              <p className="text-amber-800 text-sm text-left">
                <span className="font-semibold">1-Minute Usage Limit:</span> Your free trial includes 1 minute of AI agent interaction time. After this limit is reached, you'll need to upgrade to continue using the agents.
              </p>
            </div>
            
            <TrialInfoCards 
              isSubscriptionReady={isSubscriptionReady}
              isRefreshing={isRefreshing}
              handleManualRefresh={handleManualRefresh}
            />
            
            <TrialActionButtons />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialSuccess;

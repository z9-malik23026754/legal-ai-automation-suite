
import React from "react";
import { Navigate } from "react-router-dom";
import { useTrialSubscriptionRefresh } from "@/hooks/useTrialSubscriptionRefresh";
import { TrialStatusIndicator } from "@/components/trial/TrialStatusIndicator";
import { TrialInfoCards } from "@/components/trial/TrialInfoCards";
import { TrialActionButtons } from "@/components/trial/TrialActionButtons";

const TrialSuccess = () => {
  const {
    isRefreshing,
    retryCount,
    isSubscriptionReady,
    handleManualRefresh
  } = useTrialSubscriptionRefresh();

  // If subscription is ready or manually passed, redirect to dashboard
  if (isSubscriptionReady && !isRefreshing) {
    return <Navigate to="/dashboard" />;
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
              Your 7-day free trial has been successfully activated. You now have full access to all AI agents and premium features.
            </p>
            
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


import React, { useState, useEffect, useCallback } from "react";
import { Loader, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { forceAgentAccess } from "@/utils/forceAgentAccess";

interface DashboardLoaderProps {
  attemptCount?: number; 
}

const DashboardLoader: React.FC<DashboardLoaderProps> = ({ attemptCount = 0 }) => {
  const [showManualOption, setShowManualOption] = useState(false);
  const [message, setMessage] = useState("Please wait while we load your dashboard and activate your AI agents.");
  const [loadingStage, setLoadingStage] = useState(0);
  const { toast } = useToast();
  
  // Check for payment success in URL
  const isFromPayment = new URLSearchParams(window.location.search).get('from') === 'success';
  
  // Progress through different loading messages to show progress
  useEffect(() => {
    // If coming from payment, start with a different message
    if (isFromPayment && loadingStage === 0) {
      setMessage("Payment confirmed! Finalizing your account access...");
      // Force access immediately for users coming from payment
      forceAgentAccess();
    }
    
    const messageTimers = [
      setTimeout(() => {
        setMessage(isFromPayment 
          ? "Setting up your AI agent access..." 
          : "Checking your subscription status...");
        setLoadingStage(1);
      }, 1500),
      
      setTimeout(() => {
        setMessage(isFromPayment 
          ? "Almost there! Activating your AI agents..." 
          : "Still preparing your AI agents. This may take a few moments...");
        setLoadingStage(2);
      }, 3500),
      
      setTimeout(() => {
        setMessage(isFromPayment 
          ? "Access confirmed! Preparing your dashboard..." 
          : "Almost there! Finalizing AI agent activation...");
        setLoadingStage(3);
      }, 6000),
      
      setTimeout(() => {
        setMessage("Your dashboard is taking longer than expected to load.");
        setLoadingStage(4);
        setShowManualOption(true);
      }, 9000)
    ];
    
    return () => {
      messageTimers.forEach(timer => clearTimeout(timer));
    };
  }, [isFromPayment]);
  
  // If attempt count changes, update the message but without resetting timers
  useEffect(() => {
    if (attemptCount > 1 && loadingStage < 2) {
      setMessage("Checking your subscription status again...");
      setLoadingStage(Math.max(loadingStage, 2));
    }
    
    if (attemptCount > 2) {
      setShowManualOption(true);
      setLoadingStage(Math.max(loadingStage, 3));
    }
  }, [attemptCount, loadingStage]);
  
  const handleManualRefresh = useCallback(() => {
    // Before refreshing, set local flags to ensure access on reload
    forceAgentAccess();
    
    toast({
      title: "Access granted",
      description: "We've unlocked your AI agents. The page will refresh now.",
      variant: "default"
    });
    
    // Short delay to show the toast before refreshing
    setTimeout(() => {
      window.location.href = '/dashboard?access=true';
    }, 1500);
  }, [toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="p-6 rounded-lg text-center max-w-md">
        {isFromPayment ? (
          <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full mb-6 mx-auto w-fit">
            <Loader className="h-12 w-12 text-green-600 dark:text-green-400 animate-spin" />
          </div>
        ) : (
          <Loader className="h-12 w-12 text-primary animate-spin mb-4 mx-auto" />
        )}
        
        <h2 className="text-xl font-bold mb-2">
          {isFromPayment ? "Activating Your Subscription" : "Preparing Your AI Agents"}
        </h2>
        
        <p className="text-muted-foreground mb-4">{message}</p>
        
        <div className="w-48 h-2 bg-muted rounded-full overflow-hidden mx-auto mb-4">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-in-out ${
              isFromPayment ? 'bg-green-500' : 'bg-primary'
            }`}
            style={{ 
              width: `${Math.min(25 * (loadingStage + 1), 100)}%`,
              animationDuration: '1.5s',
              animationName: 'pulse',
              animationIterationCount: 'infinite'
            }}
          ></div>
        </div>
        
        {showManualOption ? (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-3">
              {isFromPayment 
                ? "Your payment has been confirmed! Click below to access your dashboard immediately."
                : "If this takes too long, you can try manually refreshing the page."}
            </p>
            <Button 
              variant={isFromPayment ? "default" : "outline"}
              size="sm" 
              onClick={handleManualRefresh}
              className={`mx-auto ${isFromPayment ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {isFromPayment ? "Access Dashboard Now" : "Unlock Access & Refresh"}
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-4">
            {attemptCount > 0 ? `Subscription check (attempt ${attemptCount}/3)` : 'Initializing your dashboard...'}
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardLoader;

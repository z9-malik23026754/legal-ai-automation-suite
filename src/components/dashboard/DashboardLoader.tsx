
import React, { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLoaderProps {
  attemptCount?: number; 
}

const DashboardLoader: React.FC<DashboardLoaderProps> = ({ attemptCount = 0 }) => {
  const [showManualOption, setShowManualOption] = useState(false);
  const [message, setMessage] = useState("Please wait while we load your dashboard and activate your AI agents.");
  const [loadingStage, setLoadingStage] = useState(0);
  
  // Progress through different loading messages to show progress
  useEffect(() => {
    const messageTimers = [
      setTimeout(() => {
        setMessage("Checking your subscription status...");
        setLoadingStage(1);
      }, 2000),
      
      setTimeout(() => {
        setMessage("Still preparing your AI agents. This may take a few moments...");
        setLoadingStage(2);
      }, 5000),
      
      setTimeout(() => {
        setMessage("Almost there! Finalizing AI agent activation...");
        setLoadingStage(3);
      }, 8000),
      
      setTimeout(() => {
        setMessage("Your dashboard is taking longer than expected to load. Please be patient...");
        setLoadingStage(4);
        setShowManualOption(true);
      }, 12000)
    ];
    
    return () => {
      messageTimers.forEach(timer => clearTimeout(timer));
    };
  }, []);
  
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
  
  const handleManualRefresh = () => {
    // Before refreshing, set local flags to ensure access on reload
    localStorage.setItem('forceAgentAccess', 'true');
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="p-6 rounded-lg text-center max-w-md">
        <Loader className="h-12 w-12 text-primary animate-spin mb-4 mx-auto" />
        <h2 className="text-xl font-bold mb-2">Preparing Your AI Agents</h2>
        <p className="text-muted-foreground mb-4">{message}</p>
        
        <div className="w-48 h-2 bg-muted rounded-full overflow-hidden mx-auto mb-4">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-1000 ease-in-out" 
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
              If this takes too long, you can try refreshing the page. This will ensure your access is ready.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              className="mx-auto"
            >
              Unlock Access & Refresh
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

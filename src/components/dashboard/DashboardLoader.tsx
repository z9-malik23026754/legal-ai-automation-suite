
import React, { useState, useEffect, useCallback } from "react";
import { Loader, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { forceAgentAccess } from "@/utils/forceAgentAccess";

interface DashboardLoaderProps {
  attemptCount?: number; 
}

const DashboardLoader: React.FC<DashboardLoaderProps> = ({ attemptCount = 0 }) => {
  const [showManualOption, setShowManualOption] = useState(true); // Always show manual option
  const [message, setMessage] = useState("Please wait while we load your dashboard and activate your AI agents.");
  const [loadingStage, setLoadingStage] = useState(3); // Start at higher stage
  const { toast } = useToast();
  
  // Check for payment success in URL
  const isFromPayment = new URLSearchParams(window.location.search).get('from') === 'success';
  
  // EMERGENCY FIX: Force access immediately on component mount
  useEffect(() => {
    console.log("EMERGENCY FIX: Forcing access on DashboardLoader mount");
    forceAgentAccess();
    
    // Show message about temporary fix
    setMessage("We're preparing your AI agents. Click 'Unlock Access & Refresh' to continue.");
    setLoadingStage(4);
  }, []);
  
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
        
        {showManualOption && (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-3">
              {isFromPayment 
                ? "Your payment has been confirmed! Click below to access your dashboard immediately."
                : "If this takes too long, click the button below to unlock access immediately."}
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
        )}
      </div>
    </div>
  );
};

export default DashboardLoader;

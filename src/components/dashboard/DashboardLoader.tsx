
import React, { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLoaderProps {
  attemptCount?: number; 
}

const DashboardLoader: React.FC<DashboardLoaderProps> = ({ attemptCount = 0 }) => {
  const [showManualOption, setShowManualOption] = useState(false);
  const [message, setMessage] = useState("Please wait while we load your dashboard and activate your AI agents.");
  
  // Stabilize the message based on load time
  useEffect(() => {
    // If loading takes too long, update the message
    const longLoadTimeout = setTimeout(() => {
      setMessage("Still preparing your AI agents. This may take a few moments...");
    }, 3000);
    
    // If loading takes even longer, show manual refresh option
    const veryLongLoadTimeout = setTimeout(() => {
      setMessage("Your dashboard is taking longer than expected to load. Please be patient...");
      setShowManualOption(true);
    }, 8000);
    
    // Clean up timers
    return () => {
      clearTimeout(longLoadTimeout);
      clearTimeout(veryLongLoadTimeout);
    };
  }, []);
  
  // Stabilize message based on attempt count but don't change it too frequently
  useEffect(() => {
    if (attemptCount > 2) {
      setMessage("Your dashboard is taking longer than expected to load. Please be patient...");
      setShowManualOption(true);
    }
  }, [attemptCount]);
  
  const handleManualRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="p-6 rounded-lg text-center max-w-md">
        <Loader className="h-12 w-12 text-primary animate-spin mb-4 mx-auto" />
        <h2 className="text-xl font-bold mb-2">Preparing Your AI Agents</h2>
        <p className="text-muted-foreground mb-4">{message}</p>
        
        <div className="w-48 h-2 bg-muted rounded-full overflow-hidden mx-auto mb-4">
          <div className="h-full bg-primary animate-pulse rounded-full"></div>
        </div>
        
        {showManualOption ? (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-3">
              If this takes too long, you can try refreshing the page.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              className="mx-auto"
            >
              Refresh Page
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-4">
            Checking subscription status {attemptCount > 0 ? `(attempt ${attemptCount}/3)` : ''}...
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardLoader;

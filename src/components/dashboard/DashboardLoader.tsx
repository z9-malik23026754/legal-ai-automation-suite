
import React from "react";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLoaderProps {
  attemptCount?: number; 
}

const DashboardLoader: React.FC<DashboardLoaderProps> = ({ attemptCount = 0 }) => {
  const handleManualRefresh = () => {
    window.location.reload();
  };
  
  // Show different messages based on load time
  const getMessage = () => {
    if (attemptCount <= 1) {
      return "Please wait while we load your dashboard and activate your AI agents.";
    } else if (attemptCount === 2) {
      return "Still preparing your AI agents. This may take a few moments...";
    } else {
      return "Your dashboard is taking longer than expected to load. Please be patient...";
    }
  };
  
  // Show manual refresh option after multiple attempts
  const showManualRefresh = attemptCount > 2;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="p-6 rounded-lg text-center max-w-md">
        <Loader className="h-12 w-12 text-primary animate-spin mb-4 mx-auto" />
        <h2 className="text-xl font-bold mb-2">Preparing Your AI Agents</h2>
        <p className="text-muted-foreground mb-4">{getMessage()}</p>
        
        <div className="w-48 h-2 bg-muted rounded-full overflow-hidden mx-auto mb-4">
          <div className="h-full bg-primary animate-pulse rounded-full"></div>
        </div>
        
        {showManualRefresh ? (
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

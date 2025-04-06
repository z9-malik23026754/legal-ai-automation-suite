
import React, { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { forceAgentAccess } from "@/utils/forceAgentAccess";

interface DashboardLoaderProps {
  attemptCount?: number; 
}

const DashboardLoader: React.FC<DashboardLoaderProps> = ({ attemptCount = 0 }) => {
  const [message, setMessage] = useState("Preparing your AI agents...");
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
  // Check for payment success in URL
  const isFromPayment = new URLSearchParams(window.location.search).get('from') === 'success';
  
  // Force access and auto-redirect without requiring manual interaction
  useEffect(() => {
    console.log("DashboardLoader - Forcing access and initiating auto-redirect");
    forceAgentAccess();
    
    // Show progress bar animation
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 15;
        
        // Update messages based on progress
        if (newProgress >= 30 && newProgress < 60) {
          setMessage("Activating your AI agents...");
        } else if (newProgress >= 60 && newProgress < 90) {
          setMessage("Almost ready...");
        } else if (newProgress >= 90) {
          setMessage("Complete! Redirecting to dashboard...");
        }
        
        return Math.min(newProgress, 100);
      });
    }, 600);
    
    // Auto-redirect after showing the progress animation (3 seconds)
    const redirectTimer = setTimeout(() => {
      clearInterval(interval);
      
      toast({
        title: "Access Granted",
        description: "Your AI agents are ready to use.",
        variant: "default"
      });
      
      // Redirect to dashboard with access flag
      window.location.href = '/dashboard?access=true';
    }, 3000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(redirectTimer);
    };
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
            className={`h-full rounded-full transition-all duration-500 ease-in-out ${
              isFromPayment ? 'bg-green-500' : 'bg-primary'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-muted-foreground animate-pulse mt-4">
          Please wait while we finish setting up...
        </p>
      </div>
    </div>
  );
};

export default DashboardLoader;

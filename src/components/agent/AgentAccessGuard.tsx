
import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { forceAgentAccess, shouldForceAccess, hasCompletedTrialOrPayment } from "@/utils/forceAgentAccess";
import { Button } from "@/components/ui/button";
import { useStartFreeTrial } from "@/hooks/useStartFreeTrial";
import { hasTrialTimeExpired, clearTrialAccess } from "@/utils/trialTimerUtils";

interface AgentAccessGuardProps {
  agentId: string;
  children: React.ReactNode;
}

const AgentAccessGuard: React.FC<AgentAccessGuardProps> = ({ agentId, children }) => {
  const { user, subscription } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { startTrial, isProcessing } = useStartFreeTrial();
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  
  // Check if user has any kind of access
  const hasAccess = React.useMemo(() => {
    // Check for trial expiration first
    const isInTrialMode = subscription?.status === 'trial' || 
                          localStorage.getItem('trialCompleted') === 'true';
    
    if (isInTrialMode && hasTrialTimeExpired()) {
      console.log(`AgentAccessGuard: Trial expired for ${agentId}`);
      return false;
    }
    
    // First check if the user has explicitly completed a trial or payment
    if (hasCompletedTrialOrPayment()) {
      console.log(`AgentAccessGuard: User has completed trial or payment for ${agentId}`);
      return true;
    }
    
    // Check subscription status from database
    if (subscription && 
        (subscription.status === 'trial' || 
         subscription.status === 'active')) {
      console.log(`AgentAccessGuard: User has valid subscription status (${subscription.status}) for ${agentId}`);
      return true;
    }
    
    // Check if the agent is specifically purchased
    if (subscription) {
      const hasSpecificAccess = 
        (agentId === 'markus' && subscription.markus) ||
        (agentId === 'kara' && subscription.kara) ||
        (agentId === 'connor' && subscription.connor) ||
        (agentId === 'chloe' && subscription.chloe) ||
        (agentId === 'luther' && subscription.luther) ||
        (subscription.allInOne);
        
      if (hasSpecificAccess) {
        console.log(`AgentAccessGuard: User has specific access to ${agentId}`);
        return true;
      }
    }
    
    console.log(`AgentAccessGuard: User does NOT have access to ${agentId}`);
    return false;
  }, [subscription, agentId]);
  
  // Check for trial time expiration
  useEffect(() => {
    // If user is in trial mode, check if trial time has expired
    const isInTrialMode = subscription?.status === 'trial' || 
                          localStorage.getItem('trialCompleted') === 'true';
    
    if (isInTrialMode && !localStorage.getItem('paymentCompleted')) {
      const checkTrialTime = () => {
        const expired = hasTrialTimeExpired();
        if (expired) {
          // Clear all trial access flags to ensure complete lockout
          clearTrialAccess();
          setIsTrialExpired(true);
          
          // Show toast about expiration
          toast({
            title: "Trial Time Expired",
            description: "Your 1-minute free trial has ended. Please upgrade to continue using the AI agents.",
            variant: "destructive",
          });
          
          // Immediately redirect to pricing page
          navigate('/pricing');
        }
      };
      
      // Initial check
      checkTrialTime();
      
      // Set up periodic checks
      const intervalId = setInterval(checkTrialTime, 3000); // Check every 3 seconds
      
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [subscription, toast, navigate]);
  
  // Run force access only if user has legitimate access and trial hasn't expired
  useEffect(() => {
    if (hasAccess && !isTrialExpired) {
      forceAgentAccess();
      
      // Only show toast if we haven't shown it for this agent yet
      const toastShownKey = `agent_toast_shown_${agentId}`;
      if (!sessionStorage.getItem(toastShownKey)) {
        toast({
          title: "AI Agent Ready",
          description: `You have access to this AI agent.`,
          variant: "default",
        });
        
        // Mark this toast as shown for this session
        sessionStorage.setItem(toastShownKey, 'true');
      }
    }
  }, [toast, agentId, hasAccess, isTrialExpired]);
  
  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  // If user's trial time has expired, show upgrade message
  if (isTrialExpired) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-4">
        <div className="bg-card border rounded-lg p-8 shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Trial Time Expired</h2>
          <p className="mb-6 text-muted-foreground">
            Your 1-minute free trial has ended. Please upgrade to a full subscription to continue using our AI agents.
          </p>
          
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/pricing')}
            >
              View Subscription Plans
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // If user doesn't have access, show subscription options
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-4">
        <div className="bg-card border rounded-lg p-8 shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Agent Access Required</h2>
          <p className="mb-6 text-muted-foreground">
            You need to start a free trial or purchase a subscription to access this AI agent.
          </p>
          
          <div className="space-y-4">
            <Button 
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90"
              onClick={startTrial}
              disabled={isProcessing}
            >
              Start 7-Day Free Trial (1 Minute Usage)
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/pricing')}
            >
              View Subscription Plans
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // If user has access, render children
  return <>{children}</>;
};

export default AgentAccessGuard;

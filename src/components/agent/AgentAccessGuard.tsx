import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { forceAgentAccess, shouldForceAccess, hasCompletedTrialOrPayment } from "@/utils/forceAgentAccess";
import { Button } from "@/components/ui/button";
import { useStartFreeTrial } from "@/hooks/useStartFreeTrial";
import { 
  hasTrialTimeExpired, clearTrialAccess, getRemainingTrialTime, 
  hasUsedTrialBefore, lockAIAgents, redirectToPricingOnExpiry, areAIAgentsLocked 
} from "@/utils/trialTimerUtils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Clock } from "lucide-react";

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
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [hasUsedTrial, setHasUsedTrial] = useState(false);
  
  // Check if user has used a trial before and if agents are locked
  useEffect(() => {
    setHasUsedTrial(hasUsedTrialBefore());
    setIsTrialExpired(areAIAgentsLocked());
  }, []);
  
  // Check if user has any kind of access
  const hasAccess = React.useMemo(() => {
    // First check if agents are locked
    if (areAIAgentsLocked()) {
      console.log(`AgentAccessGuard: Agents are locked for ${agentId}`);
      return false;
    }
    
    // Check for trial expiration
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
        (agentId === 'jerry' && subscription.jerry) ||
        (agentId === 'chloe' && subscription.chloe) ||
        (agentId === 'luther' && subscription.luther) ||
        (agentId === 'connor' && subscription.allInOne);
        
      if (hasSpecificAccess) {
        console.log(`AgentAccessGuard: User has specific access to ${agentId}`);
        return true;
      }
    }
    
    console.log(`AgentAccessGuard: User does NOT have access to ${agentId}`);
    return false;
  }, [subscription, agentId]);
  
  // Format remaining time for display
  const formatRemainingTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Check for trial time expiration with more frequent updates
  useEffect(() => {
    // If user is in trial mode or agents are locked, check status
    const isInTrialMode = subscription?.status === 'trial' || 
                          localStorage.getItem('trialCompleted') === 'true';
    
    if ((isInTrialMode && !localStorage.getItem('paymentCompleted')) || areAIAgentsLocked()) {
      const checkTrialTime = () => {
        const timeLeft = getRemainingTrialTime();
        setRemainingTime(timeLeft);
        
        const expired = hasTrialTimeExpired();
        if (expired) {
          // Lock AI agents and clear all trial access flags
          lockAIAgents();
          clearTrialAccess();
          setIsTrialExpired(true);
          
          // Show toast about expiration
          toast({
            title: "Trial Time Expired",
            description: "Your 1-minute free trial has ended. Please upgrade to continue using the AI agents.",
            variant: "destructive",
          });
          
          // Redirect to pricing page
          navigate('/pricing');
        }
      };
      
      // Initial check
      checkTrialTime();
      
      // Set up more frequent checks (every 500ms) for smoother countdown
      const intervalId = setInterval(checkTrialTime, 500);
      
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
  
  // Automatic check for trial expiration on every render
  useEffect(() => {
    // Check if trial has expired and redirect if needed
    if (hasTrialTimeExpired() && !localStorage.getItem('paymentCompleted')) {
      redirectToPricingOnExpiry();
    }
  });
  
  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  // If user's trial time has expired, show upgrade message and redirect
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
            {hasUsedTrial 
              ? "You need to purchase a subscription to access this AI agent."
              : "You need to start a free trial or purchase a subscription to access this AI agent."
            }
          </p>
          
          <div className="space-y-4">
            {!hasUsedTrial && (
              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90"
                onClick={startTrial}
                disabled={isProcessing}
              >
                Start 1-Minute Free Trial
              </Button>
            )}
            
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
  
  // If trial is active, display warning alert with time remaining
  const isInTrialMode = subscription?.status === 'trial' || localStorage.getItem('trialCompleted') === 'true';
  const isPaymentCompleted = localStorage.getItem('paymentCompleted') === 'true';
  const shouldShowWarning = isInTrialMode && !isPaymentCompleted && !isTrialExpired;
  
  // If user has access, render children with optional warning
  return (
    <>
      {shouldShowWarning && remainingTime !== null && (
        <Alert variant="default" className="mb-6 mt-2 mx-4 bg-amber-50 border-amber-200 text-amber-800">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="flex items-center gap-2">
            Free Trial Active - Time Remaining: {formatRemainingTime(remainingTime)}
          </AlertTitle>
          <AlertDescription>
            ⚠️ Your free trial will expire soon! You have limited time to explore this AI agent.
          </AlertDescription>
        </Alert>
      )}
      {children}
    </>
  );
};

export default AgentAccessGuard;

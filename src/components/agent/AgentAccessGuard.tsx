
import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { forceAgentAccess, shouldForceAccess, hasCompletedTrialOrPayment } from "@/utils/forceAgentAccess";
import { Button } from "@/components/ui/button";
import { useStartFreeTrial } from "@/hooks/useStartFreeTrial";

interface AgentAccessGuardProps {
  agentId: string;
  children: React.ReactNode;
}

const AgentAccessGuard: React.FC<AgentAccessGuardProps> = ({ agentId, children }) => {
  const { user, subscription } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { startTrial, isProcessing } = useStartFreeTrial();
  
  // Check if user has any kind of access
  const hasAccess = React.useMemo(() => {
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
  
  // Run force access only if user has legitimate access
  React.useEffect(() => {
    if (hasAccess) {
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
  }, [toast, agentId, hasAccess]);
  
  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/signin" replace />;
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
              Start 7-Day Free Trial
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

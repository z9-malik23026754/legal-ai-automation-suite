
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { forceAgentAccess } from "@/utils/forceAgentAccess";

interface AgentAccessGuardProps {
  agentId: string;
  children: React.ReactNode;
}

const AgentAccessGuard: React.FC<AgentAccessGuardProps> = ({ agentId, children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Run force access to ensure all localStorage flags are set
  // But only show toast if it's the first time we're accessing this agent in this session
  React.useEffect(() => {
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
  }, [toast, agentId]);
  
  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  // Always grant access to all agents when user is logged in
  console.log("AgentAccessGuard: Granting full access to agent:", agentId);
  return <>{children}</>;
};

export default AgentAccessGuard;

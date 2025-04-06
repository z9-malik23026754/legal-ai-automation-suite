
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
  React.useEffect(() => {
    forceAgentAccess();
    
    // Show success toast to confirm access
    toast({
      title: "AI Agent Ready",
      description: `You have access to this AI agent.`,
      variant: "default",
    });
  }, [toast]);
  
  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  // Always grant access to all agents when user is logged in
  console.log("AgentAccessGuard: Granting full access to agent:", agentId);
  return <>{children}</>;
};

export default AgentAccessGuard;

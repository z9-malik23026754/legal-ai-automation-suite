
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
  
  // Run force access to ensure all localStorage flags are set
  React.useEffect(() => {
    forceAgentAccess();
  }, []);
  
  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  // Immediately grant access to all agents
  console.log("AgentAccessGuard: Bypassing all access checks for agent:", agentId);
  return <>{children}</>;
};

export default AgentAccessGuard;

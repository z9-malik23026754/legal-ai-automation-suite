
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getAgentInfo } from "@/utils/agentUtils";
import { useToast } from "@/components/ui/use-toast";
import { shouldForceAccess } from "@/utils/forceAgentAccess";

interface AgentAccessGuardProps {
  agentId: string;
  children: React.ReactNode;
}

const AgentAccessGuard: React.FC<AgentAccessGuardProps> = ({ agentId, children }) => {
  const { user, subscription } = useAuth();
  const { toast } = useToast();
  
  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  // Check if user has access to this specific agent
  const { hasAccess } = getAgentInfo(agentId, subscription);
  const forceAccess = shouldForceAccess();
  
  console.log(`AgentAccessGuard: Checking access for ${agentId}`, { 
    hasAccess, 
    subscription,
    forceAccess
  });
  
  // User has legitimate access or force access is enabled (for testing)
  if (hasAccess || forceAccess) {
    return <>{children}</>;
  }
  
  // User doesn't have access - show toast and redirect to pricing page
  toast({
    title: "Access Restricted",
    description: "You need a subscription to access this AI agent. Please upgrade your plan or start a free trial.",
    variant: "destructive",
  });
  
  // Redirect to pricing page instead of dashboard
  return <Navigate to="/pricing" replace />;
};

export default AgentAccessGuard;

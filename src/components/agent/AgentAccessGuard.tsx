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
  
  // ENHANCED ACCESS CHECK: If user has ANY valid subscription status, grant immediate access
  if (subscription?.status === 'trial' || 
      subscription?.status === 'active' || 
      subscription?.status === 'pending') {
    console.log(`User has ${subscription.status} subscription status - granting immediate access to ${agentId}`);
    return <>{children}</>;
  }
  
  // Check localStorage for trial completion flag
  const trialCompleted = localStorage.getItem('trialCompleted') === 'true';
  if (trialCompleted) {
    console.log('Trial completion flag found in localStorage - granting access');
    return <>{children}</>;
  }
  
  // Otherwise check specific agent access
  const { hasAccess } = getAgentInfo(agentId, subscription);
  const forceAccess = shouldForceAccess();
  
  console.log(`AgentAccessGuard: Checking access for ${agentId}`, { 
    hasAccess, 
    subscription,
    forceAccess,
    status: subscription?.status,
    trialCompleted
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

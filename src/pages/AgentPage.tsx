
import React from "react";
import { useParams, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { getAgentInfo } from "@/utils/agentUtils";
import { useAgentSetup } from "@/components/agent/useAgentSetup";
import AgentHeader from "@/components/agent/AgentHeader";
import AgentContainer from "@/components/agent/AgentContainer";

const AgentPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const { user, subscription } = useAuth();
  const { webhookUrl, handleWebhookChange } = useAgentSetup(agentId);
  
  // If no user, redirect to sign in
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  // Check if the user has access to this agent
  const { hasAccess, agentName, agentColor } = getAgentInfo(agentId, subscription);
  
  // If invalid agent or no access, redirect
  if (agentName === "") {
    return <Navigate to="/dashboard" replace />;
  }
  
  // If no access, redirect to pricing
  if (!hasAccess) {
    return <Navigate to="/pricing" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="container mx-auto px-4 h-full pb-4 max-w-5xl">
          <AgentHeader agentName={agentName} agentColor={agentColor} />
          <AgentContainer 
            agentName={agentName} 
            agentColor={agentColor}
            webhookUrl={webhookUrl}
            onWebhookChange={handleWebhookChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AgentPage;

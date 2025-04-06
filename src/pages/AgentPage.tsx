
import React from "react";
import { useParams, Navigate } from "react-router-dom";
import AgentContainer from "@/components/agent/AgentContainer";
import { useAuth } from "@/contexts/AuthContext";
import AgentAccessGuard from "@/components/agent/AgentAccessGuard";
import { getAgentInfo } from "@/utils/agentUtils";
import { useAgentSetup } from "@/components/agent/useAgentSetup";

const AgentPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const { user, subscription } = useAuth();
  
  if (!agentId) {
    return <Navigate to="/dashboard" replace />;
  }

  // Get agent info from the utils
  const { agentName, agentColor } = getAgentInfo(agentId, subscription);
  const { webhookUrl, handleWebhookChange } = useAgentSetup(agentId);

  // We're now using AgentAccessGuard to handle all access checks
  // No need for hasAccess check here as the guard component will handle it
  return (
    <AgentAccessGuard agentId={agentId}>
      <AgentContainer 
        agentName={agentName} 
        agentColor={agentColor} 
        webhookUrl={webhookUrl}
        onWebhookChange={handleWebhookChange}
      />
    </AgentAccessGuard>
  );
};

export default AgentPage;

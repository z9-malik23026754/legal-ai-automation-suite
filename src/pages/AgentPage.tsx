
import React from "react";
import { useParams } from "react-router-dom";
import AgentContainer from "@/components/agent/AgentContainer";
import { useAuth } from "@/contexts/AuthContext";
import AgentAccessGuard from "@/components/agent/AgentAccessGuard";
import { getAgentInfo } from "@/utils/agentUtils";
import { useAgentSetup } from "@/components/agent/useAgentSetup";

const AgentPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const { user, subscription } = useAuth();
  const { webhookUrl, handleWebhookChange } = useAgentSetup(agentId);

  if (!agentId) {
    return <div>Agent not found</div>;
  }

  // Get agent info from the utils
  const { agentName, agentColor } = getAgentInfo(agentId, subscription);

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

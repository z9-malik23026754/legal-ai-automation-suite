
import React from "react";
import { useParams } from "react-router-dom";
import AgentContainer from "@/components/agent/AgentContainer";
import { useAuth } from "@/contexts/AuthContext";
import AgentAccessGuard from "@/components/agent/AgentAccessGuard";

const AgentPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const { user } = useAuth();

  if (!agentId) {
    return <div>Agent not found</div>;
  }

  return (
    <AgentAccessGuard agentId={agentId}>
      <AgentContainer agentId={agentId} />
    </AgentAccessGuard>
  );
};

export default AgentPage;

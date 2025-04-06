
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
  const { agentName, agentColor, hasAccess } = getAgentInfo(agentId, subscription);
  const { webhookUrl, handleWebhookChange } = useAgentSetup(agentId);

  // If user is logged in but has no access, show blank page
  if (user && !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
          <p className="mb-6">
            You need a subscription to access this AI agent. Please upgrade your plan or start a free trial.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/pricing" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">
              View Plans
            </a>
            <a href="/dashboard" className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

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

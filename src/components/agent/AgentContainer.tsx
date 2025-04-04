
import React from "react";
import ChatInterface from "@/components/ChatInterface";

interface AgentContainerProps {
  agentName: string;
  agentColor: string;
  webhookUrl: string;
  onWebhookChange: (url: string) => void;
}

const AgentContainer: React.FC<AgentContainerProps> = ({ 
  agentName, 
  agentColor, 
  webhookUrl, 
  onWebhookChange 
}) => {
  return (
    <>
      <div className={`border rounded-xl overflow-hidden shadow-chatfuel transition-all duration-300 chat-container agent-glow-${agentColor} bg-white`}>
        <ChatInterface 
          agentName={agentName}
          agentColor={agentColor}
          webhookUrl={webhookUrl}
          onWebhookChange={onWebhookChange}
        />
      </div>
      
      <div className="mt-4 text-center text-xs text-muted-foreground">
        Powered by BusinessAI · Webhook requests will be processed by automation tools
      </div>
    </>
  );
};

export default AgentContainer;

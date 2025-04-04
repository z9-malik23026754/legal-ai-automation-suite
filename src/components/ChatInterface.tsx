
import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Code } from "lucide-react";
import { useDeveloper } from "@/contexts/DeveloperContext";
import MessageBubble from "@/components/chat/MessageBubble";
import LoadingIndicator from "@/components/chat/LoadingIndicator";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatFooter from "@/components/chat/ChatFooter";
import { Message } from "@/types/chat";
import { getSimulatedResponse } from "@/utils/chatResponseUtils";

interface ChatInterfaceProps {
  agentName: string;
  agentColor: string;
  webhookUrl: string;
  onWebhookChange: (url: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  agentName,
  agentColor,
  webhookUrl,
  onWebhookChange
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hi, I'm ${agentName}! How can I assist you today?`,
      sender: 'agent',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const { isDeveloper } = useDeveloper();
  const [webhookUrls, setWebhookUrls] = useState<string[]>([]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Load all configured webhooks for this agent
  useEffect(() => {
    const agentId = agentName.toLowerCase();
    const loadWebhooks = () => {
      const urls: string[] = [];
      const countStr = localStorage.getItem(`webhook_${agentId}_count`);
      const count = countStr ? parseInt(countStr) : 0;
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const url = localStorage.getItem(`webhook_${agentId}_${i}_url`);
          if (url) {
            urls.push(url);
          }
        }
      }
      
      // If we have webhook URLs and none was already set, use the first one
      if (urls.length > 0 && !webhookUrl) {
        onWebhookChange(urls[0]);
      }
      
      setWebhookUrls(urls);
    };
    
    loadWebhooks();
  }, [agentName, webhookUrl, onWebhookChange]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (input: string) => {
    if (webhookUrls.length === 0) {
      toast({
        title: "Webhook Configuration Required",
        description: isDeveloper 
          ? "Please configure at least one webhook URL to process this request." 
          : "This agent is not fully configured yet. Please contact the administrator.",
        variant: "destructive",
      });
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      // Send request to all configured webhooks for this agent
      const sendPromises = webhookUrls.map(async (url) => {
        console.log(`Sending request to webhook: ${url}`);
        return fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors", // Using no-cors mode for cross-origin requests
          body: JSON.stringify({
            message: input,
            agent: agentName,
            timestamp: new Date().toISOString(),
          }),
        });
      });

      // Execute all requests in parallel
      await Promise.all(sendPromises);

      // Since we're using no-cors, we can't actually read the response
      // So we'll simulate a response from the agent
      setTimeout(() => {
        const agentResponse: Message = {
          id: Date.now().toString(),
          content: getSimulatedResponse(agentName, input),
          sender: 'agent',
          timestamp: new Date()
        };
        
        setMessages((prevMessages) => [...prevMessages, agentResponse]);
        setIsLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error("Error calling webhooks:", error);
      
      toast({
        title: "Error",
        description: "Failed to process your request. Please check your webhook URLs and try again.",
        variant: "destructive",
      });
      
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        agentName={agentName}
        agentColor={agentColor}
        webhookUrls={webhookUrls}
        webhookUrl={webhookUrl}
        onWebhookChange={onWebhookChange}
        isDeveloper={isDeveloper}
        isConfigOpen={isConfigOpen}
        setIsConfigOpen={setIsConfigOpen}
      />
      
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9FAFC]"
      >
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            id={message.id}
            content={message.content}
            sender={message.sender}
            timestamp={message.timestamp}
            agentColor={agentColor}
          />
        ))}
        {isLoading && <LoadingIndicator agentColor={agentColor} />}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatFooter 
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        agentName={agentName}
        agentColor={agentColor}
      />
    </div>
  );
};

export default ChatInterface;

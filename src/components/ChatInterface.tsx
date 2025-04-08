
import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Code, Clock } from "lucide-react";
import { useDeveloper } from "@/contexts/DeveloperContext";
import MessageBubble from "@/components/chat/MessageBubble";
import LoadingIndicator from "@/components/chat/LoadingIndicator";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatFooter from "@/components/chat/ChatFooter";
import { Message } from "@/types/chat";
import { getSimulatedResponse } from "@/utils/chatResponseUtils";
import { useAuth } from "@/contexts/AuthContext";
import { getRemainingTrialTime, hasTrialTimeExpired } from "@/utils/trialTimerUtils";
import { useNavigate } from "react-router-dom";

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
  const { subscription } = useAuth();
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const navigate = useNavigate();

  // Check if user is in trial mode
  const isInTrialMode = subscription?.status === 'trial';
  
  // Timer for trial users
  useEffect(() => {
    if (isInTrialMode) {
      // Update remaining time every second
      const updateRemainingTime = () => {
        const timeLeft = getRemainingTrialTime();
        setRemainingTime(timeLeft);
        
        // If time expired, redirect to pricing page
        if (timeLeft <= 0 || hasTrialTimeExpired()) {
          toast({
            title: "Trial Time Expired",
            description: "Your 1-minute free trial has ended. Please upgrade to continue.",
            variant: "destructive",
          });
          
          // Redirect to pricing page after a short delay
          setTimeout(() => {
            navigate('/pricing');
          }, 1500);
        }
      };
      
      // Initial update
      updateRemainingTime();
      
      // Set up interval
      const intervalId = setInterval(updateRemainingTime, 1000); // Check every second
      
      return () => {
        clearInterval(intervalId);
      };
    } else {
      setRemainingTime(null);
    }
  }, [isInTrialMode, toast, navigate]);
  
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
    // Check if trial has expired before processing
    if (isInTrialMode && hasTrialTimeExpired()) {
      toast({
        title: "Trial Time Expired",
        description: "Your 1-minute free trial has ended. Please upgrade to continue.",
        variant: "destructive",
      });
      
      // Redirect to pricing page
      navigate('/pricing');
      return;
    }
    
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

  // Format remaining time as MM:SS
  const formatRemainingTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
      
      {/* Trial timer countdown */}
      {isInTrialMode && remainingTime !== null && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center">
          <Clock className="h-4 w-4 text-amber-600 mr-2" />
          <span className="text-amber-800 text-sm font-medium">
            Free trial time remaining: {formatRemainingTime(remainingTime)}
          </span>
        </div>
      )}
      
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

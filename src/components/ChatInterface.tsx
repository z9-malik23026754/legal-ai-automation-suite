
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Send } from "lucide-react";
import { useDeveloper } from "@/contexts/DeveloperContext";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

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
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const { isDeveloper } = useDeveloper();
  const [webhookUrls, setWebhookUrls] = useState<string[]>([]);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
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
    setInput("");
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

  // Function to simulate responses based on agent and input
  const getSimulatedResponse = (agent: string, userInput: string): string => {
    const input = userInput.toLowerCase();
    
    switch(agent) {
      case 'Markus':
        if (input.includes('intake') || input.includes('new client')) {
          return "I can help you set up an automated client intake process. Would you like to create a new intake form or modify an existing one?";
        } else if (input.includes('faq') || input.includes('question')) {
          return "I can help you build a knowledge base for frequently asked questions. What topics would you like to cover?";
        }
        return "I can help you create chatbots for your website, client portals, or internal tools. What specific use case are you interested in?";
        
      case 'Kara':
        if (input.includes('call') || input.includes('phone')) {
          return "I can set up automated phone calls for appointment reminders. Would you like me to show you how to configure this?";
        } else if (input.includes('sms') || input.includes('text')) {
          return "SMS messaging is perfect for brief updates and reminders. Would you like to create a new SMS template?";
        }
        return "I can help you set up voice agents for client calls or SMS messaging for appointment reminders. What would you like to configure?";
        
      case 'Connor':
        if (input.includes('email') || input.includes('newsletter')) {
          return "I can help you design and schedule email campaigns. Would you like to create a new campaign or work from a template?";
        } else if (input.includes('content') || input.includes('blog')) {
          return "I can generate content for your blog or website. What topics would you like to cover?";
        }
        return "I specialize in marketing automation for law firms. Would you like help with email campaigns, content generation, or social media posts?";
        
      default:
        return "I'm here to help automate your legal practice. What specific task can I assist you with today?";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-card border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`agent-label-${agentColor} p-2 rounded-md`}>
              {agentName === 'Markus' && <span className="text-markus">M</span>}
              {agentName === 'Kara' && <span className="text-kara">K</span>}
              {agentName === 'Connor' && <span className="text-connor">C</span>}
            </div>
            <div>
              <h2 className="font-semibold">{agentName}</h2>
              <p className="text-xs text-muted-foreground">
                {webhookUrls.length > 0 
                  ? `${webhookUrls.length} webhook${webhookUrls.length > 1 ? 's' : ''} configured` 
                  : "Not configured"}
              </p>
            </div>
          </div>
          {isDeveloper && (
            <div className="w-1/2 text-xs">
              <p className="mb-1">Webhooks: {webhookUrls.length}</p>
              <Input
                type="text"
                placeholder="Enter webhook URL (for testing only)"
                value={webhookUrl}
                onChange={(e) => onWebhookChange(e.target.value)}
                className="text-xs"
              />
            </div>
          )}
        </div>
      </div>
      
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : `agent-label-${agentColor} bg-${agentColor}/10`
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className={`max-w-[80%] rounded-lg px-4 py-2 agent-label-${agentColor} bg-${agentColor}/10`}>
              <div className="flex space-x-2">
                <div className={`h-2 w-2 rounded-full bg-${agentColor} animate-pulse`}></div>
                <div className={`h-2 w-2 rounded-full bg-${agentColor} animate-pulse delay-150`}></div>
                <div className={`h-2 w-2 rounded-full bg-${agentColor} animate-pulse delay-300`}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            type="text"
            placeholder={`Message ${agentName}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;

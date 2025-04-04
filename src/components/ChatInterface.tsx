
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Send, Info, Code, Settings } from "lucide-react";
import { useDeveloper } from "@/contexts/DeveloperContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`agent-label-${agentColor} p-2 rounded-lg flex items-center justify-center w-10 h-10`}>
              {agentName === 'Markus' && <span className={`text-${agentColor} text-xl font-bold`}>M</span>}
              {agentName === 'Kara' && <span className={`text-${agentColor} text-xl font-bold`}>K</span>}
              {agentName === 'Connor' && <span className={`text-${agentColor} text-xl font-bold`}>C</span>}
            </div>
            <div>
              <h2 className="font-semibold text-lg">{agentName}</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full bg-${agentColor} inline-block`}></span>
                {webhookUrls.length > 0 
                  ? `${webhookUrls.length} webhook${webhookUrls.length > 1 ? 's' : ''} active` 
                  : "Not configured"}
              </p>
            </div>
          </div>
          
          {isDeveloper && (
            <Collapsible 
              open={isConfigOpen} 
              onOpenChange={setIsConfigOpen}
              className="max-w-[400px]"
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2">
                  <Settings className="h-4 w-4" />
                  <span className="ml-2 text-xs">Developer Config</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 p-2 border rounded-lg bg-secondary/30">
                <p className="mb-1 text-xs font-medium">Webhooks: {webhookUrls.length}</p>
                <Input
                  type="text"
                  placeholder="Enter webhook URL (for testing only)"
                  value={webhookUrl}
                  onChange={(e) => onWebhookChange(e.target.value)}
                  className="text-xs chatfuel-input"
                />
                <div className="text-xs text-muted-foreground mt-1 flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  <span>Configure multiple webhooks in Developer Tools</span>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
      
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9FAFC]"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex animate-slide-in ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : `bg-white border border-[#E5E7EB] shadow-sm`
              }`}
            >
              <p className={message.sender === 'agent' ? `text-${agentColor}` : ''}>{message.content}</p>
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
          <div className="flex justify-start animate-fade-in">
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 bg-white border border-[#E5E7EB] shadow-sm`}>
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
      
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            type="text"
            placeholder={`Message ${agentName}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="chatfuel-input focus:border-[#E5E7EB]"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
            className={`bg-${agentColor} hover:bg-${agentColor}/90`}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;


import React, { useState, useEffect, useRef } from "react";
import { Bot, Send } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

const ConnorChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hi, I'm Connor. How can I assist you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize or retrieve session ID
  useEffect(() => {
    // Check if we already have a sessionId in localStorage
    const storedSessionId = localStorage.getItem("connor_session_id");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      // Create new UUID and store it
      const newSessionId = uuidv4();
      localStorage.setItem("connor_session_id", newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Add user message to the chat
    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Construct webhook URL with query parameters
      const webhookUrl = `https://your-webhook-url.com?message=${encodeURIComponent(input)}&sessionId=${sessionId}`;
      
      const response = await fetch(webhookUrl);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.text();
      
      // Add bot response to chat
      const botMessage: Message = {
        id: uuidv4(),
        content: data || "I received your message. How can I help further?",
        isBot: true,
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      
      // Add error message to chat
      const errorMessage: Message = {
        id: uuidv4(),
        content: "Sorry, I couldn't process your request. Please try again.",
        isBot: true,
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-4 border-b flex items-center bg-green-50">
        <div className="h-10 w-10 bg-connor text-white rounded-full flex items-center justify-center mr-3">
          <Bot className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-medium text-lg">Connor Assistant</h2>
          <p className="text-xs text-muted-foreground">AI-powered helper</p>
        </div>
      </div>
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isBot
                    ? "bg-muted text-foreground rounded-tl-none"
                    : "bg-connor text-white rounded-tr-none"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>
      </ScrollArea>
      
      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type your message..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !input.trim()}
            className="bg-connor hover:bg-connor/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {isLoading && (
          <p className="text-xs text-muted-foreground mt-2">
            Connor is thinking...
          </p>
        )}
      </div>
    </div>
  );
};

export default ConnorChat;

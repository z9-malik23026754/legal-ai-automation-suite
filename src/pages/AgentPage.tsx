
import React, { useState, useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

const AgentPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const { user, subscription } = useAuth();
  const [webhookUrl, setWebhookUrl] = useState("");
  
  // Load the first webhook URL from localStorage if available
  useEffect(() => {
    if (!agentId) return;
    
    const loadFirstWebhook = () => {
      const countStr = localStorage.getItem(`webhook_${agentId}_count`);
      const count = countStr ? parseInt(countStr) : 0;
      
      if (count > 0) {
        const firstUrl = localStorage.getItem(`webhook_${agentId}_0_url`);
        if (firstUrl) {
          setWebhookUrl(firstUrl);
        }
      }
    };
    
    loadFirstWebhook();
  }, [agentId]);
  
  // Save webhook URL to state
  const handleWebhookChange = (url: string) => {
    setWebhookUrl(url);
  };

  // If no user, redirect to sign in
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  // Check if the user has access to this agent
  let hasAccess = false;
  let agentName = "";
  let agentColor = "";
  
  switch(agentId) {
    case "markus":
      hasAccess = subscription?.markus || subscription?.allInOne || false;
      agentName = "Markus";
      agentColor = "markus";
      break;
    case "kara":
      hasAccess = subscription?.kara || subscription?.allInOne || false;
      agentName = "Kara";
      agentColor = "kara";
      break;
    case "connor":
      hasAccess = subscription?.connor || subscription?.allInOne || false;
      agentName = "Connor";
      agentColor = "connor";
      break;
    default:
      return <Navigate to="/dashboard" replace />;
  }
  
  // If no access, redirect to pricing
  if (!hasAccess) {
    return <Navigate to="/pricing" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="container mx-auto px-4 h-full pb-4 max-w-5xl">
          <div className="mb-6 flex items-center justify-between">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="pl-0 flex items-center gap-2 hover:bg-transparent hover:text-primary">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
            <h1 className="text-2xl font-bold hidden md:block">
              <span className={`text-${agentColor}`}>{agentName}</span> Agent
            </h1>
          </div>
          
          <div className={`border rounded-xl overflow-hidden shadow-chatfuel transition-all duration-300 chat-container agent-glow-${agentColor} bg-white`}>
            <ChatInterface 
              agentName={agentName}
              agentColor={agentColor}
              webhookUrl={webhookUrl}
              onWebhookChange={handleWebhookChange}
            />
          </div>
          
          <div className="mt-4 text-center text-xs text-muted-foreground">
            Powered by BusinessAI · Webhook requests will be processed by automation tools
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPage;

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, X, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface WebhookConfig {
  id: string;
  agentId: string;
  webhookUrl: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

const WebhookConfigForm = () => {
  const [agentWebhooks, setAgentWebhooks] = useState({
    markus: [{ url: "", description: "" }],
    kara: [{ url: "", description: "" }],
    connor: [{ url: "", description: "" }]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadWebhooks();
    }
  }, [user]);

  const loadWebhooks = async () => {
    try {
      // Load all webhooks from localStorage
      const savedWebhooks: WebhookConfig[] = [];
      const agentIds = ["markus", "kara", "connor"];
      const newAgentWebhooks = {
        markus: [] as { url: string; description: string }[],
        kara: [] as { url: string; description: string }[],
        connor: [] as { url: string; description: string }[]
      };
      
      // Retrieve all webhooks for each agent
      agentIds.forEach(agentId => {
        // Get the count of webhooks for this agent
        const countStr = localStorage.getItem(`webhook_${agentId}_count`);
        const count = countStr ? parseInt(countStr) : 0;
        
        if (count > 0) {
          // For each webhook index, retrieve the data
          for (let i = 0; i < count; i++) {
            const url = localStorage.getItem(`webhook_${agentId}_${i}_url`) || "";
            const description = localStorage.getItem(`webhook_${agentId}_${i}_description`) || "";
            const date = localStorage.getItem(`webhook_${agentId}_${i}_date`) || new Date().toISOString();
            
            if (url) {
              // Add to the active webhooks list
              savedWebhooks.push({
                id: `${agentId}_${i}`,
                agentId,
                webhookUrl: url,
                description,
                isActive: true,
                createdAt: date
              });
              
              // Add to the form state
              newAgentWebhooks[agentId as keyof typeof newAgentWebhooks].push({
                url,
                description
              });
            }
          }
        }
        
        // If no webhooks were loaded for this agent, initialize with an empty one
        if (newAgentWebhooks[agentId as keyof typeof newAgentWebhooks].length === 0) {
          newAgentWebhooks[agentId as keyof typeof newAgentWebhooks].push({ url: "", description: "" });
        }
      });
      
      setAgentWebhooks(newAgentWebhooks);
      setWebhooks(savedWebhooks);
    } catch (error) {
      console.error("Error loading webhooks:", error);
      toast({
        title: "Error",
        description: "Failed to load webhook configurations",
        variant: "destructive",
      });
    }
  };

  const handleAddWebhook = (agentId: string) => {
    setAgentWebhooks(prev => {
      const agent = agentId as keyof typeof prev;
      return {
        ...prev,
        [agent]: [...prev[agent], { url: "", description: "" }]
      };
    });
  };

  const handleRemoveWebhook = (agentId: string, index: number) => {
    setAgentWebhooks(prev => {
      const agent = agentId as keyof typeof prev;
      const newWebhooks = [...prev[agent]];
      newWebhooks.splice(index, 1);
      // Always keep at least one input field
      if (newWebhooks.length === 0) {
        newWebhooks.push({ url: "", description: "" });
      }
      return {
        ...prev,
        [agent]: newWebhooks
      };
    });
  };

  const handleWebhookChange = (agentId: string, index: number, field: 'url' | 'description', value: string) => {
    setAgentWebhooks(prev => {
      const agent = agentId as keyof typeof prev;
      const newWebhooks = [...prev[agent]];
      newWebhooks[index] = {
        ...newWebhooks[index],
        [field]: value
      };
      return {
        ...prev,
        [agent]: newWebhooks
      };
    });
  };

  const handleSaveWebhooks = async () => {
    setIsLoading(true);
    try {
      const savedWebhooks: WebhookConfig[] = [];
      
      // Save webhooks for each agent
      for (const agentId of ["markus", "kara", "connor"]) {
        const agent = agentId as keyof typeof agentWebhooks;
        const webhooksToSave = agentWebhooks[agent].filter(w => w.url.trim() !== "");
        
        // Store the count of webhooks for this agent
        localStorage.setItem(`webhook_${agentId}_count`, webhooksToSave.length.toString());
        
        // Save each webhook with its own key
        webhooksToSave.forEach((webhook, index) => {
          localStorage.setItem(`webhook_${agentId}_${index}_url`, webhook.url);
          localStorage.setItem(`webhook_${agentId}_${index}_description`, webhook.description);
          localStorage.setItem(`webhook_${agentId}_${index}_date`, new Date().toISOString());
          
          // Add to our saved webhooks for display
          savedWebhooks.push({
            id: `${agentId}_${index}`,
            agentId,
            webhookUrl: webhook.url,
            description: webhook.description,
            isActive: true,
            createdAt: new Date().toISOString()
          });
        });
      }
      
      setWebhooks(savedWebhooks);
      
      toast({
        title: "Success",
        description: "Webhook configurations saved successfully",
      });
    } catch (error) {
      console.error("Error saving webhooks:", error);
      toast({
        title: "Error",
        description: "Failed to save webhook configurations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestWebhook = async (agentId: string, webhookUrl: string) => {
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL first",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Testing webhook",
        description: "Sending test payload to webhook...",
      });

      // Send a test payload to the webhook
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // This is needed for cross-origin requests
        body: JSON.stringify({
          agent: agentId,
          message: "This is a test message from MazAI",
          timestamp: new Date().toISOString(),
          isTest: true,
        }),
      });

      // Since we're using no-cors, we won't get a proper response status
      // Show a success message but note that it doesn't guarantee delivery
      toast({
        title: "Test Sent",
        description: "Test payload sent to webhook. Please check your webhook receiver to confirm it was received.",
      });
    } catch (error) {
      console.error(`Error testing webhook for ${agentId}:`, error);
      toast({
        title: "Error",
        description: "Failed to send test payload to webhook",
        variant: "destructive",
      });
    }
  };

  const AgentWebhookForm = ({ agentId, title }: { agentId: string; title: string }) => {
    const agent = agentId as keyof typeof agentWebhooks;
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-lg font-medium">{title} Webhooks</Label>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAddWebhook(agentId)}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Webhook
          </Button>
        </div>
        
        {agentWebhooks[agent].map((webhook, index) => (
          <div key={`${agentId}-${index}`} className="space-y-2 p-3 border rounded-md">
            <div className="flex justify-between">
              <Label htmlFor={`${agentId}-desc-${index}`}>Description (optional)</Label>
              {agentWebhooks[agent].length > 1 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemoveWebhook(agentId, index)} 
                  className="h-6 px-2 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Input
              id={`${agentId}-desc-${index}`}
              placeholder="e.g., Zapier Integration"
              value={webhook.description}
              onChange={(e) => handleWebhookChange(agentId, index, 'description', e.target.value)}
            />
            
            <Label htmlFor={`${agentId}-url-${index}`}>Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id={`${agentId}-url-${index}`}
                placeholder={`https://your-automation-tool.com/webhook/${agentId}`}
                value={webhook.url}
                onChange={(e) => handleWebhookChange(agentId, index, 'url', e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={() => handleTestWebhook(agentId, webhook.url)}
                disabled={!webhook.url}
                title="Test webhook"
                size="icon"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <AgentWebhookForm agentId="markus" title="Markus" />
        <AgentWebhookForm agentId="kara" title="Kara" />
        <AgentWebhookForm agentId="connor" title="Connor" />

        <Button 
          onClick={handleSaveWebhooks} 
          disabled={isLoading}
          className="w-full mt-4"
        >
          {isLoading ? "Saving..." : "Save Webhook Configurations"}
        </Button>
      </div>

      <Separator className="my-6" />

      <div>
        <h3 className="font-medium text-lg mb-4">Active Webhooks</h3>
        {webhooks.length > 0 ? (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold capitalize">{webhook.agentId}</h4>
                      {webhook.description && (
                        <p className="text-sm font-medium">{webhook.description}</p>
                      )}
                      <p className="text-sm text-muted-foreground break-all">{webhook.webhookUrl}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last updated: {new Date(webhook.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTestWebhook(webhook.agentId, webhook.webhookUrl)}
                      >
                        Test
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No webhooks configured yet</p>
        )}
      </div>
    </div>
  );
};

export default WebhookConfigForm;

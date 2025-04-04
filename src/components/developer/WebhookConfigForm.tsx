
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface WebhookConfig {
  id: string;
  agentId: string;
  webhookUrl: string;
  isActive: boolean;
  createdAt: string;
}

const WebhookConfigForm = () => {
  const [markusWebhook, setMarkusWebhook] = useState("");
  const [karaWebhook, setKaraWebhook] = useState("");
  const [connorWebhook, setConnorWebhook] = useState("");
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
      // Here you would typically fetch from a database
      // For now, we'll use local storage as a simple solution
      const markusUrl = localStorage.getItem("webhook_markus") || "";
      const karaUrl = localStorage.getItem("webhook_kara") || "";
      const connorUrl = localStorage.getItem("webhook_connor") || "";
      
      setMarkusWebhook(markusUrl);
      setKaraWebhook(karaUrl);
      setConnorWebhook(connorUrl);
      
      // Build a simple array of webhook objects
      const webhookList = [
        markusUrl && { 
          id: "1", 
          agentId: "markus", 
          webhookUrl: markusUrl, 
          isActive: true,
          createdAt: localStorage.getItem("webhook_markus_date") || new Date().toISOString()
        },
        karaUrl && { 
          id: "2", 
          agentId: "kara", 
          webhookUrl: karaUrl, 
          isActive: true,
          createdAt: localStorage.getItem("webhook_kara_date") || new Date().toISOString()
        },
        connorUrl && { 
          id: "3", 
          agentId: "connor", 
          webhookUrl: connorUrl, 
          isActive: true,
          createdAt: localStorage.getItem("webhook_connor_date") || new Date().toISOString()
        }
      ].filter(Boolean) as WebhookConfig[];
      
      setWebhooks(webhookList);
    } catch (error) {
      console.error("Error loading webhooks:", error);
      toast({
        title: "Error",
        description: "Failed to load webhook configurations",
        variant: "destructive",
      });
    }
  };

  const handleSaveWebhooks = async () => {
    setIsLoading(true);
    try {
      // In a real application, you would save this to a database
      localStorage.setItem("webhook_markus", markusWebhook);
      localStorage.setItem("webhook_kara", karaWebhook);
      localStorage.setItem("webhook_connor", connorWebhook);
      
      // Save dates for display in the UI
      if (markusWebhook) {
        localStorage.setItem("webhook_markus_date", new Date().toISOString());
      }
      if (karaWebhook) {
        localStorage.setItem("webhook_kara_date", new Date().toISOString());
      }
      if (connorWebhook) {
        localStorage.setItem("webhook_connor_date", new Date().toISOString());
      }
      
      await loadWebhooks();
      
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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="markus-webhook">Markus Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="markus-webhook"
                placeholder="https://your-automation-tool.com/webhook/markus"
                value={markusWebhook}
                onChange={(e) => setMarkusWebhook(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={() => handleTestWebhook("markus", markusWebhook)}
                disabled={!markusWebhook}
              >
                Test
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kara-webhook">Kara Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="kara-webhook"
                placeholder="https://your-automation-tool.com/webhook/kara"
                value={karaWebhook}
                onChange={(e) => setKaraWebhook(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={() => handleTestWebhook("kara", karaWebhook)}
                disabled={!karaWebhook}
              >
                Test
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="connor-webhook">Connor Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="connor-webhook"
                placeholder="https://your-automation-tool.com/webhook/connor"
                value={connorWebhook}
                onChange={(e) => setConnorWebhook(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={() => handleTestWebhook("connor", connorWebhook)}
                disabled={!connorWebhook}
              >
                Test
              </Button>
            </div>
          </div>
        </div>

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

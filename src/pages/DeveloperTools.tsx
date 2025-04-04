
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDeveloper } from "@/contexts/DeveloperContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import WebhookConfigForm from "@/components/developer/WebhookConfigForm";
import SystemConfigPanel from "@/components/developer/SystemConfigPanel";
import { Loader2 } from "lucide-react";

const DeveloperTools = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { isDeveloper, isLoading: developerLoading } = useDeveloper();
  const navigate = useNavigate();

  // Redirect if user is not logged in or not a developer
  useEffect(() => {
    if (!authLoading && !developerLoading) {
      if (!user) {
        navigate("/signin");
      } else if (!isDeveloper) {
        navigate("/dashboard");
      }
    }
  }, [user, isDeveloper, authLoading, developerLoading, navigate]);

  if (authLoading || developerLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user || !isDeveloper) {
    return null; // This will be handled by the redirect in the useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-6">Developer Tools</h1>
        <p className="text-muted-foreground mb-8">
          These tools are only available to system administrators and developers.
        </p>

        <Tabs defaultValue="webhooks" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="system">System Configuration</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="webhooks">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Configuration</CardTitle>
                <CardDescription>
                  Configure webhook endpoints for agent automation integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WebhookConfigForm />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Manage global system settings and configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SystemConfigPanel />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>
                  View system logs and debug information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Log viewer coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeveloperTools;

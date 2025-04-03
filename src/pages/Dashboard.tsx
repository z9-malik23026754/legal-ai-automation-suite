
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Mail, ArrowRight, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user, subscription } = useAuth();

  // If no user, redirect to sign in (should be handled by a route guard in a real app)
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="mb-4">Please sign in to access your dashboard</p>
        <Link to="/signin">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  // Check which agents the user has access to
  const hasMarkusAccess = subscription?.markus || subscription?.allInOne;
  const hasKaraAccess = subscription?.kara || subscription?.allInOne;
  const hasConnorAccess = subscription?.connor || subscription?.allInOne;
  
  // Check if user has any subscriptions at all
  const hasAnySubscription = hasMarkusAccess || hasKaraAccess || hasConnorAccess;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Your Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.email}
            </p>
          </div>

          {!hasAnySubscription && (
            <div className="bg-muted p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold mb-2">Get Started with Legal AI</h2>
              <p className="mb-4">
                You don't have any active subscriptions yet. Subscribe to one of our AI agents to get started.
              </p>
              <Link to="/pricing">
                <Button>View Pricing Plans</Button>
              </Link>
            </div>
          )}

          <h2 className="text-2xl font-semibold mb-6">Your AI Agents</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Markus Card */}
            <Card className={`relative ${!hasMarkusAccess ? "opacity-75" : ""}`}>
              {!hasMarkusAccess && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                  <div className="text-center p-6">
                    <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Subscribe to access Markus</p>
                    <Link to="/pricing">
                      <Button size="sm">Subscribe</Button>
                    </Link>
                  </div>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="agent-label-markus p-2 rounded-md">
                    <MessageSquare className="h-5 w-5 text-markus" />
                  </div>
                  <CardTitle>Markus</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-muted-foreground">
                  Personalized chatbot for client intake and FAQs
                </p>
              </CardContent>
              <CardFooter>
                {hasMarkusAccess ? (
                  <Link to="/agents/markus" className="w-full">
                    <Button className="w-full" variant="outline">
                      Chat with Markus <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/pricing" className="w-full">
                    <Button className="w-full" variant="outline">
                      Subscribe
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
            
            {/* Kara Card */}
            <Card className={`relative ${!hasKaraAccess ? "opacity-75" : ""}`}>
              {!hasKaraAccess && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                  <div className="text-center p-6">
                    <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Subscribe to access Kara</p>
                    <Link to="/pricing">
                      <Button size="sm">Subscribe</Button>
                    </Link>
                  </div>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="agent-label-kara p-2 rounded-md">
                    <Phone className="h-5 w-5 text-kara" />
                  </div>
                  <CardTitle>Kara</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-muted-foreground">
                  Voice & SMS automation for client communications
                </p>
              </CardContent>
              <CardFooter>
                {hasKaraAccess ? (
                  <Link to="/agents/kara" className="w-full">
                    <Button className="w-full" variant="outline">
                      Use Kara <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/pricing" className="w-full">
                    <Button className="w-full" variant="outline">
                      Subscribe
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
            
            {/* Connor Card */}
            <Card className={`relative ${!hasConnorAccess ? "opacity-75" : ""}`}>
              {!hasConnorAccess && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                  <div className="text-center p-6">
                    <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Subscribe to access Connor</p>
                    <Link to="/pricing">
                      <Button size="sm">Subscribe</Button>
                    </Link>
                  </div>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="agent-label-connor p-2 rounded-md">
                    <Mail className="h-5 w-5 text-connor" />
                  </div>
                  <CardTitle>Connor</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-muted-foreground">
                  Email marketing and content automation
                </p>
              </CardContent>
              <CardFooter>
                {hasConnorAccess ? (
                  <Link to="/agents/connor" className="w-full">
                    <Button className="w-full" variant="outline">
                      Use Connor <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/pricing" className="w-full">
                    <Button className="w-full" variant="outline">
                      Subscribe
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          </div>

          {hasAnySubscription && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-6">Quick Access</h2>
              <div className="bg-card border rounded-lg">
                <div className="divide-y">
                  {hasMarkusAccess && (
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Chatbot Setup</h3>
                        <p className="text-sm text-muted-foreground">Configure your client intake chatbot</p>
                      </div>
                      <Link to="/settings/markus">
                        <Button variant="ghost">Configure</Button>
                      </Link>
                    </div>
                  )}
                  
                  {hasKaraAccess && (
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Voice Agent Settings</h3>
                        <p className="text-sm text-muted-foreground">Manage phone numbers and SMS templates</p>
                      </div>
                      <Link to="/settings/kara">
                        <Button variant="ghost">Configure</Button>
                      </Link>
                    </div>
                  )}
                  
                  {hasConnorAccess && (
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Email Campaigns</h3>
                        <p className="text-sm text-muted-foreground">Create and schedule marketing emails</p>
                      </div>
                      <Link to="/settings/connor">
                        <Button variant="ghost">Configure</Button>
                      </Link>
                    </div>
                  )}
                  
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Billing & Subscription</h3>
                      <p className="text-sm text-muted-foreground">Manage your subscription plan</p>
                    </div>
                    <Link to="/settings/billing">
                      <Button variant="ghost">Manage</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

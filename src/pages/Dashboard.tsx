
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Mail, ArrowRight, Lock, Bell, ChevronRight, PieChart, Calendar, Settings, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

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

  // Recent notifications - for demo purposes
  const recentNotifications = [
    { title: "New client inquiry", time: "2 hours ago", agent: "Markus" },
    { title: "Call scheduled", time: "Yesterday", agent: "Kara" },
    { title: "Email campaign completed", time: "2 days ago", agent: "Connor" }
  ];

  // Quick stats - for demo purposes
  const quickStats = [
    { title: "Client Inquiries", value: 24, change: "+12%" },
    { title: "Scheduled Calls", value: 8, change: "-3%" },
    { title: "Email Opens", value: "68%", change: "+5%" },
    { title: "Active Cases", value: 16, change: "0%" }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center">
              <div className="rounded-md bg-primary/10 p-1 mr-2">
                <PieChart className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-lg">MazAI</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Overview</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Dashboard">
                    <Link to="/dashboard">
                      <PieChart className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Calendar">
                    <Link to="/calendar">
                      <Calendar className="h-4 w-4" />
                      <span>Calendar</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Notifications">
                    <Link to="/notifications">
                      <Bell className="h-4 w-4" />
                      <span>Notifications</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupLabel>AI Agents</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Markus" disabled={!hasMarkusAccess}>
                    <Link to="/agents/markus">
                      <MessageSquare className="h-4 w-4" />
                      <span>Markus {!hasMarkusAccess && "(Locked)"}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Kara" disabled={!hasKaraAccess}>
                    <Link to="/agents/kara">
                      <Phone className="h-4 w-4" />
                      <span>Kara {!hasKaraAccess && "(Locked)"}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Connor" disabled={!hasConnorAccess}>
                    <Link to="/agents/connor">
                      <Mail className="h-4 w-4" />
                      <span>Connor {!hasConnorAccess && "(Locked)"}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupLabel>Settings</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Settings">
                    <Link to="/settings">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Billing">
                    <Link to="/settings/billing">
                      <FileText className="h-4 w-4" />
                      <span>Billing & Plans</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="text-xs text-muted-foreground">
              Logged in as {user.email}
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset>
          <Navbar />
          <div className="container px-4 py-6 mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {user.email.split('@')[0]}
                </p>
              </div>
              
              {!hasAnySubscription && (
                <Button asChild className="mt-4 md:mt-0">
                  <Link to="/pricing">Upgrade Your Plan</Link>
                </Button>
              )}
            </div>

            {!hasAnySubscription ? (
              <div className="bg-gradient-to-r from-primary/5 to-blue-500/5 p-8 rounded-lg border mb-8 shadow-sm">
                <h2 className="text-xl font-semibold mb-2">Get Started with MazAI</h2>
                <p className="mb-4">
                  You don't have any active subscriptions yet. Subscribe to one of our AI agents to get started.
                </p>
                <Link to="/pricing">
                  <Button>View Pricing Plans</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {quickStats.map((stat, index) => (
                  <Card key={index} className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-500' : stat.change === '0%' ? 'text-muted-foreground' : 'text-red-500'}`}>
                        {stat.change} from last month
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-semibold mb-6">Your AI Agents</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Markus Card */}
                  <Card className={`relative transition-all duration-200 hover:shadow-md ${!hasMarkusAccess ? "opacity-75" : ""}`}>
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
                  <Card className={`relative transition-all duration-200 hover:shadow-md ${!hasKaraAccess ? "opacity-75" : ""}`}>
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
                  <Card className={`relative transition-all duration-200 hover:shadow-md ${!hasConnorAccess ? "opacity-75" : ""}`}>
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
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {recentNotifications.map((notification, idx) => (
                        <div key={idx} className="flex items-center justify-between py-3 px-6">
                          <div>
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-xs text-muted-foreground">Via {notification.agent} • {notification.time}</p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="justify-center pt-2 pb-4">
                    <Button variant="ghost" size="sm">View All Notifications</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            {hasAnySubscription && (
              <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-6">Quick Access</h2>
                <div className="bg-card border rounded-lg shadow-sm">
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;


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
        <Sidebar className="bg-sidebar border-r border-sidebar-border">
          <SidebarHeader className="p-4">
            <div className="flex items-center">
              <div className="rounded-md bg-gradient-to-br from-blue-500 to-purple-500 p-1.5 mr-2">
                <PieChart className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">MazAI</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">Overview</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Dashboard" className="transition-all duration-200 hover:bg-sidebar-accent">
                    <Link to="/dashboard" className="bg-sidebar-accent text-sidebar-accent-foreground">
                      <div className="glass-card inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                        <PieChart className="h-3 w-3" />
                      </div>
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Calendar">
                    <Link to="/calendar">
                      <div className="bg-sidebar-accent/30 inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                        <Calendar className="h-3 w-3" />
                      </div>
                      <span>Calendar</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Notifications">
                    <Link to="/notifications">
                      <div className="bg-sidebar-accent/30 inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                        <Bell className="h-3 w-3" />
                      </div>
                      <span>Notifications</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">AI Agents</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Markus" disabled={!hasMarkusAccess}>
                    <Link to="/agents/markus">
                      <div className="agent-label-markus inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                        <MessageSquare className="h-3 w-3 text-markus" />
                      </div>
                      <span>{!hasMarkusAccess && "🔒 "}Markus</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Kara" disabled={!hasKaraAccess}>
                    <Link to="/agents/kara">
                      <div className="agent-label-kara inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                        <Phone className="h-3 w-3 text-kara" />
                      </div>
                      <span>{!hasKaraAccess && "🔒 "}Kara</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Connor" disabled={!hasConnorAccess}>
                    <Link to="/agents/connor">
                      <div className="agent-label-connor inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                        <Mail className="h-3 w-3 text-connor" />
                      </div>
                      <span>{!hasConnorAccess && "🔒 "}Connor</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">Settings</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Settings">
                    <Link to="/settings">
                      <div className="bg-sidebar-accent/30 inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                        <Settings className="h-3 w-3" />
                      </div>
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Billing">
                    <Link to="/settings/billing">
                      <div className="bg-sidebar-accent/30 inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                        <FileText className="h-3 w-3" />
                      </div>
                      <span>Billing & Plans</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-sidebar-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {user.email ? user.email.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="text-xs">
                <p className="font-medium truncate">{user.email}</p>
                <p className="text-muted-foreground truncate">Free Plan</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="bg-background/95 backdrop-blur-sm flex-1">
          <Navbar />
          <div className="container px-4 py-6 mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {user.email.split('@')[0]}
                </p>
              </div>
              
              {!hasAnySubscription && (
                <Button asChild className="mt-4 md:mt-0 bg-gradient-primary hover:opacity-90 transition-opacity">
                  <Link to="/pricing">Upgrade Your Plan</Link>
                </Button>
              )}
            </div>

            {!hasAnySubscription ? (
              <div className="glass-card shadow-glass p-8 rounded-lg mb-8">
                <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Get Started with MazAI</h2>
                <p className="mb-4 text-muted-foreground">
                  You don't have any active subscriptions yet. Subscribe to one of our AI agents to get started.
                </p>
                <Link to="/pricing">
                  <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">View Pricing Plans</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {quickStats.map((stat, index) => (
                  <Card key={index} className="glass-card border-white/10 overflow-hidden shadow-glass">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg"></div>
                    <CardHeader className="pb-2 relative z-10">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
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
                <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Your AI Agents</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Markus Card */}
                  <Card className={`glass-card border-white/10 shadow-glass relative transition-all duration-200 hover:shadow-lg ${!hasMarkusAccess ? "opacity-75" : "hover:-translate-y-1"}`}>
                    {!hasMarkusAccess && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                        <div className="text-center p-6">
                          <div className="w-12 h-12 rounded-full bg-gray-200/20 flex items-center justify-center mx-auto mb-3">
                            <Lock className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground mb-4">Subscribe to access Markus</p>
                          <Link to="/pricing">
                            <Button size="sm" className="bg-gradient-primary hover:opacity-90 transition-opacity">Subscribe</Button>
                          </Link>
                        </div>
                      </div>
                    )}
                    <CardHeader className="pb-3 relative">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-blue-700/5 rounded-full -mr-8 -mt-8 blur-2xl"></div>
                      <div className="flex items-center space-x-3">
                        <div className="agent-label-markus p-2 rounded-md">
                          <MessageSquare className="h-5 w-5 text-markus" />
                        </div>
                        <CardTitle className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">Markus</CardTitle>
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
                          <Button className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border border-blue-500/20">
                            Chat with Markus <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      ) : (
                        <Link to="/pricing" className="w-full">
                          <Button className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border border-blue-500/20">
                            Subscribe
                          </Button>
                        </Link>
                      )}
                    </CardFooter>
                  </Card>
                  
                  {/* Kara Card */}
                  <Card className={`glass-card border-white/10 shadow-glass relative transition-all duration-200 hover:shadow-lg ${!hasKaraAccess ? "opacity-75" : "hover:-translate-y-1"}`}>
                    {!hasKaraAccess && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                        <div className="text-center p-6">
                          <div className="w-12 h-12 rounded-full bg-gray-200/20 flex items-center justify-center mx-auto mb-3">
                            <Lock className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground mb-4">Subscribe to access Kara</p>
                          <Link to="/pricing">
                            <Button size="sm" className="bg-gradient-primary hover:opacity-90 transition-opacity">Subscribe</Button>
                          </Link>
                        </div>
                      </div>
                    )}
                    <CardHeader className="pb-3 relative">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-purple-700/5 rounded-full -mr-8 -mt-8 blur-2xl"></div>
                      <div className="flex items-center space-x-3">
                        <div className="agent-label-kara p-2 rounded-md">
                          <Phone className="h-5 w-5 text-kara" />
                        </div>
                        <CardTitle className="bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent">Kara</CardTitle>
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
                          <Button className="w-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 border border-purple-500/20">
                            Use Kara <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      ) : (
                        <Link to="/pricing" className="w-full">
                          <Button className="w-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 border border-purple-500/20">
                            Subscribe
                          </Button>
                        </Link>
                      )}
                    </CardFooter>
                  </Card>
                  
                  {/* Connor Card */}
                  <Card className={`glass-card border-white/10 shadow-glass relative transition-all duration-200 hover:shadow-lg ${!hasConnorAccess ? "opacity-75" : "hover:-translate-y-1"}`}>
                    {!hasConnorAccess && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                        <div className="text-center p-6">
                          <div className="w-12 h-12 rounded-full bg-gray-200/20 flex items-center justify-center mx-auto mb-3">
                            <Lock className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground mb-4">Subscribe to access Connor</p>
                          <Link to="/pricing">
                            <Button size="sm" className="bg-gradient-primary hover:opacity-90 transition-opacity">Subscribe</Button>
                          </Link>
                        </div>
                      </div>
                    )}
                    <CardHeader className="pb-3 relative">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-green-700/5 rounded-full -mr-8 -mt-8 blur-2xl"></div>
                      <div className="flex items-center space-x-3">
                        <div className="agent-label-connor p-2 rounded-md">
                          <Mail className="h-5 w-5 text-connor" />
                        </div>
                        <CardTitle className="bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">Connor</CardTitle>
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
                          <Button className="w-full bg-green-500/10 hover:bg-green-500/20 text-green-600 border border-green-500/20">
                            Use Connor <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      ) : (
                        <Link to="/pricing" className="w-full">
                          <Button className="w-full bg-green-500/10 hover:bg-green-500/20 text-green-600 border border-green-500/20">
                            Subscribe
                          </Button>
                        </Link>
                      )}
                    </CardFooter>
                  </Card>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Recent Activity</h2>
                <Card className="glass-card border-white/10 shadow-glass overflow-hidden">
                  <CardHeader className="relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -mr-10 -mt-10 blur-3xl"></div>
                    <CardTitle className="text-lg relative z-10">Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 relative z-10">
                    <div className="divide-y divide-border/30">
                      {recentNotifications.map((notification, idx) => (
                        <div key={idx} className="flex items-center justify-between py-3 px-6 hover:bg-white/5 transition-colors">
                          <div>
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Via <span className={`text-${notification.agent.toLowerCase()}`}>{notification.agent}</span> • {notification.time}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="justify-center pt-2 pb-4 relative z-10">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      View All Notifications
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            {hasAnySubscription && (
              <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Quick Access</h2>
                <div className="glass-card border-white/10 rounded-lg shadow-glass overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg"></div>
                  <div className="divide-y divide-white/10 relative z-10">
                    {hasMarkusAccess && (
                      <div className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                        <div>
                          <h3 className="font-medium bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">Chatbot Setup</h3>
                          <p className="text-sm text-muted-foreground">Configure your client intake chatbot</p>
                        </div>
                        <Link to="/settings/markus">
                          <Button variant="ghost" className="hover:bg-blue-500/10 hover:text-blue-600">Configure</Button>
                        </Link>
                      </div>
                    )}
                    
                    {hasKaraAccess && (
                      <div className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                        <div>
                          <h3 className="font-medium bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent">Voice Agent Settings</h3>
                          <p className="text-sm text-muted-foreground">Manage phone numbers and SMS templates</p>
                        </div>
                        <Link to="/settings/kara">
                          <Button variant="ghost" className="hover:bg-purple-500/10 hover:text-purple-600">Configure</Button>
                        </Link>
                      </div>
                    )}
                    
                    {hasConnorAccess && (
                      <div className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                        <div>
                          <h3 className="font-medium bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">Email Campaigns</h3>
                          <p className="text-sm text-muted-foreground">Create and schedule marketing emails</p>
                        </div>
                        <Link to="/settings/connor">
                          <Button variant="ghost" className="hover:bg-green-500/10 hover:text-green-600">Configure</Button>
                        </Link>
                      </div>
                    )}
                    
                    <div className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
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

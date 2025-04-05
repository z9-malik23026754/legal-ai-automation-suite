
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { PieChart, MessageSquare, Phone, Mail, ClipboardList, BarChart3, Loader } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/dashboard/StatsCard";
import AgentCard from "@/components/dashboard/AgentCard";
import NotificationCard from "@/components/dashboard/NotificationCard";
import QuickAccessCard from "@/components/dashboard/QuickAccessCard";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SidebarLinks from "@/components/dashboard/SidebarLinks";

const Dashboard = () => {
  const { user, subscription, checkSubscription } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(true);

  // Force a check of subscription status when the dashboard loads
  useEffect(() => {
    const refreshSubscription = async () => {
      if (checkSubscription) {
        try {
          setIsRefreshing(true);
          // Try multiple times to refresh subscription status to ensure we have the latest data
          for (let i = 0; i < 3; i++) {
            await checkSubscription();
            
            // If we confirmed a subscription/trial, we can stop trying
            if (subscription && (
              subscription.status === 'trial' || 
              subscription.status === 'active' ||
              subscription.markus || 
              subscription.kara || 
              subscription.connor || 
              subscription.chloe || 
              subscription.luther || 
              subscription.allInOne
            )) {
              break;
            }
            
            // Wait a short time before trying again
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error("Error refreshing subscription status:", error);
        } finally {
          setIsRefreshing(false);
        }
      } else {
        setIsRefreshing(false);
      }
    };
    
    refreshSubscription();
  }, [checkSubscription, subscription]);

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

  // Check if user is in trial mode
  const isInTrialMode = subscription?.status === 'trial';
  
  // Check which agents the user has access to
  const hasMarkusAccess = isInTrialMode || subscription?.markus || subscription?.allInOne;
  const hasKaraAccess = isInTrialMode || subscription?.kara || subscription?.allInOne;
  const hasConnorAccess = isInTrialMode || subscription?.connor || subscription?.allInOne;
  const hasChloeAccess = isInTrialMode || subscription?.chloe || subscription?.allInOne;
  const hasLutherAccess = isInTrialMode || subscription?.luther || subscription?.allInOne;
  
  // Check if user has any subscriptions at all
  const hasAnySubscription = hasMarkusAccess || hasKaraAccess || hasConnorAccess || hasChloeAccess || hasLutherAccess;

  // Recent notifications - for demo purposes
  const recentNotifications = [
    { title: "New client inquiry", time: "2 hours ago", agent: "Markus" },
    { title: "Support ticket opened", time: "Yesterday", agent: "Kara" },
    { title: "Email campaign completed", time: "2 days ago", agent: "Connor" },
    { title: "Admin report ready", time: "3 days ago", agent: "Chloe" },
    { title: "New lead qualified", time: "1 hour ago", agent: "Luther" }
  ];

  // Quick stats - for demo purposes
  const quickStats = [
    { title: "Client Inquiries", value: 24, change: "+12%" },
    { title: "Support Tickets", value: 8, change: "-3%" },
    { title: "Email Opens", value: "68%", change: "+5%" },
    { title: "Active Cases", value: 16, change: "0%" }
  ];

  // Display loading state while refreshing subscription
  if (isRefreshing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

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
            <SidebarLinks 
              hasMarkusAccess={hasMarkusAccess}
              hasKaraAccess={hasKaraAccess}
              hasConnorAccess={hasConnorAccess}
              hasChloeAccess={hasChloeAccess}
              hasLutherAccess={hasLutherAccess}
            />
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-sidebar-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {user.email ? user.email.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="text-xs">
                <p className="font-medium truncate">{user.email}</p>
                <p className="text-muted-foreground truncate">
                  {isInTrialMode ? 'Trial Plan' : (subscription ? 'Paid Plan' : 'Free Plan')}
                </p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="bg-background/95 backdrop-blur-sm flex-1">
          <Navbar />
          <div className="container px-4 py-6 mx-auto max-w-7xl">
            <DashboardHeader 
              userName={user.email?.split('@')[0] || 'User'} 
              hasAnySubscription={hasAnySubscription} 
            />

            {!hasAnySubscription ? (
              <WelcomeCard />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {quickStats.map((stat, index) => (
                  <StatsCard 
                    key={index} 
                    title={stat.title} 
                    value={stat.value} 
                    change={stat.change} 
                  />
                ))}
              </div>
            )}
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Your AI Agents</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <AgentCard 
                    agentId="markus"
                    title="Markus"
                    description="Personalized chatbot for client intake and FAQs"
                    icon="MessageSquare"
                    hasAccess={hasMarkusAccess}
                  />
                  
                  <AgentCard 
                    agentId="kara"
                    title="Kara"
                    description="Customer support agent for tickets and inquiries"
                    icon="Phone"
                    hasAccess={hasKaraAccess}
                  />
                  
                  <AgentCard 
                    agentId="connor"
                    title="Connor"
                    description="Email marketing and content automation"
                    icon="Mail"
                    hasAccess={hasConnorAccess}
                  />
                  
                  <AgentCard 
                    agentId="chloe"
                    title="Chloe"
                    description="Administrative tasks and reporting dashboard"
                    icon="ClipboardList"
                    hasAccess={hasChloeAccess}
                  />
                  
                  <AgentCard 
                    agentId="luther"
                    title="Luther"
                    description="Sales automation and CRM tools for your business"
                    icon="BarChart3"
                    hasAccess={hasLutherAccess}
                  />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Recent Activity</h2>
                <NotificationCard notifications={recentNotifications} />
              </div>
            </div>

            {hasAnySubscription && (
              <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Quick Access</h2>
                <QuickAccessCard 
                  hasMarkusAccess={hasMarkusAccess}
                  hasKaraAccess={hasKaraAccess}
                  hasConnorAccess={hasConnorAccess}
                  hasChloeAccess={hasChloeAccess}
                  hasLutherAccess={hasLutherAccess}
                />
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;

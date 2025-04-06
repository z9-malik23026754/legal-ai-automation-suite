
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarInset } from "@/components/ui/sidebar";
import { PieChart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import DashboardView from "@/components/dashboard/DashboardView";
import DashboardLoader from "@/components/dashboard/DashboardLoader";
import UnsubscribedView from "@/components/dashboard/UnsubscribedView";
import SidebarLinks from "@/components/dashboard/SidebarLinks";

const Dashboard = () => {
  const { user, subscription, checkSubscription } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const { toast } = useToast();

  // Force a check of subscription status when the dashboard loads
  useEffect(() => {
    const refreshSubscription = async () => {
      if (checkSubscription) {
        try {
          setIsRefreshing(true);
          console.log("Starting subscription refresh on dashboard load");
          
          // Try multiple times to refresh subscription status to ensure we have the latest data
          for (let i = 0; i < 3; i++) {
            console.log(`Subscription refresh attempt ${i + 1}`);
            await checkSubscription();
            
            // If we confirmed a subscription/trial, log it and stop trying
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
              console.log("Subscription status confirmed:", subscription);
              break;
            }
            
            // Wait a short time before trying again
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          // After refreshing, check if we have access to any agents
          const hasAnyAccess = subscription && (
            subscription.status === 'trial' || 
            subscription.status === 'active' ||
            subscription.markus || 
            subscription.kara || 
            subscription.connor || 
            subscription.chloe || 
            subscription.luther || 
            subscription.allInOne
          );
          
          // If we have a trial or subscription but agent access isn't working, show a toast
          if (subscription?.status === 'trial' || subscription?.status === 'active') {
            if (!hasAnyAccess) {
              // This should not happen - refresh the page if it does
              toast({
                title: "Agent access issue detected",
                description: "We're refreshing the page to fix this issue.",
                variant: "destructive",
              });
              
              // Force a page refresh as a last resort
              setTimeout(() => {
                window.location.reload();
              }, 3000);
            } else {
              // For trials, show a confirmation toast
              if (subscription.status === 'trial') {
                toast({
                  title: "Free Trial Active",
                  description: "All AI agents are unlocked for your 7-day free trial period.",
                });
              }
            }
          }
        } catch (error) {
          console.error("Error refreshing subscription status:", error);
          toast({
            title: "Couldn't verify subscription",
            description: "There was an issue loading your subscription details. Please try refreshing the page.",
            variant: "destructive",
          });
        } finally {
          setIsRefreshing(false);
        }
      } else {
        setIsRefreshing(false);
      }
    };
    
    refreshSubscription();
  }, [checkSubscription, subscription, toast]);

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

  // CRITICAL: Check if user is in trial mode or has active subscription - THIS MUST BE CORRECT
  const isInTrialMode = subscription?.status === 'trial';
  const hasActiveSubscription = subscription?.status === 'active';
  
  console.log("Dashboard - User subscription status:", {
    isInTrialMode,
    hasActiveSubscription,
    subscriptionStatus: subscription?.status,
    hasMarkus: subscription?.markus,
    hasKara: subscription?.kara
  });
  
  // CRITICAL: If user has trial or active subscription, they have access to ALL agents
  const hasMarkusAccess = isInTrialMode || hasActiveSubscription || subscription?.markus || subscription?.allInOne;
  const hasKaraAccess = isInTrialMode || hasActiveSubscription || subscription?.kara || subscription?.allInOne;
  const hasConnorAccess = isInTrialMode || hasActiveSubscription || subscription?.connor || subscription?.allInOne;
  const hasChloeAccess = isInTrialMode || hasActiveSubscription || subscription?.chloe || subscription?.allInOne;
  const hasLutherAccess = isInTrialMode || hasActiveSubscription || subscription?.luther || subscription?.allInOne;
  
  // Check if user has any subscriptions at all
  const hasAnySubscription = hasMarkusAccess || hasKaraAccess || hasConnorAccess || hasChloeAccess || hasLutherAccess;

  // Display loading state while refreshing subscription
  if (isRefreshing) {
    return <DashboardLoader />;
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
                  {isInTrialMode ? 'Trial Plan' : (hasActiveSubscription ? 'Paid Plan' : 'Free Plan')}
                </p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="bg-background/95 backdrop-blur-sm flex-1">
          <Navbar />
          {hasAnySubscription ? (
            <DashboardView 
              userName={user.email?.split('@')[0] || 'User'}
              subscription={subscription}
              isInTrialMode={isInTrialMode}
              hasActiveSubscription={hasActiveSubscription}
              hasMarkusAccess={hasMarkusAccess}
              hasKaraAccess={hasKaraAccess}
              hasConnorAccess={hasConnorAccess}
              hasChloeAccess={hasChloeAccess}
              hasLutherAccess={hasLutherAccess}
              hasAnySubscription={hasAnySubscription}
              isRefreshing={isRefreshing}
            />
          ) : (
            <UnsubscribedView 
              userName={user.email?.split('@')[0] || 'User'} 
            />
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;

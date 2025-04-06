
import React from "react";
import { Link } from "react-router-dom";
import StatsCard from "@/components/dashboard/StatsCard";
import AgentCard from "@/components/dashboard/AgentCard";
import NotificationCard from "@/components/dashboard/NotificationCard";
import QuickAccessCard from "@/components/dashboard/QuickAccessCard";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SubscriptionWithTrial } from "@/hooks/useSubscription";

// Sample data
const recentNotifications = [
  { title: "New client inquiry", time: "2 hours ago", agent: "Markus" },
  { title: "Support ticket opened", time: "Yesterday", agent: "Kara" },
  { title: "Email campaign completed", time: "2 days ago", agent: "Connor" },
  { title: "Admin report ready", time: "3 days ago", agent: "Chloe" },
  { title: "New lead qualified", time: "1 hour ago", agent: "Luther" }
];

const quickStats = [
  { title: "Client Inquiries", value: 24, change: "+12%" },
  { title: "Support Tickets", value: 8, change: "-3%" },
  { title: "Email Opens", value: "68%", change: "+5%" },
  { title: "Active Cases", value: 16, change: "0%" }
];

interface DashboardViewProps {
  userName: string;
  subscription: SubscriptionWithTrial | null;
  isInTrialMode: boolean;
  hasActiveSubscription: boolean;
  hasMarkusAccess: boolean;
  hasKaraAccess: boolean;
  hasConnorAccess: boolean;
  hasChloeAccess: boolean;
  hasLutherAccess: boolean;
  hasAnySubscription: boolean;
  isRefreshing: boolean;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  userName,
  subscription,
  isInTrialMode,
  hasActiveSubscription,
  hasMarkusAccess,
  hasKaraAccess,
  hasConnorAccess,
  hasChloeAccess,
  hasLutherAccess,
  hasAnySubscription,
  isRefreshing
}) => {
  // Debug logs to verify subscription status is correctly passed
  console.log("DashboardView - User subscription status:", {
    isInTrialMode,
    hasActiveSubscription,
    hasMarkusAccess,
    hasKaraAccess,
    hasConnorAccess,
    hasChloeAccess,
    hasLutherAccess,
    hasAnySubscription
  });

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <DashboardHeader 
        userName={userName} 
        hasAnySubscription={hasAnySubscription} 
      />

      {/* Show trial notification if in trial mode */}
      {isInTrialMode && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <h3 className="font-medium text-green-600 mb-1">Free Trial Active</h3>
          <p className="text-sm text-muted-foreground">
            You have full access to all AI agents during your 7-day free trial period. 
            Trial ends on {new Date(subscription?.trialEnd || "").toLocaleDateString()}.
          </p>
        </div>
      )}

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
  );
};

export default DashboardView;

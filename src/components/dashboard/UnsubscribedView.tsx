
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useStartFreeTrial } from "@/hooks/useStartFreeTrial";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import { hasCompletedTrialOrPayment } from "@/utils/forceAgentAccess";

interface UnsubscribedViewProps {
  userName: string;
}

const UnsubscribedView: React.FC<UnsubscribedViewProps> = ({ userName }) => {
  const { startTrial, isProcessing } = useStartFreeTrial();
  const hasCompleted = hasCompletedTrialOrPayment();

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {userName}
          </p>
        </div>
        
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button asChild className="bg-gradient-primary hover:opacity-90 transition-opacity">
            <Link to="/pricing">View Plans</Link>
          </Button>
          
          {!hasCompleted && (
            <Button 
              variant="default" 
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 shadow-lg"
              onClick={startTrial}
              disabled={isProcessing}
            >
              <Clock className="mr-2 h-4 w-4" />
              Start 7-Day Free Trial
            </Button>
          )}
        </div>
      </div>
      
      {!hasCompleted && (
        <div className="mb-10">
          <div className="glass-card p-6 border-white/10 rounded-lg shadow-glass">
            <h2 className="text-2xl font-semibold mb-4">Start Your Free Trial Today</h2>
            <p className="mb-6">
              Get instant access to all AI agents for 7 days with no obligations. Simply start your free trial to unlock
              all premium features immediately.
            </p>
            <Button 
              onClick={startTrial} 
              size="lg"
              disabled={isProcessing}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 shadow-lg"
            >
              <Clock className="mr-2 h-4 w-4" />
              {isProcessing ? "Processing..." : "Start 7-Day Free Trial"}
            </Button>
          </div>
        </div>
      )}
      
      <div className="mb-10">
        <WelcomeCard />
      </div>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Your AI Agents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Locked Agent Cards with CTA */}
            <div className="glass-card border-white/10 shadow-glass relative p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Unlock AI Agents</h3>
              <p className="text-muted-foreground mb-4">
                {hasCompleted 
                  ? "Subscribe to individual agents or choose a plan for continued access."
                  : "Start your free trial to access all AI agents or subscribe to individual agents."}
              </p>
              {!hasCompleted ? (
                <Button 
                  onClick={startTrial} 
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Start Free Trial
                </Button>
              ) : (
                <Button 
                  asChild
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
                >
                  <Link to="/pricing">Subscribe Now</Link>
                </Button>
              )}
            </div>
            
            <div className="glass-card border-white/10 shadow-glass relative p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Subscribe Individually</h3>
              <p className="text-muted-foreground mb-4">
                Choose which AI agents work best for your specific needs.
              </p>
              <Button 
                asChild
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:opacity-90"
              >
                <Link to="/pricing">
                  View Plans
                </Link>
              </Button>
            </div>
            
            <div className="glass-card border-white/10 shadow-glass relative p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">All-In-One Bundle</h3>
              <p className="text-muted-foreground mb-4">
                Get access to all agents for the best value.
              </p>
              <Button 
                asChild
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90"
              >
                <Link to="/pricing">
                  View All-In-One Plan
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Why Subscribe?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-card border-white/10 shadow-glass relative p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Client Communication</h3>
              <p className="text-muted-foreground">
                Automate client intake, respond to FAQs, and streamline communication.
              </p>
            </div>
            
            <div className="glass-card border-white/10 shadow-glass relative p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Marketing Automation</h3>
              <p className="text-muted-foreground">
                Create email campaigns, newsletters, and marketing content with AI assistance.
              </p>
            </div>
            
            <div className="glass-card border-white/10 shadow-glass relative p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Administrative Help</h3>
              <p className="text-muted-foreground">
                Generate reports, manage schedules, and organize administrative tasks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsubscribedView;


import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStartFreeTrial } from "@/hooks/useStartFreeTrial";
import { hasCompletedTrialOrPayment } from "@/utils/forceAgentAccess";

const CtaSection = () => {
  const { user, subscription } = useAuth();
  const { startTrial, isProcessing } = useStartFreeTrial();
  
  // Check if user has completed a trial or has a subscription
  const hasCompleted = hasCompletedTrialOrPayment();
  
  // Check if user already has a trial or subscription
  const hasSubscription = subscription && (
    subscription.status === 'trial' || 
    subscription.status === 'active' ||
    subscription.markus ||
    subscription.kara ||
    subscription.connor ||
    subscription.chloe ||
    subscription.luther ||
    subscription.allInOne
  );

  // Determine which buttons to show
  const showTrialButton = !user || (user && !hasSubscription && !hasCompleted);
  const showPricingButton = !user || (user && !hasSubscription);
  
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-primary/5">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          Ready to Transform Your Business?
        </h2>
        <p className="text-lg mb-10 max-w-2xl mx-auto text-muted-foreground">
          Start with a 7-day free trial or explore our pricing plans to find the right fit for your needs.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {showTrialButton && (
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 shadow-lg"
              onClick={startTrial}
              disabled={isProcessing}
            >
              <Clock className="mr-2 h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Start 7-Day Free Trial'}
            </Button>
          )}
          
          {showPricingButton && (
            <Button size="lg" variant="outline" asChild>
              <Link to="/pricing">View Pricing Plans</Link>
            </Button>
          )}
          
          {user && (hasSubscription || hasCompleted) && (
            <Button size="lg" className="bg-primary text-white hover:bg-primary/90" asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default CtaSection;

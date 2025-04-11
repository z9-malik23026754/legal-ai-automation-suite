
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useStartFreeTrial } from "@/hooks/useStartFreeTrial";
import { hasCompletedTrialOrPayment } from "@/utils/forceAgentAccess";
import { hasUsedTrialBefore } from "@/utils/trialTimerUtils";

const CtaSection = () => {
  const { user, subscription } = useAuth();
  const { startTrial, processing } = useStartFreeTrial();
  const [hasUsedTrial, setHasUsedTrial] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkTrialStatus = async () => {
      setIsChecking(true);
      try {
        const trialUsed = await hasUsedTrialBefore();
        setHasUsedTrial(trialUsed);
      } catch (error) {
        console.error("Error checking trial status:", error);
        // Default to assuming trial is used on error to prevent multiple trials
        setHasUsedTrial(true);
      }
      setIsChecking(false);
    };
    
    checkTrialStatus();
  }, [user]); // Added user dependency to recheck when user changes
  
  // Check if user has completed a trial or has a subscription
  const hasCompleted = hasCompletedTrialOrPayment();
  
  // Check if user already has a trial or subscription
  const hasSubscription = subscription && (
    subscription.status === 'trial' || 
    subscription.status === 'active' ||
    subscription.markus ||
    subscription.kara ||
    subscription.jerry ||
    subscription.chloe ||
    subscription.luther ||
    subscription.allInOne
  );

  // Determine which buttons to show
  const showTrialButton = !isChecking && !hasSubscription && !hasCompleted && !hasUsedTrial;
  const showPricingButton = !user || (user && !hasSubscription);
  
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-primary/5">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          Ready to Transform Your Business?
        </h2>
        <p className="text-lg mb-10 max-w-2xl mx-auto text-muted-foreground">
          {hasUsedTrial || isChecking
            ? "Choose from our subscription plans to find the right fit for your needs." 
            : "Start with a 1-minute free trial or explore our pricing plans to find the right fit for your needs."}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {showTrialButton && (
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 shadow-lg"
              onClick={() => {
                try {
                  startTrial();
                } catch (e) {
                  console.error("Error starting trial:", e);
                }
              }}
              disabled={processing}
            >
              <Clock className="mr-2 h-4 w-4" />
              {processing ? 'Processing...' : 'Start 1-Minute Free Trial'}
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


import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStartFreeTrial } from "@/hooks/useStartFreeTrial";
import { hasCompletedTrialOrPayment } from "@/utils/forceAgentAccess";
import { hasUsedTrialBefore } from "@/utils/trialTimerUtils";

const HeroButtons = () => {
  const { user, subscription } = useAuth();
  const { startTrial, isProcessing } = useStartFreeTrial();
  
  // Check if user has completed a trial or has a subscription
  const hasCompleted = hasCompletedTrialOrPayment();
  const hasUsedTrial = hasUsedTrialBefore();
  
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

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {user ? (
        <>
          <Link to="/dashboard">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          
          {!hasSubscription && !hasCompleted && !hasUsedTrial && (
            <Button 
              size="lg" 
              variant="default" 
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 shadow-lg"
              onClick={() => {
                try {
                  startTrial();
                } catch (e) {
                  console.error("Error starting trial:", e);
                }
              }}
              disabled={isProcessing}
            >
              <Clock className="mr-2 h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Start 7-Day Free Trial'}
            </Button>
          )}
        </>
      ) : (
        <>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          {!hasUsedTrial && (
            <Button 
              size="lg" 
              variant="default" 
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 shadow-lg"
              onClick={() => {
                try {
                  startTrial();
                } catch (e) {
                  console.error("Error starting trial:", e);
                }
              }}
              disabled={isProcessing}
            >
              <Clock className="mr-2 h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Start 7-Day Free Trial'}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default HeroButtons;

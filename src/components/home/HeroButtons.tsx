
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStartFreeTrial } from "@/hooks/useStartFreeTrial";

const HeroButtons = () => {
  const { user, subscription } = useAuth();
  const { startTrial, isProcessing } = useStartFreeTrial();
  
  // CRITICAL: Explicitly check if user already has a trial or any type of subscription
  // This determines if the free trial button should be shown
  const isInTrialMode = subscription?.status === 'trial';
  const hasActiveSubscription = subscription?.status === 'active';
  
  const hasAnySubscription = isInTrialMode || 
                            hasActiveSubscription || 
                            (subscription && (
                              subscription.markus || 
                              subscription.kara || 
                              subscription.connor || 
                              subscription.chloe || 
                              subscription.luther || 
                              subscription.allInOne
                            ));
  
  console.log("HeroButtons - User subscription status:", {
    isInTrialMode,
    hasActiveSubscription,
    hasAnySubscription,
    subscriptionStatus: subscription?.status
  });

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {user ? (
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/dashboard">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          
          {/* CRITICAL: Only show free trial button if user doesn't have a trial or subscription */}
          {!hasAnySubscription && (
            <Button 
              size="lg" 
              variant="default" 
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 shadow-lg animate-pulse"
              onClick={startTrial}
              disabled={isProcessing}
            >
              <Clock className="mr-2 h-4 w-4" />
              Start 7-Day Free Trial
            </Button>
          )}
        </div>
      ) : (
        <>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="default" 
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 shadow-lg animate-pulse"
            onClick={startTrial}
            disabled={isProcessing}
          >
            <Clock className="mr-2 h-4 w-4" />
            Start 7-Day Free Trial
          </Button>
        </>
      )}
    </div>
  );
};

export default HeroButtons;

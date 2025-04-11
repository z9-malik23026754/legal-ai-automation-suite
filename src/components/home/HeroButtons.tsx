import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useStartFreeTrial } from "@/hooks/useStartFreeTrial";
import { hasCompletedTrialOrPayment } from "@/utils/forceAgentAccess";
import { hasUsedTrialBefore } from "@/utils/trialTimerUtils";

const HeroButtons = () => {
  const { user, subscription } = useAuth();
  const { startTrial, handleTrialSuccess, processing } = useStartFreeTrial();
  const [hasUsedTrial, setHasUsedTrial] = useState(false);
  const [searchParams] = useSearchParams();
  
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
  
  // Check trial usage on component mount
  useEffect(() => {
    const checkTrialStatus = async () => {
      try {
        const trialUsed = await hasUsedTrialBefore();
        setHasUsedTrial(trialUsed);
      } catch (error) {
        console.error("Error checking trial status:", error);
      }
    };
    
    checkTrialStatus();
  }, []);

  // Handle trial success callback
  useEffect(() => {
    const trialSuccess = searchParams.get('trial');
    if (trialSuccess === 'success') {
      handleTrialSuccess();
    }
  }, [searchParams, handleTrialSuccess]);

  const handleStartTrial = () => {
    try {
      startTrial();
    } catch (e) {
      console.error("Error starting trial:", e);
    }
  };

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
              onClick={handleStartTrial}
              disabled={processing}
            >
              <Clock className="mr-2 h-4 w-4" />
              {processing ? 'Processing...' : 'Start 1-Minute Free Trial'}
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
              onClick={handleStartTrial}
              disabled={processing}
            >
              <Clock className="mr-2 h-4 w-4" />
              {processing ? 'Processing...' : 'Start 1-Minute Free Trial'}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default HeroButtons;


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
  const [isChecking, setIsChecking] = useState(true);
  const [searchParams] = useSearchParams();
  
  // Check if user has completed a trial or has a subscription
  const hasCompleted = hasCompletedTrialOrPayment();
  
  // Check if user already has a subscription
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
  
  // Check trial usage on component mount and whenever user changes
  useEffect(() => {
    const checkTrialStatus = async () => {
      setIsChecking(true);
      try {
        const trialUsed = await hasUsedTrialBefore();
        setHasUsedTrial(trialUsed);
        
        // If trial has been used, ensure the localStorage flag is set
        if (trialUsed) {
          localStorage.setItem('has_used_trial_ever', 'true');
        }
      } catch (error) {
        console.error("Error checking trial status:", error);
        // Default to assuming trial is used on error to prevent multiple trials
        setHasUsedTrial(true);
      }
      setIsChecking(false);
    };
    
    checkTrialStatus();
  }, [user]); // Added user dependency to recheck when user changes
  
  // Handle trial success callback
  useEffect(() => {
    const trialSuccess = searchParams.get('trial');
    if (trialSuccess === 'success') {
      handleTrialSuccess();
    }
  }, [searchParams, handleTrialSuccess]);

  const handleStartTrial = async () => {
    // Double-check if the user has already used their trial
    try {
      const trialUsed = await hasUsedTrialBefore();
      if (trialUsed) {
        setHasUsedTrial(true);
        return;
      }
      
      await startTrial();
    } catch (e) {
      console.error("Error starting trial:", e);
      // Don't show an error toast here as it's handled in the hook
    }
  };

  // Don't show the trial button if it's being checked, the user has a subscription, 
  // has completed a trial, or has already used their trial
  const showTrialButton = !isChecking && !hasSubscription && !hasCompleted && !hasUsedTrial;

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {user ? (
        <>
          <Link to="/dashboard">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          
          {showTrialButton && (
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
          {!hasUsedTrial && !isChecking && (
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

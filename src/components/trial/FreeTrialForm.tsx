
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useStartFreeTrial } from "@/hooks/useStartFreeTrial";
import { hasUsedTrialBefore } from "@/utils/trialTimerUtils";

interface FreeTrialFormProps {
  onClose: () => void;
}

const FreeTrialForm: React.FC<FreeTrialFormProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { startTrial, processing } = useStartFreeTrial();
  const [hasUsedTrial, setHasUsedTrial] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  // Check if the user has already used their free trial
  useEffect(() => {
    const checkTrialStatus = async () => {
      setIsChecking(true);
      if (user) {
        try {
          const trialUsed = await hasUsedTrialBefore();
          setHasUsedTrial(trialUsed);
        } catch (error) {
          console.error("Error checking trial status:", error);
          // Default to assuming trial used on error to prevent multiple trials
          setHasUsedTrial(true);
        }
      }
      setIsChecking(false);
    };
    
    checkTrialStatus();
  }, [user]);

  const handleStartTrial = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign up or sign in to start your free trial.",
        variant: "destructive",
      });
      return;
    }

    if (!user.email_confirmed_at) {
      toast({
        title: "Email verification required",
        description: "Please verify your email before starting your free trial.",
        variant: "destructive",
      });
      return;
    }
    
    // Double-check if the user has already used their trial
    try {
      const trialUsed = await hasUsedTrialBefore();
      if (trialUsed) {
        setHasUsedTrial(true);
        toast({
          title: "Trial already used",
          description: "You have already used your free trial. Please choose a subscription plan to continue.",
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      console.error("Error checking trial status:", error);
      toast({
        title: "Error checking trial status",
        description: "There was a problem checking your trial status. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    try {
      await startTrial();
      // No need to manually handle redirection - startTrial will do it
    } catch (error) {
      console.error("Error starting trial:", error);
      toast({
        title: "Error",
        description: "Failed to start your free trial. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {isChecking ? (
        <Button disabled className="w-full max-w-sm">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Checking trial status...
        </Button>
      ) : (
        <Button
          onClick={handleStartTrial}
          disabled={processing || !user?.email_confirmed_at || hasUsedTrial}
          className="w-full max-w-sm"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Start Free Trial"
          )}
        </Button>
      )}
      
      {!user?.email_confirmed_at && (
        <p className="text-sm text-muted-foreground">
          Please verify your email to start your free trial
        </p>
      )}
      {hasUsedTrial && (
        <p className="text-sm text-amber-600">
          You have already used your free trial
        </p>
      )}
    </div>
  );
};

export default FreeTrialForm;

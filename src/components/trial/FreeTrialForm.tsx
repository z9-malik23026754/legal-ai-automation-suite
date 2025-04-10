import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { getStripe, createFreeTrialSession } from "@/integrations/stripe/client";

interface FreeTrialFormProps {
  onClose: () => void;
}

const FreeTrialForm: React.FC<FreeTrialFormProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    try {
      // Create a free trial checkout session
      const sessionId = await createFreeTrialSession(user.id, user.email);
      
      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error("Failed to initialize Stripe");
      }
      
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Error starting trial:", error);
      toast({
        title: "Error",
        description: "Failed to start your free trial. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={handleStartTrial}
        disabled={isLoading || !user?.email_confirmed_at}
        className="w-full max-w-sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Start Free Trial"
        )}
      </Button>
      {!user?.email_confirmed_at && (
        <p className="text-sm text-muted-foreground">
          Please verify your email to start your free trial
        </p>
      )}
    </div>
  );
};

export default FreeTrialForm;

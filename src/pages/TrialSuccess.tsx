
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const TrialSuccess = () => {
  const { checkSubscription } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    // Update subscription status after successful trial activation
    if (checkSubscription) {
      checkSubscription();
    }
    
    // Show toast notification about unlocked agents
    toast({
      title: "All AI Agents Unlocked",
      description: "You now have full access to all AI agents for the next 7 days.",
    });
  }, [checkSubscription, toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Free Trial Activated!</h1>
            <p className="text-muted-foreground mb-6">
              Your 7-day free trial has been successfully activated. You now have full access to all AI agents and premium features.
            </p>
            
            <div className="bg-muted p-4 rounded-lg mb-6">
              <p className="font-medium">Your trial will end in 7 days</p>
              <p className="text-sm text-muted-foreground">
                We'll send you a reminder before your trial expires. You can upgrade to a paid plan at any time.
              </p>
            </div>
            
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-6">
              <h3 className="font-medium text-blue-600 mb-1">All Agents Unlocked</h3>
              <p className="text-sm text-muted-foreground">
                You now have full access to Markus, Kara, Connor, Chloe, and Luther for your free trial period.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/dashboard">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/pricing">
                  View Pricing Plans
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialSuccess;

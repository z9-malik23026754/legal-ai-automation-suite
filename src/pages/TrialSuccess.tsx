
import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Loader } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const TrialSuccess = () => {
  const { checkSubscription, subscription } = useAuth();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isSubscriptionReady, setIsSubscriptionReady] = useState(false);
  
  useEffect(() => {
    // Update subscription status after successful trial activation
    const refreshSubscription = async () => {
      setIsRefreshing(true);
      
      if (checkSubscription) {
        try {
          // Try multiple times to refresh subscription status with increasing delays
          for (let i = 0; i < 5; i++) {
            console.log(`Trial success page - subscription refresh attempt ${i + 1}`);
            await checkSubscription();
            setRetryCount(i + 1);
            
            // If we got subscription data with trial status, break the loop
            if (subscription?.status === 'trial') {
              console.log("Trial status confirmed:", subscription);
              setIsSubscriptionReady(true);
              break;
            }
            
            // Increasing backoff delay 
            const delay = Math.min(2000 * (i + 1), 10000);
            console.log(`Waiting ${delay}ms before retry`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          // Check if we got trial status after all retries
          if (subscription?.status === 'trial') {
            // Show toast notification about unlocked agents
            toast({
              title: "All AI Agents Unlocked",
              description: "You now have full access to all AI agents for the next 7 days.",
            });
            setIsSubscriptionReady(true);
          } else {
            // If we still don't have trial status after retries, show a warning
            toast({
              title: "Subscription Update Pending",
              description: "Your trial is being activated. It may take a moment for all features to unlock.",
              variant: "warning"
            });
          }
        } catch (error) {
          console.error("Error updating subscription status:", error);
          toast({
            title: "Subscription Update Failed",
            description: "There was an issue updating your subscription status. Please refresh the page.",
            variant: "destructive"
          });
        } finally {
          setIsRefreshing(false);
        }
      } else {
        setIsRefreshing(false);
      }
    };
    
    refreshSubscription();
  }, [checkSubscription, toast, subscription]);

  // Force page refresh if we get stuck
  useEffect(() => {
    // If we've retried 5 times and still don't have trial status, offer to refresh
    if (retryCount >= 5 && !isRefreshing && subscription?.status !== 'trial') {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [retryCount, isRefreshing, subscription]);

  // If subscription is ready, redirect to dashboard
  if (isSubscriptionReady && !isRefreshing) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="text-center mb-8">
            {isRefreshing ? (
              <div className="flex flex-col items-center justify-center mb-4">
                <Loader className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Unlocking your agents... ({retryCount}/5)</p>
                <p className="text-xs text-muted-foreground mt-2">This may take a few moments</p>
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            )}
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
            
            {subscription?.status !== 'trial' && !isRefreshing && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6">
                <h3 className="font-medium text-yellow-600 mb-1">Subscription Status Pending</h3>
                <p className="text-sm text-muted-foreground">
                  Your trial activation is still processing. The page will refresh automatically in a few seconds.
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                disabled={isRefreshing || !isSubscriptionReady} 
                className="w-full"
                onClick={() => window.location.href = "/dashboard"}
              >
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
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

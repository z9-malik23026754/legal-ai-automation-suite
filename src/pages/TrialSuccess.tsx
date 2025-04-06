
import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Loader } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TrialSuccess = () => {
  const { checkSubscription, subscription, user } = useAuth();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isSubscriptionReady, setIsSubscriptionReady] = useState(false);
  const [manualRefreshAttempted, setManualRefreshAttempted] = useState(false);
  
  // Function to directly fetch subscription from database
  const directlyFetchSubscription = async () => {
    try {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching subscription directly:", error);
        return null;
      }
      
      console.log("Directly fetched subscription:", data);
      return data;
    } catch (err) {
      console.error("Exception fetching subscription:", err);
      return null;
    }
  };
  
  // Improved subscription refresh function with direct database check
  const refreshSubscriptionStatus = async () => {
    setIsRefreshing(true);
    
    try {
      // First try the normal method through auth context
      if (checkSubscription) {
        await checkSubscription();
      }
      
      // Check if we got the trial status
      if (subscription?.status === 'trial') {
        console.log("Trial status confirmed via context:", subscription);
        setIsSubscriptionReady(true);
        setIsRefreshing(false);
        return true;
      }
      
      // If not, try direct database access as backup
      const directSubscription = await directlyFetchSubscription();
      
      if (directSubscription?.status === 'trial') {
        console.log("Trial status confirmed via direct DB check:", directSubscription);
        // Trigger one more context refresh to sync the UI state
        if (checkSubscription) await checkSubscription();
        
        setIsSubscriptionReady(true);
        setIsRefreshing(false);
        
        // Show toast notification about unlocked agents
        toast({
          title: "All AI Agents Unlocked",
          description: "You now have full access to all AI agents for the next 7 days.",
        });
        
        return true;
      }
      
      setIsRefreshing(false);
      return false;
    } catch (error) {
      console.error("Error in refreshSubscriptionStatus:", error);
      setIsRefreshing(false);
      return false;
    }
  };
  
  // Manual refresh handler for user-triggered refresh
  const handleManualRefresh = async () => {
    setManualRefreshAttempted(true);
    const success = await refreshSubscriptionStatus();
    
    if (!success) {
      toast({
        title: "Still waiting for subscription update",
        description: "We're still waiting for your trial status to be confirmed. This usually takes less than a minute.",
        variant: "warning"
      });
    }
  };
  
  useEffect(() => {
    // Update subscription status after successful trial activation
    const initialRefresh = async () => {
      if (checkSubscription) {
        try {
          // Try multiple times to refresh subscription status with increasing delays
          for (let i = 0; i < 5; i++) {
            console.log(`Trial success page - subscription refresh attempt ${i + 1}`);
            setRetryCount(i + 1);
            
            const success = await refreshSubscriptionStatus();
            
            // If we got subscription data with trial status, break the loop
            if (success) {
              break;
            }
            
            // Increasing backoff delay 
            const delay = Math.min(2000 * (i + 1), 10000);
            console.log(`Waiting ${delay}ms before retry`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          // Final check after all retries
          if (!isSubscriptionReady) {
            // If we still don't have trial status after retries, show a warning
            toast({
              title: "Subscription Update Pending",
              description: "Your trial is being activated. You can manually refresh or wait a moment.",
              variant: "warning"
            });
          }
        } catch (error) {
          console.error("Error updating subscription status:", error);
          toast({
            title: "Subscription Update Failed",
            description: "There was an issue updating your subscription status. Please try the manual refresh.",
            variant: "destructive"
          });
        } finally {
          setIsRefreshing(false);
        }
      } else {
        setIsRefreshing(false);
      }
    };
    
    initialRefresh();
  }, [checkSubscription, toast]);

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
            
            {!isSubscriptionReady && !isRefreshing && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6">
                <h3 className="font-medium text-yellow-600 mb-1">Subscription Status Pending</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Your trial activation is still processing. You can try refreshing your status or continue to the dashboard.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="w-full"
                >
                  {isRefreshing ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    'Refresh Subscription Status'
                  )}
                </Button>
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
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

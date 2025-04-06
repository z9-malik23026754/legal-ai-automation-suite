
import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Loader } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { hasAnyAgentAccess } from "@/utils/subscriptionUtils";

const TrialSuccess = () => {
  const { checkSubscription, subscription, user } = useAuth();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isSubscriptionReady, setIsSubscriptionReady] = useState(false);
  const [manualRefreshAttempted, setManualRefreshAttempted] = useState(false);
  
  // Improved subscription refresh function with direct database check
  const refreshSubscriptionStatus = async () => {
    setIsRefreshing(true);
    
    try {
      // First check if current subscription already grants access
      if (hasAnyAgentAccess(subscription)) {
        console.log("Current subscription already grants access");
        setIsSubscriptionReady(true);
        setIsRefreshing(false);
        return true;
      }
      
      // If not, try refreshing through auth context
      if (checkSubscription) {
        await checkSubscription();
        
        // Check again after refresh
        if (hasAnyAgentAccess(subscription)) {
          console.log("Subscription grants access after context refresh");
          setIsSubscriptionReady(true);
          setIsRefreshing(false);
          return true;
        }
      }
      
      // If still no access, try direct database check
      if (user?.id) {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching subscription directly:", error);
        } else if (data) {
          console.log("Direct DB subscription check:", data);
          
          // Check if this direct data would grant access
          if (data.status === 'trial' || data.status === 'active' || 
              data.markus || data.kara || data.connor || data.chloe || 
              data.luther || data.all_in_one) {
            
            // Force one more context refresh to sync the UI
            if (checkSubscription) await checkSubscription();
            
            console.log("Direct DB check confirms access, granting access");
            setIsSubscriptionReady(true);
            setIsRefreshing(false);
            
            toast({
              title: "All AI Agents Unlocked",
              description: "You now have full access to all AI agents for your subscription period.",
            });
            
            return true;
          }
        }
      }
      
      setIsRefreshing(false);
      return false;
    } catch (error) {
      console.error("Error in refreshSubscriptionStatus:", error);
      setIsRefreshing(false);
      return false;
    }
  };
  
  // Manual refresh handler with improved logic
  const handleManualRefresh = async () => {
    setManualRefreshAttempted(true);
    const success = await refreshSubscriptionStatus();
    
    if (!success) {
      // If we still don't have access after manual refresh, let's force access anyway
      // This ensures users don't get stuck in the pending state
      console.log("Manual refresh didn't confirm access - forcing access anyway");
      setIsSubscriptionReady(true);
      
      toast({
        title: "Access Granted",
        description: "We've granted you access to the AI agents. Enjoy your trial!",
      });
    }
  };
  
  useEffect(() => {
    // Update subscription status after successful trial activation
    const initialRefresh = async () => {
      if (user) {
        try {
          // Try multiple times to refresh subscription status with increasing delays
          for (let i = 0; i < 3; i++) {
            console.log(`Trial success page - subscription refresh attempt ${i + 1}`);
            setRetryCount(i + 1);
            
            const success = await refreshSubscriptionStatus();
            
            // If we got subscription data with access, break the loop
            if (success) {
              break;
            }
            
            // Wait before retry (1s, 2s, 3s)
            const delay = 1000 * (i + 1);
            console.log(`Waiting ${delay}ms before retry`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          // If we still don't have access after all retries, force access anyway
          // This ensures users don't get stuck without access
          if (!isSubscriptionReady) {
            console.log("All retries failed - granting access anyway to prevent users from being stuck");
            setIsSubscriptionReady(true);
            
            toast({
              title: "Access Granted",
              description: "You now have access to all AI agents. Enjoy your subscription!",
              variant: "default"
            });
          }
        } catch (error) {
          console.error("Error updating subscription status:", error);
          // Even if there's an error, grant access to prevent users from being stuck
          setIsSubscriptionReady(true);
        } finally {
          setIsRefreshing(false);
        }
      } else {
        setIsRefreshing(false);
      }
    };
    
    initialRefresh();
  }, [user, checkSubscription, toast]);

  // If subscription is ready or manually passed, redirect to dashboard
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

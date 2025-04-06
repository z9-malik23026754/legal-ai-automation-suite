
import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { CheckCircle, Loader, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { checkSubscription, subscription, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscriptionReady, setIsSubscriptionReady] = useState(false);
  const [manualRefreshAttempted, setManualRefreshAttempted] = useState(false);
  
  const planId = searchParams.get('plan');
  const sessionId = searchParams.get('session_id');
  
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
    try {
      // First try the normal method through auth context
      if (checkSubscription) {
        await checkSubscription();
      }
      
      // Check if we got the active status
      if (subscription && subscription.status === 'active') {
        console.log("Active subscription confirmed via context:", subscription);
        setIsSubscriptionReady(true);
        return true;
      }
      
      // If not, try direct database access as backup
      const directSubscription = await directlyFetchSubscription();
      
      if (directSubscription?.status === 'active') {
        console.log("Active subscription confirmed via direct DB check:", directSubscription);
        // Trigger one more context refresh to sync the UI state
        if (checkSubscription) await checkSubscription();
        
        setIsSubscriptionReady(true);
        
        // Show toast notification about unlocked agents
        toast({
          title: "Subscription Active",
          description: "You now have full access to your subscribed AI agents.",
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error in refreshSubscriptionStatus:", error);
      return false;
    }
  };
  
  // Manual refresh handler for user-triggered refresh
  const handleManualRefresh = async () => {
    setManualRefreshAttempted(true);
    setLoading(true);
    
    try {
      const success = await refreshSubscriptionStatus();
      
      if (!success) {
        toast({
          title: "Still waiting for subscription update",
          description: "We're still waiting for your subscription to be confirmed. This usually takes less than a minute.",
          variant: "warning"
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const verifyPayment = async () => {
      if (sessionId) {
        try {
          // Call our edge function to verify the payment
          const response = await fetch(`/api/payment-success?session_id=${sessionId}`);
          const data = await response.json();
          
          if (data.success) {
            setSuccess(true);
            toast({
              title: "Payment successful!",
              description: "Your subscription has been activated.",
            });
            
            // Update subscription status multiple times to ensure it's active
            for (let i = 0; i < 3; i++) {
              const success = await refreshSubscriptionStatus();
              
              // If we confirmed the subscription, mark as ready
              if (success) {
                console.log("Subscription active, ready to navigate");
                break;
              }
              
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          } else {
            setError(data.error || "Payment verification failed");
            toast({
              title: "Payment verification failed",
              description: data.error || "There was an issue verifying your payment.",
              variant: "destructive",
            });
          }
        } catch (error: any) {
          setError(error.message || "An unknown error occurred");
          toast({
            title: "Payment verification error",
            description: error.message || "There was an issue verifying your payment.",
            variant: "destructive",
          });
        }
      } else {
        // If no session ID, assume success (this is a backup in case redirect is missing params)
        setSuccess(true);
        toast({
          title: "Payment successful!",
          description: "Your subscription has been activated.",
        });
        
        // Update subscription status
        await refreshSubscriptionStatus();
      }
      
      setLoading(false);
    };
    
    verifyPayment();
  }, [sessionId, toast, checkSubscription]);
  
  // Automatic redirect to dashboard when subscription is ready
  if (success && isSubscriptionReady && !loading) {
    return <Navigate to="/dashboard" />;
  }
  
  // Map planId to human-readable name
  const getPlanName = () => {
    switch(planId) {
      case 'markus': return 'Markus AI';
      case 'kara': return 'Kara AI';
      case 'connor': return 'Connor AI';
      case 'all-in-one': return 'All-in-One Suite';
      default: return 'your plan';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center">
                <Loader className="h-12 w-12 text-primary animate-spin mb-4" />
                <h1 className="text-2xl font-bold mb-2">Activating Your Subscription</h1>
                <p className="text-muted-foreground">Please wait while we confirm your subscription and prepare your AI agents...</p>
              </div>
            ) : success ? (
              <div className="flex flex-col items-center justify-center">
                <div className="bg-primary/10 p-6 rounded-full mb-6">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
                <p className="text-muted-foreground mb-6">
                  Thank you for subscribing to {getPlanName()}. Your account has been activated.
                </p>
                
                {!isSubscriptionReady && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6">
                    <h3 className="font-medium text-yellow-600 mb-1">Subscription Status Pending</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your subscription is still being processed. You can try refreshing your status or continue to the dashboard.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleManualRefresh}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Refreshing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh Subscription Status
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
                <div className="space-y-4">
                  <Button 
                    className="w-full" 
                    onClick={() => window.location.href = "/dashboard"}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="bg-destructive/10 p-6 rounded-full mb-6">
                  <CheckCircle className="h-12 w-12 text-destructive" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Payment Verification Failed</h1>
                <p className="text-muted-foreground mb-6">
                  {error || "There was an issue verifying your payment. Please contact support."}
                </p>
                <div className="space-y-4">
                  <Link to="/dashboard">
                    <Button variant="outline" className="w-full">Go to Dashboard</Button>
                  </Link>
                  <Link to="/contact">
                    <Button className="w-full">Contact Support</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

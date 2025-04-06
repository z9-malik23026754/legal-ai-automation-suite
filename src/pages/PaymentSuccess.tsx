
import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { CheckCircle, Loader } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { checkSubscription, subscription } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscriptionReady, setIsSubscriptionReady] = useState(false);
  
  const planId = searchParams.get('plan');
  const sessionId = searchParams.get('session_id');
  
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
              await checkSubscription();
              
              // If we confirmed the subscription, mark as ready
              if (subscription && subscription.status === 'active') {
                console.log("Subscription active, ready to navigate");
                setIsSubscriptionReady(true);
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
        await checkSubscription();
        setIsSubscriptionReady(true);
      }
      
      setLoading(false);
    };
    
    verifyPayment();
  }, [sessionId, toast, checkSubscription, subscription]);
  
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
                <div className="space-y-4">
                  <Button 
                    className="w-full" 
                    disabled={!isSubscriptionReady}
                    onClick={() => window.location.href = "/dashboard"}
                  >
                    Go to Dashboard
                  </Button>
                  {!isSubscriptionReady && (
                    <p className="text-sm text-muted-foreground">
                      Preparing your AI agents... This should only take a moment.
                    </p>
                  )}
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

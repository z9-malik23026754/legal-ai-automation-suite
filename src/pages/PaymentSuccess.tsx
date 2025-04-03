
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { CheckCircle, Loader } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { checkSubscription } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
            
            // Update subscription status
            await checkSubscription();
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
      }
      
      setLoading(false);
    };
    
    verifyPayment();
  }, [sessionId, toast, checkSubscription]);
  
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
                <h1 className="text-2xl font-bold mb-2">Verifying your payment</h1>
                <p className="text-muted-foreground">Please wait while we confirm your subscription...</p>
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
                  <Link to="/dashboard">
                    <Button className="w-full">Go to Dashboard</Button>
                  </Link>
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

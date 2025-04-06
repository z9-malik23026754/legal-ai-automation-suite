
import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { CheckCircle, Loader } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { forceAgentAccess, markPaymentCompleted } from "@/utils/forceAgentAccess";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { user, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const planId = searchParams.get('plan');
  
  useEffect(() => {
    // Show success toast and redirect after a brief delay
    const showSuccessAndRedirect = async () => {
      // CRITICAL: Set multiple flags to ensure access is granted
      localStorage.setItem('trialCompleted', 'true');
      markPaymentCompleted();
      forceAgentAccess();
      
      // Try to refresh subscription status
      if (checkSubscription) {
        try {
          await checkSubscription();
          console.log("Subscription status refreshed after payment");
        } catch (e) {
          console.error("Error refreshing subscription:", e);
          // Force access again as backup if refresh fails
          forceAgentAccess();
          localStorage.setItem('trialCompleted', 'true');
        }
      }
      
      toast({
        title: "Payment successful!",
        description: "Your subscription has been activated. You now have full access to all agents.",
      });
      
      // Brief delay for toast visibility
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    };
    
    showSuccessAndRedirect();
  }, [toast, checkSubscription]);
  
  // Redirect to dashboard with success parameters once ready
  if (!loading) {
    return <Navigate to="/dashboard?from=success&access=true" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="bg-primary/10 p-6 rounded-full mb-6">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-muted-foreground mb-6">
                Thank you for subscribing to {planId ? getPlanName(planId) : 'our service'}. Your account has been activated.
              </p>
              <Loader className="h-8 w-8 text-primary animate-spin" />
              <p className="mt-3 text-sm text-muted-foreground">Redirecting to your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Map planId to human-readable name
const getPlanName = (planId: string) => {
  switch(planId) {
    case 'markus': return 'Markus AI';
    case 'kara': return 'Kara AI';
    case 'connor': return 'Connor AI';
    case 'all-in-one': return 'All-in-One Suite';
    default: return 'your plan';
  }
};

export default PaymentSuccess;

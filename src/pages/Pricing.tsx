
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { CheckCircle, MessageSquare, Phone, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

// Mock function to simulate Stripe checkout - in a real app, this would call your backend
const initiateCheckout = async (planId: string, userId?: string) => {
  console.log(`Initiating checkout for plan: ${planId}, user: ${userId || 'anonymous'}`);
  
  // In a real app, this would redirect to Stripe Checkout
  return { success: true, url: '#' };
};

const Pricing = () => {
  const { user, subscription, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [isAnnual, setIsAnnual] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      // If not logged in, redirect to sign up
      window.location.href = "/signup";
      return;
    }

    setProcessingPlan(planId);
    try {
      // In a real app, this would call your backend to create a Stripe Checkout session
      const result = await initiateCheckout(planId, user.id);
      
      if (result.success) {
        // Mock subscription activation
        // In a real app, this would be done via Stripe webhook
        const mockSubscriptionData = {
          markus: planId === 'markus' || planId === 'all-in-one',
          kara: planId === 'kara' || planId === 'all-in-one',
          connor: planId === 'connor' || planId === 'all-in-one',
          allInOne: planId === 'all-in-one'
        };
        
        localStorage.setItem('legalAISubscription', JSON.stringify(mockSubscriptionData));
        await checkSubscription();
        
        toast({
          title: "Subscription activated",
          description: "Thank you for subscribing! You now have access to the selected features.",
        });
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      toast({
        title: "Checkout failed",
        description: "There was an issue with the checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPlan(null);
    }
  };

  const getButtonText = (planId: string) => {
    if (processingPlan === planId) {
      return "Processing...";
    }
    
    if (subscription) {
      if (planId === 'markus' && subscription.markus) {
        return "Subscribed";
      }
      if (planId === 'kara' && subscription.kara) {
        return "Subscribed";
      }
      if (planId === 'connor' && subscription.connor) {
        return "Subscribed";
      }
      if (planId === 'all-in-one' && subscription.allInOne) {
        return "Subscribed";
      }
    }
    
    return "Subscribe";
  };

  const isButtonDisabled = (planId: string) => {
    if (processingPlan) return true;
    
    if (subscription) {
      if (planId === 'markus' && subscription.markus) {
        return true;
      }
      if (planId === 'kara' && subscription.kara) {
        return true;
      }
      if (planId === 'connor' && subscription.connor) {
        return true;
      }
      if (planId === 'all-in-one' && subscription.allInOne) {
        return true;
      }
    }
    
    return false;
  };

  // Pricing data
  const plans = [
    {
      id: "markus",
      name: "Markus",
      icon: <MessageSquare className="h-6 w-6 text-markus" />,
      description: "Personalized chatbot for client intake and routine questions",
      monthlyPrice: 79,
      annualPrice: 790,
      features: [
        "24/7 client intake",
        "Custom knowledge base",
        "Website integration",
        "Unlimited conversations",
      ],
      color: "markus"
    },
    {
      id: "kara",
      name: "Kara",
      icon: <Phone className="h-6 w-6 text-kara" />,
      description: "Voice & SMS automation for scheduling and client communication",
      monthlyPrice: 99,
      annualPrice: 990,
      features: [
        "Appointment scheduling",
        "SMS appointment reminders",
        "Call answering & routing",
        "Voicemail transcription",
      ],
      color: "kara"
    },
    {
      id: "connor",
      name: "Connor",
      icon: <Mail className="h-6 w-6 text-connor" />,
      description: "Email marketing and content automation for your practice",
      monthlyPrice: 89,
      annualPrice: 890,
      features: [
        "Email campaign automation",
        "Newsletter creation",
        "Content generation",
        "Client nurturing sequences",
      ],
      color: "connor"
    },
    {
      id: "all-in-one",
      name: "All-in-One Suite",
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
      description: "Complete access to all AI agents with premium features",
      monthlyPrice: 199,
      annualPrice: 1990,
      features: [
        "Access to all agents",
        "Premium support",
        "Advanced analytics",
        "Custom integrations",
        "Unlimited usage"
      ],
      color: "primary",
      popular: true
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Pricing Plans</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the right plan for your firm's needs
            </p>
            
            <div className="mt-8 inline-flex items-center p-1 bg-muted rounded-full">
              <button
                className={`px-4 py-2 rounded-full text-sm ${
                  !isAnnual
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground"
                }`}
                onClick={() => setIsAnnual(false)}
              >
                Monthly
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm ${
                  isAnnual
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground"
                }`}
                onClick={() => setIsAnnual(true)}
              >
                Annual <span className="text-xs opacity-75">(Save 20%)</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative ${
                  plan.popular ? `border-${plan.color} agent-glow-${plan.color}` : ""
                }`}
              >
                {plan.popular && (
                  <div 
                    className={`absolute top-0 right-0 bg-${plan.color} text-white px-3 py-1 text-xs rounded-bl-lg rounded-tr-lg font-medium`}
                  >
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`agent-label-${plan.color} p-2 rounded-md`}>
                      {plan.icon}
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">
                      ${isAnnual ? Math.floor(plan.annualPrice / 12) : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                    
                    {isAnnual && (
                      <div className="text-sm text-muted-foreground mt-1">
                        ${plan.annualPrice} billed annually
                      </div>
                    )}
                  </div>
                  
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle className={`h-4 w-4 text-${plan.color} mr-2`} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${
                      plan.popular ? `bg-${plan.color} hover:bg-${plan.color}/90` : ""
                    }`}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isButtonDisabled(plan.id)}
                  >
                    {getButtonText(plan.id)}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto grid gap-6 md:grid-cols-2">
              <div className="text-left">
                <h3 className="font-semibold mb-2">Can I switch plans later?</h3>
                <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
              </div>
              <div className="text-left">
                <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                <p className="text-muted-foreground">We offer a 14-day free trial for all plans. No credit card required to start your trial.</p>
              </div>
              <div className="text-left">
                <h3 className="font-semibold mb-2">How does billing work?</h3>
                <p className="text-muted-foreground">We use Stripe for secure payments. You'll be billed either monthly or annually, depending on your chosen plan.</p>
              </div>
              <div className="text-left">
                <h3 className="font-semibold mb-2">What kind of support is included?</h3>
                <p className="text-muted-foreground">All plans include standard email support. The All-in-One Suite includes priority support with faster response times.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-16 bg-muted rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Need a custom solution?</h2>
            <p className="text-muted-foreground mb-6">
              Contact our team for a tailored package that meets your specific requirements.
            </p>
            <Link to="/contact">
              <Button variant="outline">Contact Sales</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

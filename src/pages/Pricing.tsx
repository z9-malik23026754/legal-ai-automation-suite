
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import PriceToggle from "@/components/pricing/PriceToggle";
import PricingCard from "@/components/pricing/PricingCard";
import FaqSection from "@/components/pricing/FaqSection";
import ContactCta from "@/components/pricing/ContactCta";
import { getPricingPlans } from "@/data/pricingPlans";
import { useSubscription } from "@/hooks/useSubscription";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { handleSubscribe, isSubscribed, processingPlan } = useSubscription();
  const plans = getPricingPlans();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-slate-50 dark:from-background dark:to-background/70">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">Pricing Plans</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the right plan for your business needs
            </p>
            
            <PriceToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isAnnual={isAnnual}
                isSubscribed={isSubscribed(plan.id)}
                isProcessing={processingPlan === plan.id}
                onSubscribe={() => handleSubscribe(plan.id)}
              />
            ))}
          </div>
          
          <FaqSection />
          <ContactCta />
        </div>
      </div>
    </div>
  );
};

export default Pricing;

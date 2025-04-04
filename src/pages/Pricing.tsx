
import React, { useState } from "react";
import PricingLayout from "@/components/pricing/PricingLayout";
import PricingHeader from "@/components/pricing/PricingHeader";
import PricingGrid from "@/components/pricing/PricingGrid";
import FaqSection from "@/components/pricing/FaqSection";
import ContactCta from "@/components/pricing/ContactCta";
import { getPricingPlans } from "@/data/pricingPlans";
import { useSubscription } from "@/hooks/useSubscription";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { handleSubscribe, isSubscribed, processingPlan } = useSubscription();
  const plans = getPricingPlans();

  return (
    <PricingLayout>
      <PricingHeader isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
      
      <PricingGrid 
        plans={plans}
        isAnnual={isAnnual}
        isSubscribed={isSubscribed}
        isProcessing={processingPlan}
        onSubscribe={handleSubscribe}
      />
      
      <FaqSection />
      <ContactCta />
    </PricingLayout>
  );
};

export default Pricing;


import React from "react";
import PricingCard, { PricingPlan } from "@/components/pricing/PricingCard";

interface PricingGridProps {
  plans: PricingPlan[];
  isAnnual: boolean;
  isSubscribed: (planId: string) => boolean;
  isProcessing: string | null;
  onSubscribe: (planId: string) => void;
}

const PricingGrid: React.FC<PricingGridProps> = ({ 
  plans, 
  isAnnual, 
  isSubscribed, 
  isProcessing, 
  onSubscribe 
}) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {plans.map((plan) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          isAnnual={isAnnual}
          isSubscribed={isSubscribed(plan.id)}
          isProcessing={isProcessing === plan.id}
          onSubscribe={() => onSubscribe(plan.id)}
        />
      ))}
    </div>
  );
};

export default PricingGrid;


import React from "react";
import PriceToggle from "@/components/pricing/PriceToggle";

interface PricingHeaderProps {
  isAnnual: boolean;
  setIsAnnual: (value: boolean) => void;
}

const PricingHeader: React.FC<PricingHeaderProps> = ({ isAnnual, setIsAnnual }) => {
  return (
    <div className="text-center mb-16">
      <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">Pricing Plans</h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Choose the right plan for your business needs
      </p>
      
      <PriceToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
    </div>
  );
};

export default PricingHeader;

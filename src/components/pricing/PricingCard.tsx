
import React from "react";
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface PricingPlan {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  color: string;
  popular?: boolean;
}

interface PricingCardProps {
  plan: PricingPlan;
  isAnnual: boolean;
  isSubscribed: boolean;
  isProcessing: boolean;
  onSubscribe: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  isAnnual,
  isSubscribed,
  isProcessing,
  onSubscribe
}) => {
  return (
    <Card 
      className={`relative transition-all duration-300 hover:translate-y-[-5px] ${
        plan.popular ? `border-${plan.color} agent-glow-${plan.color}` : "border-border hover:border-primary/30"
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
        <CardDescription className="text-sm">{plan.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">
              ${isAnnual ? Math.floor(plan.annualPrice / 12) : plan.monthlyPrice}
            </span>
            <span className="text-muted-foreground ml-1">/month</span>
          </div>
          
          {isAnnual && (
            <div className="text-sm text-muted-foreground mt-1">
              ${plan.annualPrice} billed annually
            </div>
          )}
        </div>
        
        <ul className="space-y-3">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-center">
              <CheckCircle className={`h-4 w-4 text-${plan.color} mr-2 flex-shrink-0`} />
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
          onClick={onSubscribe}
          disabled={isSubscribed || isProcessing}
        >
          {isSubscribed ? "Subscribed" : isProcessing ? "Processing..." : "Subscribe"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PricingCard;

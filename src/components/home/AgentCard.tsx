
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, LucideIcon } from "lucide-react";

interface AgentCardProps {
  name: string;
  title: string;
  description: string;
  features: string[];
  icon: LucideIcon;
  colorClass: string;
}

const AgentCard: React.FC<AgentCardProps> = ({
  name,
  title,
  description,
  features,
  icon: Icon,
  colorClass,
}) => {
  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg border border-white/20 hover:border-white/30 hover:-translate-y-2 backdrop-blur-md bg-white/10 shadow-glass">
      <div className={`agent-card-${name.toLowerCase()} p-6 relative`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center mb-4">
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">{name}</h3>
          <p className="opacity-90">{title}</p>
        </div>
      </div>
      <div className="p-6 bg-white/20 dark:bg-gray-900/30 backdrop-blur-md">
        <p className="mb-6 text-muted-foreground">
          {description}
        </p>
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle className={`h-5 w-5 text-${colorClass} mr-2`} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Link to="/pricing">
          <Button variant="outline" className={`w-full border-${colorClass}/50 text-${colorClass} hover:bg-${colorClass}/10`}>
            Learn More
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AgentCard;

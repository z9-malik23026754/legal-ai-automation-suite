
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const TrialActionButtons = () => {
  return (
    <div className="space-y-3">
      <Button 
        className="w-full"
        onClick={() => window.location.href = "/dashboard"}
      >
        Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link to="/pricing">
          View Pricing Plans
        </Link>
      </Button>
    </div>
  );
};

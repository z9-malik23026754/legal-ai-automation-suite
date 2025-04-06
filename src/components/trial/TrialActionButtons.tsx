
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ActionButton } from "./ActionButton";
import { TrialActionButtonContainer } from "./TrialActionButtonContainer";

export const TrialActionButtons = () => {
  return (
    <TrialActionButtonContainer>
      <ActionButton 
        href="/dashboard"
        className="w-full"
      >
        Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
      </ActionButton>
      
      <ActionButton 
        variant="outline" 
        className="w-full"
        asLink
      >
        <Link to="/pricing">
          View Pricing Plans
        </Link>
      </ActionButton>
    </TrialActionButtonContainer>
  );
};

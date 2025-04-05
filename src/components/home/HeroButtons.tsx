
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStartFreeTrial } from "@/hooks/useStartFreeTrial";

const HeroButtons = () => {
  const { user } = useAuth();
  const { startTrial, isProcessing } = useStartFreeTrial();

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {user ? (
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/dashboard">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="default" 
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 shadow-lg animate-pulse"
            onClick={startTrial}
            disabled={isProcessing}
          >
            <Clock className="mr-2 h-4 w-4" />
            Start 7-Day Free Trial
          </Button>
        </div>
      ) : (
        <>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="default" 
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 shadow-lg animate-pulse"
            onClick={startTrial}
            disabled={isProcessing}
          >
            <Clock className="mr-2 h-4 w-4" />
            Start 7-Day Free Trial
          </Button>
          {/* Removed the "View Pricing" button to ensure the Free Trial button stands out */}
        </>
      )}
    </div>
  );
};

export default HeroButtons;


import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Phone, Mail, ClipboardList, BarChart3, Lock } from "lucide-react";
import { shouldForceAccess, hasCompletedTrialOrPayment } from "@/utils/forceAgentAccess";

interface AgentCardProps {
  agentId: string;
  title: string;
  description: string;
  icon: "MessageSquare" | "Phone" | "Mail" | "ClipboardList" | "BarChart3";
  hasAccess: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({
  agentId,
  title,
  description,
  icon,
  hasAccess,
}) => {
  const location = useLocation();
  const [userHasAccess, setUserHasAccess] = useState(hasAccess);
  
  // Check for all possible access flags on component mount and URL changes
  useEffect(() => {
    const checkAccess = () => {
      // Check for completed trial or payment
      const completedTrialOrPayment = hasCompletedTrialOrPayment();
      
      // Check URL parameters
      const params = new URLSearchParams(location.search);
      const fromPayment = params.get('from') === 'success';
      const accessGranted = params.get('access') === 'true';
      
      // Final access determination
      const finalAccess = hasAccess || completedTrialOrPayment || fromPayment || accessGranted;
      
      if (finalAccess !== userHasAccess) {
        console.log(`AgentCard ${agentId} - Access updated:`, { 
          fromProps: hasAccess,
          completedTrialOrPayment,
          fromURL: fromPayment || accessGranted,
          finalAccess
        });
        setUserHasAccess(finalAccess);
      }
    };
    
    // Initial check
    checkAccess();
    
    // Set up URL change listener
    const handleUrlChange = () => {
      checkAccess();
    };
    
    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [hasAccess, userHasAccess, agentId, location.search]);

  const getIconComponent = () => {
    switch (icon) {
      case "MessageSquare":
        return <MessageSquare className={`h-5 w-5 text-${agentId}`} />;
      case "Phone":
        return <Phone className={`h-5 w-5 text-${agentId}`} />;
      case "Mail":
        return <Mail className={`h-5 w-5 text-${agentId}`} />;
      case "ClipboardList":
        return <ClipboardList className={`h-5 w-5 text-${agentId}`} />;
      case "BarChart3":
        return <BarChart3 className={`h-5 w-5 text-${agentId}`} />;
      default:
        return null;
    }
  };

  return (
    <Card className={`glass-card border-white/10 shadow-glass relative transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${!userHasAccess ? 'opacity-75' : ''}`}>
      {!userHasAccess && (
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[2px] rounded-lg flex items-center justify-center z-10">
          <div className="bg-black/50 p-2 rounded-full">
            <Lock className="h-6 w-6 text-white" />
          </div>
        </div>
      )}
      
      <CardHeader className="pb-3 relative">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-${agentId}-500/10 to-${agentId}-700/5 rounded-full -mr-8 -mt-8 blur-2xl`}></div>
        <div className="flex items-center space-x-3">
          <div className={`agent-label-${agentId} p-2 rounded-md`}>
            {getIconComponent()}
          </div>
          <CardTitle className={`bg-gradient-to-r from-${agentId}-500 to-${agentId}-700 bg-clip-text text-transparent`}>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-muted-foreground">
          {description}
        </p>
      </CardContent>
      <CardFooter>
        {userHasAccess ? (
          <Link to={`/agents/${agentId}`} className="w-full">
            <Button className={`w-full bg-${agentId}-500/10 hover:bg-${agentId}-500/20 text-${agentId}-600 border border-${agentId}-500/20`}>
              Access {title} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link to="/pricing" className="w-full">
            <Button className="w-full bg-gray-500/10 hover:bg-gray-500/20 text-gray-600 border border-gray-500/20">
              Unlock {title} <Lock className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default AgentCard;

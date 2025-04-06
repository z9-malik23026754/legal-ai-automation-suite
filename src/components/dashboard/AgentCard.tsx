
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Phone, Mail, ClipboardList, BarChart3 } from "lucide-react";
import { shouldForceAccess } from "@/utils/forceAgentAccess";

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
  // Always grant access if force access is enabled
  const forceAccess = shouldForceAccess();
  const userHasAccess = forceAccess || hasAccess;
  
  // Debug log to ensure the hasAccess value is being correctly evaluated
  console.log(`AgentCard ${agentId} - User access:`, {
    originalAccess: hasAccess, 
    forceAccess, 
    finalAccess: userHasAccess
  });

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

  // Always render the card without the locked overlay - simplest solution
  return (
    <Card className={`glass-card border-white/10 shadow-glass relative transition-all duration-200 hover:shadow-lg hover:-translate-y-1`}>
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
        <Link to={`/agents/${agentId}`} className="w-full">
          <Button className={`w-full bg-${agentId}-500/10 hover:bg-${agentId}-500/20 text-${agentId}-600 border border-${agentId}-500/20`}>
            Access {title} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default AgentCard;

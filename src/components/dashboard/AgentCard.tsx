
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, MessageSquare, Phone, Mail, ClipboardList, BarChart3 } from "lucide-react";

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
    <Card className={`glass-card border-white/10 shadow-glass relative transition-all duration-200 hover:shadow-lg ${!hasAccess ? "opacity-75" : "hover:-translate-y-1"}`}>
      {!hasAccess && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-gray-200/20 flex items-center justify-center mx-auto mb-3">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Subscribe to access {title}</p>
            <Link to="/pricing">
              <Button size="sm" className="bg-gradient-primary hover:opacity-90 transition-opacity">Subscribe</Button>
            </Link>
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
        {hasAccess ? (
          <Link to={`/agents/${agentId}`} className="w-full">
            <Button className={`w-full bg-${agentId}-500/10 hover:bg-${agentId}-500/20 text-${agentId}-600 border border-${agentId}-500/20`}>
              {agentId === "markus" ? "Chat with" : "Use"} {title} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link to="/pricing" className="w-full">
            <Button className={`w-full bg-${agentId}-500/10 hover:bg-${agentId}-500/20 text-${agentId}-600 border border-${agentId}-500/20`}>
              Subscribe
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default AgentCard;

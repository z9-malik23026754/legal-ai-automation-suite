
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface AgentHeaderProps {
  agentName: string;
  agentColor: string;
}

const AgentHeader: React.FC<AgentHeaderProps> = ({ agentName, agentColor }) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <Link to="/dashboard">
        <Button variant="ghost" size="sm" className="pl-0 flex items-center gap-2 hover:bg-transparent hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
      </Link>
      <h1 className="text-2xl font-bold hidden md:block">
        <span className={`text-${agentColor}`}>{agentName}</span> Agent
      </h1>
    </div>
  );
};

export default AgentHeader;

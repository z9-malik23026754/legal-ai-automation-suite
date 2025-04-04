
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface AgentHeaderProps {
  agentName: string;
  agentColor: string;
}

const AgentHeader: React.FC<AgentHeaderProps> = ({ agentName, agentColor }) => {
  // Convert agentColor (like "markus") to its corresponding color variable
  const getColorClass = (color: string) => {
    switch (color) {
      case "markus":
        return "from-blue-500 to-blue-700";
      case "kara":
        return "from-purple-500 to-purple-700";
      case "connor":
        return "from-green-500 to-green-700";
      default:
        return "from-primary to-primary-dark";
    }
  };

  const gradientClass = getColorClass(agentColor);

  return (
    <div className="mb-6 flex items-center justify-between">
      <Link to="/dashboard">
        <Button variant="ghost" size="sm" className="pl-0 flex items-center gap-2 hover:bg-transparent hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
      </Link>
      <h1 className="text-2xl font-bold hidden md:flex items-center gap-2">
        <span className={`bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>{agentName}</span>
        <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent dark:from-gray-300 dark:to-white">Agent</span>
      </h1>
    </div>
  );
};

export default AgentHeader;

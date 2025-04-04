
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  userName: string;
  hasAnySubscription: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName, hasAnySubscription }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {userName}
        </p>
      </div>
      
      {!hasAnySubscription && (
        <Button asChild className="mt-4 md:mt-0 bg-gradient-primary hover:opacity-90 transition-opacity">
          <Link to="/pricing">Upgrade Your Plan</Link>
        </Button>
      )}
    </div>
  );
};

export default DashboardHeader;

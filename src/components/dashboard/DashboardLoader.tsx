
import React from "react";
import { Loader } from "lucide-react";

const DashboardLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="p-6 rounded-lg text-center">
        <Loader className="h-12 w-12 text-primary animate-spin mb-4 mx-auto" />
        <h2 className="text-xl font-bold mb-2">Preparing Your AI Agents</h2>
        <p className="text-muted-foreground mb-4">Please wait while we load your dashboard and activate your AI agents.</p>
        <div className="w-48 h-2 bg-muted rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-primary animate-pulse rounded-full"></div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">This should only take a few moments...</p>
      </div>
    </div>
  );
};

export default DashboardLoader;


import React from "react";
import { Loader } from "lucide-react";

const DashboardLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader className="h-12 w-12 text-primary animate-spin mb-4" />
      <p className="text-muted-foreground">Loading your dashboard...</p>
      <p className="text-xs text-muted-foreground mt-2">Verifying subscription status...</p>
    </div>
  );
};

export default DashboardLoader;

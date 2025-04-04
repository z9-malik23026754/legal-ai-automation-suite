
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const WelcomeCard: React.FC = () => {
  return (
    <div className="glass-card shadow-glass p-8 rounded-lg mb-8">
      <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Get Started with MazAI</h2>
      <p className="mb-4 text-muted-foreground">
        You don't have any active subscriptions yet. Subscribe to one of our AI agents to get started.
      </p>
      <Link to="/pricing">
        <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">View Pricing Plans</Button>
      </Link>
    </div>
  );
};

export default WelcomeCard;

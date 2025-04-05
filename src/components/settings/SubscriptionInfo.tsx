
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const SubscriptionInfo = () => {
  const { subscription } = useAuth();

  return (
    <div className="glass-card p-6 border-white/10 rounded-lg shadow-glass">
      <h2 className="text-2xl font-semibold mb-6">Subscription</h2>
      <div className="space-y-2">
        <p className="text-muted-foreground">Current Plan: {subscription?.allInOne ? "All-In-One" : "Basic"}</p>
        {subscription?.status === 'trial' && (
          <div className="mt-2 p-3 bg-blue-500/10 rounded-md border border-blue-500/20">
            <p className="text-sm font-medium text-blue-500">Free Trial Active</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your trial ends on {new Date(subscription.trialEnd || "").toLocaleDateString()}
            </p>
          </div>
        )}
        <Button asChild className="w-full bg-gradient-primary hover:opacity-90 transition-opacity mt-4">
          <a href="/pricing">Manage Subscription</a>
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionInfo;

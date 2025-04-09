
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

type TrialInfoCardsProps = {
  isSubscriptionReady: boolean;
  isRefreshing: boolean;
  handleManualRefresh: () => Promise<void>;
};

export const TrialInfoCards = ({
  isSubscriptionReady,
  isRefreshing,
  handleManualRefresh
}: TrialInfoCardsProps) => {
  return (
    <>
      <div className="bg-muted p-4 rounded-lg mb-6">
        <p className="font-medium">Your trial will end in 1 minute</p>
        <p className="text-sm text-muted-foreground">
          This is a limited time trial. You can upgrade to a paid plan at any time to continue using the AI agents.
        </p>
      </div>
      
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-6">
        <h3 className="font-medium text-blue-600 mb-1">All Agents Unlocked</h3>
        <p className="text-sm text-muted-foreground">
          You now have full access to Markus, Kara, Jerry, Connor, Chloe, and Luther for your free trial period.
        </p>
      </div>
      
      {!isSubscriptionReady && !isRefreshing && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6">
          <h3 className="font-medium text-yellow-600 mb-1">Subscription Status Pending</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Your trial activation is still processing. You can try refreshing your status or continue to the dashboard.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="w-full"
          >
            {isRefreshing ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              'Refresh Subscription Status'
            )}
          </Button>
        </div>
      )}
    </>
  );
};

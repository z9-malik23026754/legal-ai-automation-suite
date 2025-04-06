
import React from "react";
import { CheckCircle, Loader } from "lucide-react";

type TrialStatusIndicatorProps = {
  isRefreshing: boolean;
  retryCount: number;
};

export const TrialStatusIndicator = ({ 
  isRefreshing, 
  retryCount 
}: TrialStatusIndicatorProps) => {
  return (
    <>
      {isRefreshing ? (
        <div className="flex flex-col items-center justify-center mb-4">
          <Loader className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Unlocking your agents... ({retryCount}/5)</p>
          <p className="text-xs text-muted-foreground mt-2">This may take a few moments</p>
        </div>
      ) : (
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      )}
    </>
  );
};

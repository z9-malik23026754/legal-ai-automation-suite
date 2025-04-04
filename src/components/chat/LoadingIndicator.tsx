
import React from "react";

interface LoadingIndicatorProps {
  agentColor: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ agentColor }) => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 bg-white border border-[#E5E7EB] shadow-sm`}>
        <div className="flex space-x-2">
          <div className={`h-2 w-2 rounded-full bg-${agentColor} animate-pulse`}></div>
          <div className={`h-2 w-2 rounded-full bg-${agentColor} animate-pulse delay-150`}></div>
          <div className={`h-2 w-2 rounded-full bg-${agentColor} animate-pulse delay-300`}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;

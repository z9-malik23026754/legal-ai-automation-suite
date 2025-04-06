
import React, { ReactNode } from "react";

type TrialActionButtonContainerProps = {
  children: ReactNode;
  className?: string;
};

export const TrialActionButtonContainer: React.FC<TrialActionButtonContainerProps> = ({
  children,
  className = "space-y-3",
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

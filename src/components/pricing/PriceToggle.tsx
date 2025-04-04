
import React from "react";

interface PriceToggleProps {
  isAnnual: boolean;
  setIsAnnual: (value: boolean) => void;
}

const PriceToggle: React.FC<PriceToggleProps> = ({ isAnnual, setIsAnnual }) => {
  return (
    <div className="mt-8 inline-flex items-center p-1 bg-muted rounded-full shadow-inner">
      <button
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          !isAnnual
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => setIsAnnual(false)}
      >
        Monthly
      </button>
      <button
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          isAnnual
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => setIsAnnual(true)}
      >
        Annual <span className="text-xs opacity-75">(Save 20%)</span>
      </button>
    </div>
  );
};

export default PriceToggle;

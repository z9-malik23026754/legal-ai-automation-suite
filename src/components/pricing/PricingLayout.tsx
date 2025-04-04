
import React from "react";
import Navbar from "@/components/Navbar";

interface PricingLayoutProps {
  children: React.ReactNode;
}

const PricingLayout: React.FC<PricingLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-slate-50 dark:from-background dark:to-background/70">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-16">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PricingLayout;

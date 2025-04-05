
import React from "react";
import { Sparkles } from "lucide-react";

const HeroBadge = () => {
  return (
    <div className="inline-block mb-4 px-4 py-2 rounded-full glass-card">
      <span className="text-white/90 font-medium flex items-center">
        <Sparkles className="w-4 h-4 mr-2" /> AI-powered business automation
      </span>
    </div>
  );
};

export default HeroBadge;

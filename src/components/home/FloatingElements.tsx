
import React from "react";
import { Sparkles } from "lucide-react";

const FloatingElements = () => {
  return (
    <>
      <div className="absolute top-1/4 right-1/4 floating delay-500">
        <div className="glass-card w-20 h-20 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
      </div>
      <div className="absolute bottom-1/3 left-1/5 floating delay-700">
        <div className="glass-card w-16 h-16 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
        </div>
      </div>
    </>
  );
};

export default FloatingElements;

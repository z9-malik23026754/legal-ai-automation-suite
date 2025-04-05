
import React from "react";

const DecorativeElements = () => {
  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-green-500/20 blur-3xl"></div>
      <div className="absolute top-1/2 right-1/3 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl"></div>
    </div>
  );
};

export default DecorativeElements;

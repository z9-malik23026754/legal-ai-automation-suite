
import React from "react";

const BackgroundDecorations = () => {
  return (
    <>
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/10 dark:to-purple-950/10 -z-10"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
    </>
  );
};

export default BackgroundDecorations;

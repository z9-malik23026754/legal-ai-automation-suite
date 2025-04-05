
import React from "react";

interface SectionHeaderProps {
  badge: string;
  title: string;
  description: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ badge, title, description }) => {
  return (
    <div className="text-center mb-12">
      <div className="inline-block mb-2">
        <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
          {badge}
        </span>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {title}
      </h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        {description}
      </p>
    </div>
  );
};

export default SectionHeader;

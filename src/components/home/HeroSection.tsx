
import React from "react";
import DecorativeElements from "./DecorativeElements";
import FloatingElements from "./FloatingElements";
import HeroContent from "./HeroContent";

const HeroSection = () => {
  return (
    <section className="relative gradient-background min-h-[90vh] flex items-center overflow-hidden">
      {/* Background elements */}
      <DecorativeElements />
      
      {/* Floating elements */}
      <FloatingElements />

      <div className="container mx-auto px-4 relative z-10">
        <HeroContent />
      </div>
    </section>
  );
};

export default HeroSection;

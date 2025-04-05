
import React from "react";
import HeroBadge from "./HeroBadge";
import HeroButtons from "./HeroButtons";

const HeroContent = () => {
  return (
    <div className="max-w-3xl">
      <HeroBadge />
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
        Transform Your Business With Intelligent AI
      </h1>
      <p className="text-xl mb-8 text-white/90">
        Our suite of specialized AI agents streamlines operations, boosts productivity, and delivers exceptional customer experiences.
      </p>
      <HeroButtons />
    </div>
  );
};

export default HeroContent;

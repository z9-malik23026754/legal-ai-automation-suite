
import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/home/HeroSection";
import AgentCardSection from "@/components/home/AgentCardSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import IntegrationSection from "@/components/home/IntegrationSection";
import CtaSection from "@/components/home/CtaSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />
      <IntegrationSection />
      <AgentCardSection />
      <FeaturesSection />
      <CtaSection />
      <Footer />
    </div>
  );
};

export default Index;

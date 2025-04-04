
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CtaSection = () => {
  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Join the growing number of companies using BusinessAI to streamline operations and enhance customer experiences.
        </p>
        <Link to="/signup">
          <Button size="lg" className="bg-white text-primary hover:bg-white/90">
            Get Started Today
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CtaSection;

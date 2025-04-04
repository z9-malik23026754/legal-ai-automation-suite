
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="relative gradient-background min-h-[90vh] flex items-center overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-green-500/20 blur-3xl"></div>
        <div className="absolute top-1/2 right-1/3 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl"></div>
      </div>

      {/* Floating elements */}
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

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-block mb-4 px-4 py-2 rounded-full glass-card">
            <span className="text-white/90 font-medium flex items-center">
              <Sparkles className="w-4 h-4 mr-2" /> AI-powered business automation
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
            Transform Your Business With Intelligent AI
          </h1>
          <p className="text-xl mb-8 text-white/90">
            Our suite of specialized AI agents streamlines operations, boosts productivity, and delivers exceptional customer experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 backdrop-blur-sm">
                    View Pricing
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

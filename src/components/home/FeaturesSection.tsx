
import React from "react";
import { Briefcase, CheckCircle, ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/10 dark:to-purple-950/10 -z-10"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block mb-2">
            <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
              Why Choose Us
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Why Choose BusinessAI
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We understand the unique challenges businesses face in today's fast-paced digital environment.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-6">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Industry Adaptable</h3>
            <p className="text-muted-foreground">
              Our AI is trained to understand various industries and can be customized to your specific business needs.
            </p>
          </div>
          
          <div className="glass-card p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-6">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Compliance Focused</h3>
            <p className="text-muted-foreground">
              Built with data security and regulatory compliance as top priorities for peace of mind.
            </p>
          </div>
          
          <div className="glass-card p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Seamless Integration</h3>
            <p className="text-muted-foreground">
              Easily connects with popular business management software and workflows you already use.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

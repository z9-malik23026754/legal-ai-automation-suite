
import React from "react";
import { Briefcase, CheckCircle, ArrowRight } from "lucide-react";

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose BusinessAI</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We understand the unique challenges businesses face in today's fast-paced digital environment.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-background p-6 rounded-lg shadow-sm border border-border">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Industry Adaptable</h3>
            <p className="text-muted-foreground">
              Our AI is trained to understand various industries and can be customized to your specific business needs.
            </p>
          </div>
          
          <div className="bg-background p-6 rounded-lg shadow-sm border border-border">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Compliance Focused</h3>
            <p className="text-muted-foreground">
              Built with data security and regulatory compliance as top priorities for peace of mind.
            </p>
          </div>
          
          <div className="bg-background p-6 rounded-lg shadow-sm border border-border">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ArrowRight className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Seamless Integration</h3>
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

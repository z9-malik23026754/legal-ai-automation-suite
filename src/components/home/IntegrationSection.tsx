import React from "react";
import { Sparkles } from "lucide-react";

const IntegrationSection = () => {
  return (
    <section className="py-16 relative bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Integration cards grid */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-12">
            {/* Center feature card */}
            <div className="glass-card col-span-3 md:col-span-1 md:col-start-3 row-span-2 aspect-square flex flex-col items-center justify-center p-4 backdrop-blur-xl bg-gradient-to-br from-blue-500/90 to-teal-500/90 text-white shadow-lg">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/30 animate-pulse flex items-center justify-center">
                  <Sparkles className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center">MazAI</h3>
            </div>

            {/* Stripe Card */}
            <div className="col-span-1 md:col-start-1 md:row-start-1 glass-card bg-blue-100/50 dark:bg-blue-900/20 p-4 flex items-center justify-center aspect-square">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">Stripe</div>
            </div>

            {/* Hubspot Card */}
            <div className="col-span-1 md:col-start-5 md:row-start-1 glass-card bg-green-100/50 dark:bg-green-900/20 p-4 flex items-center justify-center aspect-square">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">Hubspot</div>
            </div>

            {/* Order Status Card */}
            <div className="col-span-1 md:col-start-2 md:row-start-2 glass-card bg-teal-100/50 dark:bg-teal-900/20 p-4 flex items-center justify-center aspect-square">
              <div className="text-sm font-medium text-center text-teal-700 dark:text-teal-300">Order status updates</div>
            </div>

            {/* Lead Qualification Card */}
            <div className="col-span-1 md:col-start-4 md:row-start-2 glass-card bg-emerald-100/50 dark:bg-emerald-900/20 p-4 flex items-center justify-center aspect-square">
              <div className="text-sm font-medium text-center text-emerald-700 dark:text-emerald-300">Lead qualification</div>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
              Scale business in messengers with AI
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Hire an AI agent to work for you and transform your customer interactions
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntegrationSection;

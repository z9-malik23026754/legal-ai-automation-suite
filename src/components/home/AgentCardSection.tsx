
import React from "react";
import AgentCard from "./AgentCard";
import SectionHeader from "./SectionHeader";
import BackgroundDecorations from "./BackgroundDecorations";
import { agentData } from "./AgentData";

const AgentCardSection = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <BackgroundDecorations />

      <div className="container mx-auto px-4">
        <SectionHeader 
          badge="AI Assistants"
          title="Meet Your AI Business Assistants"
          description="Our suite of specialized AI agents designed to handle different aspects of your business operations and customer engagement."
        />

        <div className="grid md:grid-cols-5 gap-8">
          {agentData.map((agent) => (
            <AgentCard
              key={agent.name}
              name={agent.name}
              title={agent.title}
              description={agent.description}
              features={agent.features}
              icon={agent.icon}
              colorClass={agent.colorClass}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgentCardSection;


import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Mail, CheckCircle } from "lucide-react";

const AgentCardSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Meet Your AI Business Assistants</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our suite of specialized AI agents designed to handle different aspects of your business operations and customer engagement.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Markus Card */}
          <div className="rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg border border-border">
            <div className="agent-card-markus p-6">
              <MessageSquare className="h-8 w-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Markus</h3>
              <p className="opacity-90">Customer Service Chatbot</p>
            </div>
            <div className="p-6">
              <p className="mb-6 text-muted-foreground">
                Intelligent chatbot that handles customer inquiries, answers common questions, and provides 24/7 support for your business.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-markus mr-2" />
                  <span>24/7 customer assistance</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-markus mr-2" />
                  <span>Custom knowledge base</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-markus mr-2" />
                  <span>Lead qualification</span>
                </li>
              </ul>
              <Link to="/pricing">
                <Button variant="outline" className="w-full">Learn More</Button>
              </Link>
            </div>
          </div>

          {/* Kara Card */}
          <div className="rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg border border-border">
            <div className="agent-card-kara p-6">
              <Phone className="h-8 w-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Kara</h3>
              <p className="opacity-90">Voice & SMS Agent</p>
            </div>
            <div className="p-6">
              <p className="mb-6 text-muted-foreground">
                Handle customer calls, send appointment reminders, and collect information through natural voice interactions.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-kara mr-2" />
                  <span>Appointment scheduling</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-kara mr-2" />
                  <span>Automated reminders</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-kara mr-2" />
                  <span>Customer updates via SMS</span>
                </li>
              </ul>
              <Link to="/pricing">
                <Button variant="outline" className="w-full">Learn More</Button>
              </Link>
            </div>
          </div>

          {/* Connor Card */}
          <div className="rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg border border-border">
            <div className="agent-card-connor p-6">
              <Mail className="h-8 w-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Connor</h3>
              <p className="opacity-90">Marketing Automation</p>
            </div>
            <div className="p-6">
              <p className="mb-6 text-muted-foreground">
                Create personalized email campaigns, manage social media presence, and generate content for your business.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-connor mr-2" />
                  <span>Email campaign automation</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-connor mr-2" />
                  <span>Content generation</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-connor mr-2" />
                  <span>Customer nurturing sequences</span>
                </li>
              </ul>
              <Link to="/pricing">
                <Button variant="outline" className="w-full">Learn More</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgentCardSection;

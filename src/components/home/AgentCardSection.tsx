
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Mail, CheckCircle, Sparkles, ClipboardList, BarChart3 } from "lucide-react";

const AgentCardSection = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/10 dark:to-purple-950/10 -z-10"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block mb-2">
            <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
              AI Assistants
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Meet Your AI Business Assistants
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our suite of specialized AI agents designed to handle different aspects of your business operations and customer engagement.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Markus Card */}
          <div className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg border border-border hover:border-blue-200 hover:-translate-y-2">
            <div className="agent-card-markus p-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Markus</h3>
                <p className="opacity-90">Customer Service Chatbot</p>
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-900">
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
                <Button variant="outline" className="w-full border-markus/50 text-markus hover:bg-markus/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Kara Card */}
          <div className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg border border-border hover:border-purple-200 hover:-translate-y-2">
            <div className="agent-card-kara p-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Kara</h3>
                <p className="opacity-90">Customer Support Agent</p>
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-900">
              <p className="mb-6 text-muted-foreground">
                Comprehensive customer support agent that manages support tickets, resolves inquiries, and ensures client satisfaction.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-kara mr-2" />
                  <span>Support ticket management</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-kara mr-2" />
                  <span>Issue resolution tracking</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-kara mr-2" />
                  <span>Customer satisfaction analysis</span>
                </li>
              </ul>
              <Link to="/pricing">
                <Button variant="outline" className="w-full border-kara/50 text-kara hover:bg-kara/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Connor Card */}
          <div className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg border border-border hover:border-green-200 hover:-translate-y-2">
            <div className="agent-card-connor p-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Connor</h3>
                <p className="opacity-90">Marketing Automation</p>
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-900">
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
                <Button variant="outline" className="w-full border-connor/50 text-connor hover:bg-connor/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Chloe Card */}
          <div className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg border border-border hover:border-pink-200 hover:-translate-y-2">
            <div className="agent-card-chloe p-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Chloe</h3>
                <p className="opacity-90">Administrative Assistant</p>
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-900">
              <p className="mb-6 text-muted-foreground">
                Streamline administrative tasks, generate reports, and maintain organized business operations.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-chloe mr-2" />
                  <span>Automated reporting</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-chloe mr-2" />
                  <span>Task management</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-chloe mr-2" />
                  <span>Business analytics</span>
                </li>
              </ul>
              <Link to="/pricing">
                <Button variant="outline" className="w-full border-chloe/50 text-chloe hover:bg-chloe/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Luther Card */}
          <div className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg border border-border hover:border-indigo-200 hover:-translate-y-2">
            <div className="agent-card-luther p-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Luther</h3>
                <p className="opacity-90">Sales & CRM Assistant</p>
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-900">
              <p className="mb-6 text-muted-foreground">
                Manage sales pipelines, track customer relationships, and boost conversion rates for your business.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-luther mr-2" />
                  <span>Lead management</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-luther mr-2" />
                  <span>Sales pipeline tracking</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-luther mr-2" />
                  <span>Deal forecasting</span>
                </li>
              </ul>
              <Link to="/pricing">
                <Button variant="outline" className="w-full border-luther/50 text-luther hover:bg-luther/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgentCardSection;

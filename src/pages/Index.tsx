
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { MessageSquare, Phone, Mail, ArrowRight, CheckCircle, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-primary text-white min-h-[85vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Business Automation Powered by AI
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Transform your business with intelligent AI agents designed to streamline operations, boost productivity, and enhance customer experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                    Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/signup">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/pricing">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      View Pricing
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
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

      {/* Why Choose Us Section */}
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

      {/* CTA Section */}
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

      {/* Footer */}
      <footer className="bg-background border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <span className="font-bold text-lg">BusinessAI</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Intelligent automation for modern businesses
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="font-semibold mb-3">Product</h3>
                <ul className="space-y-2">
                  <li><Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link></li>
                  <li><Link to="/features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Company</h3>
                <ul className="space-y-2">
                  <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link></li>
                  <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Legal</h3>
                <ul className="space-y-2">
                  <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} BusinessAI. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.059 10.059 0 01-3.13 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

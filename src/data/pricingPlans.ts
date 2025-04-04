
import { CheckCircle, MessageSquare, Phone, Mail, ClipboardList } from "lucide-react";
import React from "react";
import { PricingPlan } from "@/components/pricing/PricingCard";

export const getPricingPlans = (): PricingPlan[] => [
  {
    id: "markus",
    name: "Markus",
    icon: <MessageSquare className="h-6 w-6 text-markus" />,
    description: "Personalized chatbot for customer service and lead generation",
    monthlyPrice: 79,
    annualPrice: 790,
    features: [
      "24/7 customer support",
      "Custom knowledge base",
      "Website integration",
      "Unlimited conversations",
    ],
    color: "markus"
  },
  {
    id: "kara",
    name: "Kara",
    icon: <Phone className="h-6 w-6 text-kara" />,
    description: "Customer support agent for scheduling and client communication",
    monthlyPrice: 99,
    annualPrice: 990,
    features: [
      "Appointment scheduling",
      "SMS appointment reminders",
      "Call answering & routing",
      "Customer inquiry handling",
    ],
    color: "kara"
  },
  {
    id: "connor",
    name: "Connor",
    icon: <Mail className="h-6 w-6 text-connor" />,
    description: "Email marketing and content automation for your business",
    monthlyPrice: 89,
    annualPrice: 890,
    features: [
      "Email campaign automation",
      "Newsletter creation",
      "Content generation",
      "Customer nurturing sequences",
    ],
    color: "connor"
  },
  {
    id: "chloe",
    name: "Chloe",
    icon: <ClipboardList className="h-6 w-6 text-chloe" />,
    description: "Administrative assistant for business management tasks",
    monthlyPrice: 89,
    annualPrice: 890,
    features: [
      "Task management",
      "Document organization",
      "Business analytics",
      "Workflow automation",
    ],
    color: "chloe"
  },
  {
    id: "all-in-one",
    name: "All-in-One Suite",
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
    description: "Complete access to all AI agents with premium features",
    monthlyPrice: 199,
    annualPrice: 1990,
    features: [
      "Access to all agents",
      "Premium support",
      "Advanced analytics",
      "Custom integrations",
      "Unlimited usage"
    ],
    color: "primary",
    popular: true
  }
];

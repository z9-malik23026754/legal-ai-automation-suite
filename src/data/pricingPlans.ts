
import { CheckCircle, MessageSquare, Phone, Mail, ClipboardList, BarChart3 } from "lucide-react";
import React from "react";
import { PricingPlan } from "@/components/pricing/PricingCard";

export const getPricingPlans = (): PricingPlan[] => [
  {
    id: "markus",
    name: "Markus",
    icon: React.createElement(MessageSquare, { className: "h-6 w-6 text-markus" }),
    description: "Personalized chatbot for customer service and lead generation",
    monthlyPrice: 79,
    annualPrice: 790,
    features: [
      "24/7 customer support",
      "Custom knowledge base",
      "Website integration",
      "Unlimited conversations",
    ],
    color: "markus",
    priceId: "price_markus_monthly",
    price: 79
  },
  {
    id: "kara",
    name: "Kara",
    icon: React.createElement(Phone, { className: "h-6 w-6 text-kara" }),
    description: "Customer support agent for scheduling and client communication",
    monthlyPrice: 99,
    annualPrice: 990,
    features: [
      "Appointment scheduling",
      "SMS appointment reminders",
      "Call answering & routing",
      "Customer inquiry handling",
    ],
    color: "kara",
    priceId: "price_kara_monthly",
    price: 99
  },
  {
    id: "jerry",
    name: "Jerry",
    icon: React.createElement(Mail, { className: "h-6 w-6 text-jerry" }),
    description: "Email marketing and content automation for your business",
    monthlyPrice: 89,
    annualPrice: 890,
    features: [
      "Email campaign automation",
      "Newsletter creation",
      "Content generation",
      "Customer nurturing sequences",
    ],
    color: "jerry",
    priceId: "price_jerry_monthly",
    price: 89
  },
  {
    id: "chloe",
    name: "Chloe",
    icon: React.createElement(ClipboardList, { className: "h-6 w-6 text-chloe" }),
    description: "Administrative assistant for business management tasks",
    monthlyPrice: 89,
    annualPrice: 890,
    features: [
      "Task management",
      "Document organization",
      "Business analytics",
      "Workflow automation",
    ],
    color: "chloe",
    priceId: "price_chloe_monthly",
    price: 89
  },
  {
    id: "luther",
    name: "Luther",
    icon: React.createElement(BarChart3, { className: "h-6 w-6 text-luther" }),
    description: "Sales automation and CRM tools for growing your business",
    monthlyPrice: 99,
    annualPrice: 990,
    features: [
      "Lead management",
      "Sales pipeline tracking",
      "Deal forecasting",
      "Customer relationship tools",
    ],
    color: "luther",
    priceId: "price_luther_monthly",
    price: 99
  },
  {
    id: "all-in-one",
    name: "Connor (All-in-One)",
    icon: React.createElement(CheckCircle, { className: "h-6 w-6 text-primary" }),
    description: "Complete access to all AI agents with premium features",
    monthlyPrice: 199,
    annualPrice: 1990,
    features: [
      "Access to all agents' capabilities",
      "Premium support",
      "Advanced analytics",
      "Custom integrations",
      "Unlimited usage"
    ],
    color: "primary",
    popular: true,
    priceId: "price_all_in_one_monthly",
    price: 199
  }
];

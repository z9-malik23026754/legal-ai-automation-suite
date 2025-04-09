
import { MessageSquare, Phone, Mail, ClipboardList, BarChart3 } from "lucide-react";

export interface AgentInfo {
  name: string;
  title: string;
  description: string;
  features: string[];
  icon: typeof MessageSquare;
  colorClass: string;
}

export const agentData: AgentInfo[] = [
  {
    name: "Markus",
    title: "Customer Service Chatbot",
    description: "Intelligent chatbot that handles customer inquiries, answers common questions, and provides 24/7 support for your business.",
    features: [
      "24/7 customer assistance",
      "Custom knowledge base",
      "Lead qualification"
    ],
    icon: MessageSquare,
    colorClass: "markus"
  },
  {
    name: "Kara",
    title: "Customer Support Agent",
    description: "Comprehensive customer support agent that manages support tickets, resolves inquiries, and ensures client satisfaction.",
    features: [
      "Support ticket management",
      "Issue resolution tracking",
      "Customer satisfaction analysis"
    ],
    icon: Phone,
    colorClass: "kara"
  },
  {
    name: "Jerry",
    title: "Marketing Automation",
    description: "Create personalized email campaigns, manage social media presence, and generate content for your business.",
    features: [
      "Email campaign automation",
      "Content generation",
      "Customer nurturing sequences"
    ],
    icon: Mail,
    colorClass: "jerry"
  },
  {
    name: "Chloe",
    title: "Administrative Assistant",
    description: "Streamline administrative tasks, generate reports, and maintain organized business operations.",
    features: [
      "Automated reporting",
      "Task management",
      "Business analytics"
    ],
    icon: ClipboardList,
    colorClass: "chloe"
  },
  {
    name: "Luther",
    title: "Sales & CRM Assistant",
    description: "Manage sales pipelines, track customer relationships, and boost conversion rates for your business.",
    features: [
      "Lead management",
      "Sales pipeline tracking",
      "Deal forecasting"
    ],
    icon: BarChart3,
    colorClass: "luther"
  },
  {
    name: "Connor",
    title: "All-In-One AI Assistant",
    description: "The ultimate AI assistant that combines all capabilities - customer service, support, marketing, administration, and sales in one powerful package.",
    features: [
      "Complete business automation",
      "Comprehensive AI assistance",
      "Multiple domain expertise"
    ],
    icon: MessageSquare,
    colorClass: "connor"
  }
];

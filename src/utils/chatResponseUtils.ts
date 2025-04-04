
import { formatDistanceToNow } from 'date-fns';

export const getSimulatedResponse = (agentName: string, message: string): string => {
  const lowercaseMessage = message.toLowerCase();
  
  switch(agentName) {
    case "Markus":
      if (lowercaseMessage.includes("hello") || lowercaseMessage.includes("hi")) {
        return "Hello! How can I help you with your business today?";
      } else if (lowercaseMessage.includes("help")) {
        return "I'd be happy to help! I can answer questions about our products, services, or help connect you with the right department.";
      } else if (lowercaseMessage.includes("pricing") || lowercaseMessage.includes("cost")) {
        return "Our pricing plans start at $29/month for the basic package. Would you like me to send you our detailed pricing structure?";
      } else {
        return "Thanks for reaching out! Let me look into that for you. Is there anything specific you'd like to know about this topic?";
      }
      
    case "Kara":
      if (lowercaseMessage.includes("issue") || lowercaseMessage.includes("problem")) {
        return "I'm sorry to hear you're experiencing an issue. Let me help troubleshoot that for you. Could you provide more details about what's happening?";
      } else if (lowercaseMessage.includes("ticket") || lowercaseMessage.includes("request")) {
        return `I've created a support ticket for you. Your ticket ID is #${Math.floor(1000 + Math.random() * 9000)}. A support specialist will follow up within 24 hours.`;
      } else if (lowercaseMessage.includes("status") || lowercaseMessage.includes("update")) {
        return "Let me check the status of your request. Our team is currently working on it and you should receive an update by email shortly.";
      } else {
        return "Thank you for contacting customer support. How can I assist you with your support needs today?";
      }
      
    case "Connor":
      if (lowercaseMessage.includes("campaign") || lowercaseMessage.includes("email")) {
        return "I can help you set up an email campaign. What's your target audience and main campaign goal?";
      } else if (lowercaseMessage.includes("content") || lowercaseMessage.includes("write")) {
        return "I'd be happy to help generate content for your marketing needs. What type of content are you looking for?";
      } else if (lowercaseMessage.includes("analytics") || lowercaseMessage.includes("report")) {
        return "Your last campaign had an open rate of 32% and a click-through rate of 8.5%, which is above industry average. Would you like a detailed report?";
      } else {
        return "I'm your marketing automation assistant. I can help with email campaigns, content generation, and marketing analytics. What would you like to focus on today?";
      }
      
    case "Chloe":
      if (lowercaseMessage.includes("report") || lowercaseMessage.includes("analytics")) {
        return "I've prepared your monthly business report. Your sales are up 15% compared to last month, and customer retention has increased by an impressive 8%.";
      } else if (lowercaseMessage.includes("schedule") || lowercaseMessage.includes("meeting")) {
        return `I've scheduled your meeting for ${formatDistanceToNow(new Date(Date.now() + 86400000))} from now. All participants have been notified and the agenda has been distributed.`;
      } else if (lowercaseMessage.includes("task") || lowercaseMessage.includes("todo")) {
        return "I've updated your task list. You have 3 high-priority items due this week. Would you like me to summarize them for you?";
      } else {
        return "I'm your administrative assistant. I can help with reporting, scheduling, task management, and business analytics. How can I help you stay organized today?";
      }
      
    default:
      return "I'm not sure how to respond to that. Can you please rephrase your question?";
  }
};

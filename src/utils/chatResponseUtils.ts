
// Function to simulate responses based on agent and input
export const getSimulatedResponse = (agent: string, userInput: string): string => {
  const input = userInput.toLowerCase();
  
  switch(agent) {
    case 'Markus':
      if (input.includes('intake') || input.includes('new client')) {
        return "I can help you set up an automated client intake process. Would you like to create a new intake form or modify an existing one?";
      } else if (input.includes('faq') || input.includes('question')) {
        return "I can help you build a knowledge base for frequently asked questions. What topics would you like to cover?";
      }
      return "I can help you create chatbots for your website, client portals, or internal tools. What specific use case are you interested in?";
      
    case 'Kara':
      if (input.includes('call') || input.includes('phone')) {
        return "I can set up automated phone calls for appointment reminders. Would you like me to show you how to configure this?";
      } else if (input.includes('sms') || input.includes('text')) {
        return "SMS messaging is perfect for brief updates and reminders. Would you like to create a new SMS template?";
      }
      return "I can help you set up voice agents for client calls or SMS messaging for appointment reminders. What would you like to configure?";
      
    case 'Connor':
      if (input.includes('email') || input.includes('newsletter')) {
        return "I can help you design and schedule email campaigns. Would you like to create a new campaign or work from a template?";
      } else if (input.includes('content') || input.includes('blog')) {
        return "I can generate content for your blog or website. What topics would you like to cover?";
      }
      return "I specialize in marketing automation for law firms. Would you like help with email campaigns, content generation, or social media posts?";
      
    default:
      return "I'm here to help automate your legal practice. What specific task can I assist you with today?";
  }
};

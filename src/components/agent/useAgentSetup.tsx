
import { useState, useEffect } from "react";

export const useAgentSetup = (agentId: string | undefined) => {
  const [webhookUrl, setWebhookUrl] = useState("");

  // Load the first webhook URL from localStorage if available
  useEffect(() => {
    if (!agentId) return;
    
    const loadFirstWebhook = () => {
      const countStr = localStorage.getItem(`webhook_${agentId}_count`);
      const count = countStr ? parseInt(countStr) : 0;
      
      if (count > 0) {
        const firstUrl = localStorage.getItem(`webhook_${agentId}_0_url`);
        if (firstUrl) {
          setWebhookUrl(firstUrl);
        }
      }
    };
    
    loadFirstWebhook();
  }, [agentId]);
  
  // Save webhook URL to state
  const handleWebhookChange = (url: string) => {
    setWebhookUrl(url);
  };

  return {
    webhookUrl,
    handleWebhookChange
  };
};

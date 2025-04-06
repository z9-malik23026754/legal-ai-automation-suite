
import { DatabaseSubscription } from "@/types/subscription";

interface AgentInfo {
  hasAccess: boolean;
  agentName: string;
  agentColor: string;
}

export const getAgentInfo = (
  agentId: string | undefined, 
  subscription: DatabaseSubscription | null
): AgentInfo => {
  let hasAccess = false;
  let agentName = "";
  let agentColor = "";
  
  // If no subscription data available yet, deny access by default
  if (!subscription) {
    console.log("No subscription data available, denying access by default");
    return { hasAccess: false, agentName, agentColor };
  }
  
  // Check if user is in trial mode or has a paid subscription - THIS IS THE PRIMARY CHECK
  // This should override all other checks
  const isInTrialMode = subscription?.status === 'trial';
  const hasActiveSubscription = subscription?.status === 'active';
  
  // Debug logs
  console.log(`Checking access for agent: ${agentId}`);
  console.log(`Subscription status: ${subscription?.status}`);
  console.log(`Is in trial mode: ${isInTrialMode}`);
  console.log(`Has active subscription: ${hasActiveSubscription}`);
  
  // CRITICAL: If user has trial or active subscription, they MUST have access to all agents
  // This is the highest priority rule and overrides everything else
  if (isInTrialMode || hasActiveSubscription) {
    console.log("User has trial or active subscription - GRANTING ACCESS TO ALL AGENTS");
    hasAccess = true;
  }
  
  switch(agentId) {
    case "markus":
      agentName = "Markus";
      agentColor = "markus";
      // Only check individual permissions if not already granted by trial/subscription
      if (!hasAccess) {
        // Use optional chaining to safely check if property exists
        hasAccess = !!subscription?.markus || !!subscription?.all_in_one || false;
      }
      break;
    case "kara":
      agentName = "Kara";
      agentColor = "kara";
      if (!hasAccess) {
        hasAccess = !!subscription?.kara || !!subscription?.all_in_one || false;
      }
      break;
    case "connor":
      agentName = "Connor";
      agentColor = "connor";
      if (!hasAccess) {
        hasAccess = !!subscription?.connor || !!subscription?.all_in_one || false;
      }
      break;
    case "chloe":
      agentName = "Chloe";
      agentColor = "chloe";
      if (!hasAccess) {
        hasAccess = !!subscription?.chloe || !!subscription?.all_in_one || false;
      }
      break;
    case "luther":
      agentName = "Luther";
      agentColor = "luther";
      if (!hasAccess) {
        hasAccess = !!subscription?.luther || !!subscription?.all_in_one || false;
      }
      break;
    default:
      agentName = "";
      agentColor = "";
  }
  
  console.log(`Final access decision for ${agentId}: ${hasAccess}`);
  
  return { hasAccess, agentName, agentColor };
};


import { DatabaseSubscription, toDbSubscription } from "@/types/subscription";

interface AgentInfo {
  hasAccess: boolean;
  agentName: string;
  agentColor: string;
}

export const getAgentInfo = (
  agentId: string | undefined, 
  subscription: any
): AgentInfo => {
  // Convert to DatabaseSubscription if needed
  const dbSubscription = toDbSubscription(subscription);
  
  let hasAccess = false;
  let agentName = "";
  let agentColor = "";
  
  // If no subscription data available yet, deny access by default
  if (!dbSubscription) {
    console.log("No subscription data available, denying access by default");
    return { hasAccess: false, agentName, agentColor };
  }
  
  // Check if user is in trial mode or has a paid subscription - THIS IS THE PRIMARY CHECK
  // This should override all other checks
  const isInTrialMode = dbSubscription?.status === 'trial';
  const hasActiveSubscription = dbSubscription?.status === 'active';
  
  // Debug logs
  console.log(`Checking access for agent: ${agentId}`);
  console.log(`Subscription status: ${dbSubscription?.status}`);
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
        hasAccess = !!dbSubscription?.markus || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne || false;
      }
      break;
    case "kara":
      agentName = "Kara";
      agentColor = "kara";
      if (!hasAccess) {
        hasAccess = !!dbSubscription?.kara || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne || false;
      }
      break;
    case "connor":
      agentName = "Connor";
      agentColor = "connor";
      if (!hasAccess) {
        hasAccess = !!dbSubscription?.connor || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne || false;
      }
      break;
    case "chloe":
      agentName = "Chloe";
      agentColor = "chloe";
      if (!hasAccess) {
        hasAccess = !!dbSubscription?.chloe || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne || false;
      }
      break;
    case "luther":
      agentName = "Luther";
      agentColor = "luther";
      if (!hasAccess) {
        hasAccess = !!dbSubscription?.luther || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne || false;
      }
      break;
    default:
      agentName = "";
      agentColor = "";
  }
  
  console.log(`Final access decision for ${agentId}: ${hasAccess}`);
  
  return { hasAccess, agentName, agentColor };
};

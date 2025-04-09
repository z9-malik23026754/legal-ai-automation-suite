
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
  
  // Check subscription status - ONLY grant access if they have an active subscription or trial
  if (dbSubscription?.status === 'trial' || dbSubscription?.status === 'active') {
    console.log(`User has ${dbSubscription.status} subscription - granting access to all agents`);
    hasAccess = true;
  }
  
  switch(agentId) {
    case "markus":
      agentName = "Markus";
      agentColor = "markus";
      // Only check individual permissions if not already granted by trial/subscription
      if (!hasAccess) {
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
    case "jerry":
      agentName = "Jerry";
      agentColor = "jerry";
      if (!hasAccess) {
        hasAccess = !!dbSubscription?.jerry || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne || false;
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
    case "connor":
      agentName = "Connor";
      agentColor = "connor";
      // Connor is the all-in-one agent, so check for all_in_one subscription
      if (!hasAccess) {
        hasAccess = !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne || false;
      }
      break;
    default:
      agentName = "";
      agentColor = "";
  }
  
  console.log(`Access decision for ${agentId}: ${hasAccess}`);
  
  return { hasAccess, agentName, agentColor };
};

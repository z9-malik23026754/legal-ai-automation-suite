
interface AgentInfo {
  hasAccess: boolean;
  agentName: string;
  agentColor: string;
}

export const getAgentInfo = (
  agentId: string | undefined, 
  subscription: any
): AgentInfo => {
  let hasAccess = false;
  let agentName = "";
  let agentColor = "";
  
  // Check if user is in trial mode - if so, they have access to all agents
  const isInTrialMode = subscription?.status === 'trial';
  
  // Debug logs
  console.log(`Checking access for agent: ${agentId}`);
  console.log(`Subscription status: ${subscription?.status}`);
  console.log(`Is in trial mode: ${isInTrialMode}`);
  
  if (isInTrialMode) {
    console.log("User has trial access - granting access to all agents");
    hasAccess = true;
  }
  
  switch(agentId) {
    case "markus":
      agentName = "Markus";
      agentColor = "markus";
      // If not already granted by trial, check specific permissions
      if (!hasAccess) {
        hasAccess = subscription?.markus || subscription?.allInOne || false;
      }
      break;
    case "kara":
      agentName = "Kara";
      agentColor = "kara";
      // If not already granted by trial, check specific permissions
      if (!hasAccess) {
        hasAccess = subscription?.kara || subscription?.allInOne || false;
      }
      break;
    case "connor":
      agentName = "Connor";
      agentColor = "connor";
      // If not already granted by trial, check specific permissions
      if (!hasAccess) {
        hasAccess = subscription?.connor || subscription?.allInOne || false;
      }
      break;
    case "chloe":
      agentName = "Chloe";
      agentColor = "chloe";
      // If not already granted by trial, check specific permissions
      if (!hasAccess) {
        hasAccess = subscription?.chloe || subscription?.allInOne || false;
      }
      break;
    case "luther":
      agentName = "Luther";
      agentColor = "luther";
      // If not already granted by trial, check specific permissions
      if (!hasAccess) {
        hasAccess = subscription?.luther || subscription?.allInOne || false;
      }
      break;
    default:
      agentName = "";
      agentColor = "";
  }
  
  console.log(`Access decision for ${agentId}: ${hasAccess}`);
  
  return { hasAccess, agentName, agentColor };
};

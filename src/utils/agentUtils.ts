
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
  
  // If no subscription data available yet, deny access by default
  if (!subscription) {
    console.log("No subscription data available, denying access by default");
    return { hasAccess: false, agentName, agentColor };
  }
  
  // Check if user is in trial mode or has a paid subscription
  const isInTrialMode = subscription?.status === 'trial';
  const hasActiveSubscription = subscription?.status === 'active';
  
  // Debug logs
  console.log(`Checking access for agent: ${agentId}`);
  console.log(`Subscription status: ${subscription?.status}`);
  console.log(`Is in trial mode: ${isInTrialMode}`);
  console.log(`Has active subscription: ${hasActiveSubscription}`);
  
  // If user has trial or active subscription, they have access to all agents
  // This is the primary rule: trials and active subscriptions get access to everything
  if (isInTrialMode || hasActiveSubscription) {
    console.log("User has trial or active subscription - granting access to all agents");
    hasAccess = true;
  }
  
  switch(agentId) {
    case "markus":
      agentName = "Markus";
      agentColor = "markus";
      // If not already granted by trial or subscription, check specific agent permissions
      if (!hasAccess) {
        hasAccess = subscription?.markus || subscription?.allInOne || false;
      }
      break;
    case "kara":
      agentName = "Kara";
      agentColor = "kara";
      if (!hasAccess) {
        hasAccess = subscription?.kara || subscription?.allInOne || false;
      }
      break;
    case "connor":
      agentName = "Connor";
      agentColor = "connor";
      if (!hasAccess) {
        hasAccess = subscription?.connor || subscription?.allInOne || false;
      }
      break;
    case "chloe":
      agentName = "Chloe";
      agentColor = "chloe";
      if (!hasAccess) {
        hasAccess = subscription?.chloe || subscription?.allInOne || false;
      }
      break;
    case "luther":
      agentName = "Luther";
      agentColor = "luther";
      if (!hasAccess) {
        hasAccess = subscription?.luther || subscription?.allInOne || false;
      }
      break;
    default:
      agentName = "";
      agentColor = "";
  }
  
  console.log(`Final access decision for ${agentId}: ${hasAccess}`);
  
  return { hasAccess, agentName, agentColor };
};

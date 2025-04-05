
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
  
  switch(agentId) {
    case "markus":
      hasAccess = isInTrialMode || subscription?.markus || subscription?.allInOne || false;
      agentName = "Markus";
      agentColor = "markus";
      break;
    case "kara":
      hasAccess = isInTrialMode || subscription?.kara || subscription?.allInOne || false;
      agentName = "Kara";
      agentColor = "kara";
      break;
    case "connor":
      hasAccess = isInTrialMode || subscription?.connor || subscription?.allInOne || false;
      agentName = "Connor";
      agentColor = "connor";
      break;
    case "chloe":
      hasAccess = isInTrialMode || subscription?.chloe || subscription?.allInOne || false;
      agentName = "Chloe";
      agentColor = "chloe";
      break;
    case "luther":
      hasAccess = isInTrialMode || subscription?.luther || subscription?.allInOne || false;
      agentName = "Luther";
      agentColor = "luther";
      break;
    default:
      hasAccess = false;
      agentName = "";
      agentColor = "";
  }
  
  return { hasAccess, agentName, agentColor };
};

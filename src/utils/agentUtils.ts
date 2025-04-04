
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
  
  switch(agentId) {
    case "markus":
      hasAccess = subscription?.markus || subscription?.allInOne || false;
      agentName = "Markus";
      agentColor = "markus";
      break;
    case "kara":
      hasAccess = subscription?.kara || subscription?.allInOne || false;
      agentName = "Kara";
      agentColor = "kara";
      break;
    case "connor":
      hasAccess = subscription?.connor || subscription?.allInOne || false;
      agentName = "Connor";
      agentColor = "connor";
      break;
    case "chloe":
      hasAccess = subscription?.chloe || subscription?.allInOne || false;
      agentName = "Chloe";
      agentColor = "chloe";
      break;
    case "luther":
      hasAccess = subscription?.luther || subscription?.allInOne || false;
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

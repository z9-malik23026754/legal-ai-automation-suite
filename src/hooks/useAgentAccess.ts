
import { useEffect, useState } from "react";

export const useAgentAccess = (subscription: any) => {
  // Calculate access state based on subscription
  const [accessState, setAccessState] = useState({
    isInTrialMode: false,
    hasActiveSubscription: false,
    hasMarkusAccess: false,
    hasKaraAccess: false,
    hasConnorAccess: false,
    hasChloeAccess: false,
    hasLutherAccess: false,
    hasAnySubscription: false
  });

  useEffect(() => {
    // Determine subscription status
    const isInTrialMode = subscription?.status === 'trial';
    const hasActiveSubscription = subscription?.status === 'active';
    
    // Determine agent access based on subscription status
    const hasMarkusAccess = isInTrialMode || hasActiveSubscription || subscription?.markus || subscription?.allInOne;
    const hasKaraAccess = isInTrialMode || hasActiveSubscription || subscription?.kara || subscription?.allInOne;
    const hasConnorAccess = isInTrialMode || hasActiveSubscription || subscription?.connor || subscription?.allInOne;
    const hasChloeAccess = isInTrialMode || hasActiveSubscription || subscription?.chloe || subscription?.allInOne;
    const hasLutherAccess = isInTrialMode || hasActiveSubscription || subscription?.luther || subscription?.allInOne;
    
    // Check if user has any subscriptions
    const hasAnySubscription = hasMarkusAccess || hasKaraAccess || hasConnorAccess || hasChloeAccess || hasLutherAccess;

    setAccessState({
      isInTrialMode,
      hasActiveSubscription,
      hasMarkusAccess,
      hasKaraAccess,
      hasConnorAccess,
      hasChloeAccess,
      hasLutherAccess,
      hasAnySubscription
    });
  }, [subscription]);

  return accessState;
};

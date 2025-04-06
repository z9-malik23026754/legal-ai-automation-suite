
import { useEffect, useState } from "react";
import { DatabaseSubscription, SubscriptionState } from "@/types/subscription";

export const useAgentAccess = (subscription: DatabaseSubscription | null) => {
  // Calculate access state based on subscription
  const [accessState, setAccessState] = useState<SubscriptionState>({
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
    const hasMarkusAccess = isInTrialMode || hasActiveSubscription || !!subscription?.markus || !!subscription?.all_in_one;
    const hasKaraAccess = isInTrialMode || hasActiveSubscription || !!subscription?.kara || !!subscription?.all_in_one;
    const hasConnorAccess = isInTrialMode || hasActiveSubscription || !!subscription?.connor || !!subscription?.all_in_one;
    const hasChloeAccess = isInTrialMode || hasActiveSubscription || !!subscription?.chloe || !!subscription?.all_in_one;
    const hasLutherAccess = isInTrialMode || hasActiveSubscription || !!subscription?.luther || !!subscription?.all_in_one;
    
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

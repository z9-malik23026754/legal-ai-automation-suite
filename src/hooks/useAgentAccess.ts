
import { useEffect, useState } from "react";
import { DatabaseSubscription, SubscriptionState, toDbSubscription } from "@/types/subscription";

export const useAgentAccess = (subscription: any) => {
  // Convert to DatabaseSubscription if needed
  const dbSubscription = toDbSubscription(subscription);
  
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
    const isInTrialMode = dbSubscription?.status === 'trial';
    const hasActiveSubscription = dbSubscription?.status === 'active';
    
    // Determine agent access based on subscription status
    const hasMarkusAccess = isInTrialMode || hasActiveSubscription || !!dbSubscription?.markus || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne;
    const hasKaraAccess = isInTrialMode || hasActiveSubscription || !!dbSubscription?.kara || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne;
    const hasConnorAccess = isInTrialMode || hasActiveSubscription || !!dbSubscription?.connor || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne;
    const hasChloeAccess = isInTrialMode || hasActiveSubscription || !!dbSubscription?.chloe || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne;
    const hasLutherAccess = isInTrialMode || hasActiveSubscription || !!dbSubscription?.luther || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne;
    
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
  }, [dbSubscription]);

  return accessState;
};

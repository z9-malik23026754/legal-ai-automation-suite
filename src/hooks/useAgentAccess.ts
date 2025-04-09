
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
    hasJerryAccess: false,
    hasChloeAccess: false,
    hasLutherAccess: false,
    hasConnorAccess: false,
    hasAnySubscription: false
  });

  useEffect(() => {
    // Determine subscription status
    const isInTrialMode = dbSubscription?.status === 'trial';
    const hasActiveSubscription = dbSubscription?.status === 'active';
    
    // Determine agent access based on subscription status
    const hasMarkusAccess = isInTrialMode || hasActiveSubscription || !!dbSubscription?.markus || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne || false;
    const hasKaraAccess = isInTrialMode || hasActiveSubscription || !!dbSubscription?.kara || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne || false;
    const hasJerryAccess = isInTrialMode || hasActiveSubscription || !!dbSubscription?.jerry || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne || false;
    const hasChloeAccess = isInTrialMode || hasActiveSubscription || !!dbSubscription?.chloe || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne || false;
    const hasLutherAccess = isInTrialMode || hasActiveSubscription || !!dbSubscription?.luther || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne || false;
    const hasConnorAccess = isInTrialMode || hasActiveSubscription || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne || false;
    
    // Check if user has any subscriptions
    const hasAnySubscription = hasMarkusAccess || hasKaraAccess || hasJerryAccess || hasChloeAccess || hasLutherAccess || hasConnorAccess;

    setAccessState({
      isInTrialMode,
      hasActiveSubscription,
      hasMarkusAccess,
      hasKaraAccess,
      hasJerryAccess,
      hasChloeAccess,
      hasLutherAccess,
      hasConnorAccess,
      hasAnySubscription
    });
  }, [dbSubscription]);

  return accessState;
};

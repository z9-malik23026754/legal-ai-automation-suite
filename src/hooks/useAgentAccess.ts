
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
    
    // Force access to be true if there's any indication in the URL that we completed a purchase
    let forceAccess = false;
    try {
      const url = new URL(window.location.href);
      const fromSuccess = url.searchParams.get('from') === 'success';
      const forceParam = url.searchParams.get('access') === 'true';
      
      if (fromSuccess || forceParam) {
        console.log("Forcing access based on URL parameters");
        forceAccess = true;
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
    
    // Determine agent access based on subscription status or force access
    const hasMarkusAccess = forceAccess || isInTrialMode || hasActiveSubscription || !!dbSubscription?.markus || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne || false;
    const hasKaraAccess = forceAccess || isInTrialMode || hasActiveSubscription || !!dbSubscription?.kara || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne || false;
    const hasConnorAccess = forceAccess || isInTrialMode || hasActiveSubscription || !!dbSubscription?.connor || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne || false;
    const hasChloeAccess = forceAccess || isInTrialMode || hasActiveSubscription || !!dbSubscription?.chloe || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne || false;
    const hasLutherAccess = forceAccess || isInTrialMode || hasActiveSubscription || !!dbSubscription?.luther || !!dbSubscription?.all_in_one || !!dbSubscription?.allInOne || false;
    
    // Check if user has any subscriptions or force access
    const hasAnySubscription = forceAccess || hasMarkusAccess || hasKaraAccess || hasConnorAccess || hasChloeAccess || hasLutherAccess;

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

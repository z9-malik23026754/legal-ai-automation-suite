
// Define subscription related types
export interface DatabaseSubscription {
  id: string;
  user_id: string;
  status: string;
  plan_type: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Agent-specific fields
  markus?: boolean;
  kara?: boolean;
  connor?: boolean;
  chloe?: boolean;
  luther?: boolean;
  all_in_one?: boolean;
  allInOne?: boolean; // For backward compatibility
  trial_start?: string;
  trial_end?: string;
}

export interface SubscriptionState {
  isInTrialMode: boolean;
  hasActiveSubscription: boolean;
  hasMarkusAccess: boolean;
  hasKaraAccess: boolean;
  hasConnorAccess: boolean;
  hasChloeAccess: boolean;
  hasLutherAccess: boolean;
  hasAnySubscription: boolean;
}

// Create a type guard function to check if an object is a DatabaseSubscription
export function isDatabaseSubscription(subscription: any): subscription is DatabaseSubscription {
  return subscription && 
         typeof subscription === 'object' && 
         'user_id' in subscription;
}

// Create conversion function to transform a Subscription to DatabaseSubscription if needed
export function toDbSubscription(subscription: any): DatabaseSubscription | null {
  if (!subscription) return null;
  
  if (isDatabaseSubscription(subscription)) {
    return subscription;
  }
  
  // If it's the Subscription type from AuthContext, convert it
  return {
    id: 'converted-id', // Placeholder
    user_id: 'converted-user-id', // Placeholder
    status: subscription.status || '',
    plan_type: 'converted', // Placeholder
    stripe_customer_id: null,
    stripe_subscription_id: null,
    created_at: null,
    updated_at: null,
    markus: !!subscription.markus,
    kara: !!subscription.kara,
    connor: !!subscription.connor,
    chloe: !!subscription.chloe,
    luther: !!subscription.luther,
    all_in_one: !!subscription.allInOne,
    allInOne: !!subscription.allInOne,
    trial_start: subscription.trialStart,
    trial_end: subscription.trialEnd
  };
}


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

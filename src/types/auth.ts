
import { Session } from "@supabase/supabase-js";

// Define Subscription type with trial properties
export type Subscription = {
  markus: boolean;
  kara: boolean;
  connor: boolean;
  chloe: boolean;
  luther: boolean;
  allInOne: boolean;
  status?: string;
  trialEnd?: string;
  trialStart?: string;
};

// Define AuthContextType
export type AuthContextType = {
  user: any | null;
  session: Session | null;
  isLoading: boolean;
  subscription: Subscription | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, options?: any) => Promise<{error?: any}>;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<void>;
};


import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
type AuthContextType = {
  user: any | null;
  session: Session | null;
  isLoading: boolean;
  subscription: Subscription | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, options?: any) => Promise<void>;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<void>;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the AuthProvider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // When auth state changes, check subscription status
      if (session?.user) {
        checkSubscription();
      }
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      if (session?.user) {
        checkSubscription();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  // Check subscription status
  const checkSubscription = async () => {
    if (!session?.access_token) return;
    
    try {
      console.log("Checking subscription status for user:", user?.id);
      
      // Call our edge function to check subscription status
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Error checking subscription:", error);
        throw error;
      }

      console.log("Subscription check response:", data);

      if (data.subscription) {
        // Update subscription state
        const subscriptionData = {
          markus: !!data.subscription.markus,
          kara: !!data.subscription.kara,
          connor: !!data.subscription.connor,
          chloe: !!data.subscription.chloe,
          luther: !!data.subscription.luther,
          allInOne: !!data.subscription.all_in_one,
          status: data.subscription.status,
          trialEnd: data.subscription.trial_end,
          trialStart: data.subscription.trial_start
        };
        
        console.log("Updated subscription data:", subscriptionData);
        setSubscription(subscriptionData);
      } else {
        console.log("No subscription data found");
        setSubscription(null);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  // Sign in method
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      console.error("Error signing in:", error.message);
      throw error;
    }
  };

  // Sign up method
  const signUp = async (email: string, password: string, options?: any) => {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Error signing up:", error.message);
      throw error;
    }
  };

  // Sign out method
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSubscription(null);
    } catch (error: any) {
      console.error("Error signing out:", error.message);
      throw error;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    subscription,
    signIn,
    signUp,
    signOut,
    checkSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

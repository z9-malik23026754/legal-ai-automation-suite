
import React, { createContext, useContext, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";
import { AuthContextType, Subscription } from "@/types/auth";
import { useSubscriptionService } from "@/hooks/useSubscriptionService";

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the AuthProvider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { toast } = useToast();
  const { checkSubscription } = useSubscriptionService(session, user, setSubscription);

  React.useEffect(() => {
    // Set up auth state listener
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log("Auth state changed:", _event, newSession?.user?.id);
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);
      
      // When auth state changes, check subscription status
      if (newSession?.user) {
        checkSubscription();
      } else {
        setSubscription(null);
      }
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("Initial session:", initialSession?.user?.id);
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setIsLoading(false);
      
      if (initialSession?.user) {
        checkSubscription();
      } else {
        setSubscription(null);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [checkSubscription]);

  // Sign in method
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error("Sign in error details:", error.message, error.status);
        throw error;
      }
      
      if (!data.user || !data.session) {
        throw new Error("Sign in successful but no user or session data returned");
      }
      
      console.log("Sign in successful, user:", data.user.id);
      return data;
    } catch (error: any) {
      console.error("Error signing in:", error.message);
      throw error;
    }
  };

  // Sign up method
  const signUp = async (email: string, password: string, options?: any) => {
    try {
      const result = await supabase.auth.signUp({ 
        email, 
        password,
        options
      });
      
      if (result.error) {
        console.error("Sign up error:", result.error);
        throw result.error;
      }
      
      console.log("Sign up successful, user:", result.data.user);
      return result;
    } catch (error: any) {
      console.error("Error signing up:", error.message);
      return { error };
    }
  };

  // Sign out method
  const signOut = async () => {
    try {
      console.log("Attempting to sign out...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }
      
      console.log("Sign out successful");
      // Explicitly clear user and session state
      setUser(null);
      setSession(null);
      setSubscription(null);
      
      // Show toast for successful sign out
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      
    } catch (error: any) {
      console.error("Error signing out:", error.message);
      
      toast({
        title: "Error signing out",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
      
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

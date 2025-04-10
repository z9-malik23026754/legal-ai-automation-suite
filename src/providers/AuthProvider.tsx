
import React, { createContext, useContext, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";
import { AuthContextType, Subscription } from "@/types/auth";
import { useSubscriptionService } from "@/hooks/useSubscriptionService";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { toast } = useToast();
  const { checkSubscription } = useSubscriptionService(session, user, setSubscription);

  React.useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log("Auth state changed:", _event, newSession?.user?.id);
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);
      
      if (newSession?.user) {
        checkSubscription();
      } else {
        setSubscription(null);
      }
    });

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

  const signUp = async (email: string, password: string, options?: any) => {
    try {
      const result = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          ...options,
          emailRedirectTo: `${window.location.origin}/signin`,
          data: {
            ...options?.data,
            email_verified: false
          }
        }
      });
      
      if (result.error) {
        console.error("Sign up error:", result.error);
        throw result.error;
      }
      
      if (result.data?.user && !result.data.user.email_confirmed_at) {
        // Only show verification toast when we actually need email verification
        toast({
          title: "Email verification required",
          description: "Please check your email to verify your account before starting your free trial.",
          variant: "default",
        });
        return { data: result.data, requiresVerification: true };
      }
      
      console.log("Sign up successful, user:", result.data.user);
      return result;
    } catch (error: any) {
      console.error("Error signing up:", error.message);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log("Attempting to sign out...");
      
      // Clear all local storage items that control access first
      localStorage.removeItem('forceAgentAccess');
      localStorage.removeItem('trialCompleted');
      localStorage.removeItem('paymentCompleted');
      localStorage.removeItem('accessGrantedAt');
      localStorage.removeItem('aiAgentsLocked');
      
      // Clear any session storage items
      sessionStorage.clear();
      
      // Reset component state
      setUser(null);
      setSession(null);
      setSubscription(null);
      
      // Force a global sign-out to ensure complete logout
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }
      
      console.log("Sign out successful");
      
      // Success toast is now handled in the Navbar component
      
    } catch (error: any) {
      console.error("Error signing out:", error.message);
      // Error toast is now handled in the Navbar component
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

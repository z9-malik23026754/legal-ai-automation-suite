
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

// Define types for our context
export type User = {
  id: string;
  email: string;
};

export type Subscription = {
  markus: boolean;
  kara: boolean;
  connor: boolean;
  allInOne: boolean;
};

type AuthContextType = {
  user: User | null;
  subscription: Subscription | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<void>;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to check if a user is logged in on page load
  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      try {
        // Mock authentication for now - this would use Supabase in production
        const storedUser = localStorage.getItem("legalAIUser");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          await checkSubscription();
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock sign-in logic - would use Supabase in production
      // This is just for demo purposes
      const mockUser = { id: "user1", email };
      setUser(mockUser);
      localStorage.setItem("legalAIUser", JSON.stringify(mockUser));
      
      // Check subscriptions after login
      await checkSubscription();
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error signing in:", error);
      toast({
        title: "Sign in failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock sign-up logic - would use Supabase in production
      const mockUser = { id: "user1", email };
      setUser(mockUser);
      localStorage.setItem("legalAIUser", JSON.stringify(mockUser));
      
      toast({
        title: "Account created",
        description: "Your account has been successfully created.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error signing up:", error);
      toast({
        title: "Sign up failed",
        description: "An error occurred during sign up. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setIsLoading(true);
    try {
      // Mock sign-out logic - would use Supabase in production
      setUser(null);
      setSubscription(null);
      localStorage.removeItem("legalAIUser");
      localStorage.removeItem("legalAISubscription");
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check subscription status
  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      // Mock subscription check - would use Supabase + Stripe in production
      const storedSubscription = localStorage.getItem("legalAISubscription");
      if (storedSubscription) {
        setSubscription(JSON.parse(storedSubscription));
      } else {
        // Default to no subscriptions
        setSubscription({
          markus: false,
          kara: false,
          connor: false,
          allInOne: false
        });
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const value = {
    user,
    subscription,
    isLoading,
    signIn,
    signUp,
    signOut,
    checkSubscription
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Create a custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

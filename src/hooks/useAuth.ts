
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { hasUsedTrialBefore } from "@/utils/trialTimerUtils";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setIsLoading] = useState(true);
  const [hasTrialBeenUsed, setHasTrialBeenUsed] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check trial status whenever component mounts or user changes
  const checkTrialStatus = async () => {
    if (!user) return false;
    
    try {
      // Check if user has used trial using metadata function
      const trialUsed = await hasUsedTrialBefore();
      setHasTrialBeenUsed(trialUsed);
      
      // If trial has been used, ensure the localStorage flag is set for consistency
      if (trialUsed) {
        localStorage.setItem('has_used_trial_ever', 'true');
      }
      
      return trialUsed;
    } catch (error) {
      console.error("Error checking trial status:", error);
      return false;
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check trial status whenever user changes
      if (session?.user) {
        checkTrialStatus();
      }
      
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check trial status whenever user changes
      if (session?.user) {
        checkTrialStatus();
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    user,
    session,
    loading,
    hasTrialBeenUsed,
    signOut,
    checkTrialStatus,
  };
};

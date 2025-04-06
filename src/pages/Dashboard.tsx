
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardView from "@/components/dashboard/DashboardView";
import DashboardLoader from "@/components/dashboard/DashboardLoader";
import UnsubscribedView from "@/components/dashboard/UnsubscribedView";
import AuthGuard from "@/components/dashboard/AuthGuard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardState } from "@/hooks/useDashboardState";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user, subscription, checkSubscription } = useAuth();
  const {
    isRefreshing,
    refreshAttempts,
    isInTrialMode,
    hasActiveSubscription,
    hasMarkusAccess,
    hasKaraAccess,
    hasConnorAccess,
    hasChloeAccess,
    hasLutherAccess,
    hasAnySubscription
  } = useDashboardState();

  const [isInitializing, setIsInitializing] = useState(true);
  const [directDBCheck, setDirectDBCheck] = useState(false);

  // Function to directly check subscription in the database
  const checkDatabaseSubscription = async () => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error("Direct DB subscription check error:", error);
        return null;
      }
      
      console.log("Direct DB subscription check result:", data);
      setDirectDBCheck(true);
      
      // If we found subscription in DB but not in context, refresh context
      if (data && data.status && (!subscription || subscription.status !== data.status)) {
        if (checkSubscription) await checkSubscription();
      }
      
      return data;
    } catch (err) {
      console.error("Exception in direct DB subscription check:", err);
      return null;
    }
  };

  // Ensure subscription is refreshed and agents are loaded before showing dashboard
  useEffect(() => {
    const initializeSubscription = async () => {
      if (user) {
        try {
          // First check through auth context
          if (checkSubscription) {
            await checkSubscription();
          }
          
          // Also do a direct DB check
          await checkDatabaseSubscription();
          
        } catch (error) {
          console.error("Error initializing subscription:", error);
        }
      }
      
      // After all checks, mark initialization as complete
      // Set a minimum initialization time to ensure loading state is shown
      const minDelay = user ? 1500 : 500; // Shorter delay if no user
      setTimeout(() => setIsInitializing(false), minDelay);
    };

    initializeSubscription();
  }, [user, checkSubscription]);

  // Display loading state while refreshing subscription or initializing
  if (isRefreshing || isInitializing) {
    return <DashboardLoader attemptCount={refreshAttempts} />;
  }

  return (
    <AuthGuard user={user}>
      <DashboardLayout
        user={user}
        isInTrialMode={isInTrialMode}
        hasActiveSubscription={hasActiveSubscription}
        hasMarkusAccess={hasMarkusAccess}
        hasKaraAccess={hasKaraAccess}
        hasConnorAccess={hasConnorAccess}
        hasChloeAccess={hasChloeAccess}
        hasLutherAccess={hasLutherAccess}
      >
        {hasAnySubscription ? (
          <DashboardView 
            userName={user.email?.split('@')[0] || 'User'}
            subscription={subscription}
            isInTrialMode={isInTrialMode}
            hasActiveSubscription={hasActiveSubscription}
            hasMarkusAccess={hasMarkusAccess}
            hasKaraAccess={hasKaraAccess}
            hasConnorAccess={hasConnorAccess}
            hasChloeAccess={hasChloeAccess}
            hasLutherAccess={hasLutherAccess}
            hasAnySubscription={hasAnySubscription}
            isRefreshing={isRefreshing}
          />
        ) : (
          <UnsubscribedView 
            userName={user.email?.split('@')[0] || 'User'} 
          />
        )}
      </DashboardLayout>
    </AuthGuard>
  );
};

export default Dashboard;

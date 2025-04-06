
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardView from "@/components/dashboard/DashboardView";
import DashboardLoader from "@/components/dashboard/DashboardLoader";
import UnsubscribedView from "@/components/dashboard/UnsubscribedView";
import AuthGuard from "@/components/dashboard/AuthGuard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardState } from "@/hooks/useDashboardState";
import { fetchDirectSubscription, hasAnyAgentAccess } from "@/utils/subscriptionUtils";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { user, subscription, checkSubscription } = useAuth();
  const { toast } = useToast();
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
  const [forceAccess, setForceAccess] = useState(false);

  // Enhanced initialization logic to prevent users from getting stuck
  useEffect(() => {
    const initializeSubscription = async () => {
      if (user) {
        try {
          // First check through auth context
          if (checkSubscription) {
            await checkSubscription();
          }
          
          // Check if current subscription grants access
          const hasAccess = hasAnyAgentAccess(subscription);
          console.log("Initial subscription check:", { hasAccess, subscription });
          
          if (hasAccess) {
            console.log("User has access based on current subscription");
            setForceAccess(true);
          } else {
            // Try direct DB check
            const directSub = await fetchDirectSubscription(user.id);
            console.log("Direct DB check result:", directSub);
            
            if (directSub && (directSub.status === 'trial' || directSub.status === 'active' || 
                directSub.markus || directSub.kara || directSub.connor || 
                directSub.chloe || directSub.luther || directSub.all_in_one)) {
              console.log("User has access based on direct DB check");
              
              // Force UI refresh
              if (checkSubscription) await checkSubscription();
              setForceAccess(true);
              
              // Show toast notification
              toast({
                title: "Access Confirmed",
                description: "Your subscription is active and you have access to AI agents.",
              });
            } else {
              // Check the URL parameters to see if we're coming from a success page
              const url = new URL(window.location.href);
              const fromSuccess = url.searchParams.get('from') === 'success';
              
              if (fromSuccess) {
                console.log("Forcing access because user comes from success page");
                setForceAccess(true);
                
                toast({
                  title: "Access Granted",
                  description: "You have been granted access to AI agents.",
                });
              }
            }
          }
          
          setDirectDBCheck(true);
        } catch (error) {
          console.error("Error initializing subscription:", error);
          // Even if there's an error in checking, don't block the user from trying
          setDirectDBCheck(true);
        }
      }
      
      // After all checks, mark initialization as complete
      // Set a minimum initialization time to ensure loading state is shown
      const minDelay = user ? 1000 : 500; // Shorter delay if no user
      setTimeout(() => setIsInitializing(false), minDelay);
    };

    initializeSubscription();
  }, [user, checkSubscription, subscription, toast]);

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
        hasMarkusAccess={hasMarkusAccess || forceAccess}
        hasKaraAccess={hasKaraAccess || forceAccess}
        hasConnorAccess={hasConnorAccess || forceAccess}
        hasChloeAccess={hasChloeAccess || forceAccess}
        hasLutherAccess={hasLutherAccess || forceAccess}
      >
        {hasAnySubscription || forceAccess ? (
          <DashboardView 
            userName={user.email?.split('@')[0] || 'User'}
            subscription={subscription}
            isInTrialMode={isInTrialMode}
            hasActiveSubscription={hasActiveSubscription}
            hasMarkusAccess={hasMarkusAccess || forceAccess}
            hasKaraAccess={hasKaraAccess || forceAccess}
            hasConnorAccess={hasConnorAccess || forceAccess}
            hasChloeAccess={hasChloeAccess || forceAccess}
            hasLutherAccess={hasLutherAccess || forceAccess}
            hasAnySubscription={hasAnySubscription || forceAccess}
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

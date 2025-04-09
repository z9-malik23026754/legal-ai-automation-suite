
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { removeForceAgentAccess } from "@/utils/forceAgentAccess";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DangerZone = () => {
  const { toast } = useToast();
  const { session, signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (!session?.access_token) {
      toast({
        title: "Error",
        description: "You need to be logged in to delete your account",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    
    try {
      console.log("Attempting to delete account...");
      
      // Call the delete-account edge function with proper authorization
      const { data, error } = await supabase.functions.invoke('delete-account', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      console.log("Delete account response:", data, error);
      
      if (error) {
        throw new Error(`Error invoking delete-account function: ${error.message}`);
      }
      
      // Check if the data exists and if the deletion was successful
      if (!data || data.success === false) {
        throw new Error((data && data.error) || "Failed to delete account");
      }
      
      // Close the dialog if it's open
      setIsDialogOpen(false);
      
      // Clear ALL localStorage items related to authentication and access
      localStorage.removeItem('forceAgentAccess');
      localStorage.removeItem('trialCompleted');
      localStorage.removeItem('paymentCompleted');
      localStorage.removeItem('accessGrantedAt');
      localStorage.removeItem('has_used_trial_ever');
      
      // Clear ALL sessionStorage items
      sessionStorage.clear();
      
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      });
      
      // Sign out after successful deletion
      if (signOut) {
        await signOut();
      } else {
        // Fallback: direct signOut via Supabase client
        await supabase.auth.signOut({ scope: 'global' });
      }
      
      // Redirect to home page and force a reload for clean state
      navigate("/");
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting account:", error);
      
      toast({
        title: "Error deleting account",
        description: error.message || "There was an error deleting your account. Please try again.",
        variant: "destructive",
      });
      
      // Try a direct approach to Supabase as fallback
      try {
        if (session?.user?.id) {
          const { error: directError } = await supabase.auth.admin.deleteUser(
            session.user.id
          );
          
          if (!directError) {
            // Clear everything and redirect on success
            localStorage.clear();
            sessionStorage.clear();
            await supabase.auth.signOut();
            window.location.href = "/";
          }
        }
      } catch (fallbackError) {
        console.error("Fallback deletion failed:", fallbackError);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="glass-card p-6 border-white/10 rounded-lg shadow-glass">
      <h2 className="text-2xl font-semibold mb-6 text-destructive">Danger Zone</h2>
      
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete Account</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Yes, delete my account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DangerZone;

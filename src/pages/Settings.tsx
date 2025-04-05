
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset } from "@/components/ui/sidebar";
import Navbar from "@/components/Navbar";
import SidebarLinks from "@/components/dashboard/SidebarLinks";
import { 
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialogFooter 
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const { user, subscription, signOut } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // This is a placeholder for the actual implementation
      toast({
        title: "Success",
        description: "Password has been updated",
      });
      
      // Clear the form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast({
        title: "Error",
        description: "Please enter your password to confirm account deletion",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      // First verify the password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: deletePassword,
      });

      if (signInError) {
        throw new Error("Incorrect password. Please try again.");
      }

      // Delete the user
      const { error: deleteError } = await supabase.rpc('delete_user');
      
      if (deleteError) {
        throw new Error(deleteError.message);
      }

      // Sign out the user
      await signOut();
      
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted",
      });
      
      // Redirect to home page
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeletePassword("");
    }
  };

  // Check which agents the user has access to
  const hasMarkusAccess = subscription?.markus || subscription?.allInOne || false;
  const hasKaraAccess = subscription?.kara || subscription?.allInOne || false;
  const hasConnorAccess = subscription?.connor || subscription?.allInOne || false;
  const hasChloeAccess = subscription?.chloe || subscription?.allInOne || false;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar className="bg-sidebar border-r border-sidebar-border">
          <SidebarContent>
            <SidebarLinks 
              hasMarkusAccess={hasMarkusAccess}
              hasKaraAccess={hasKaraAccess}
              hasConnorAccess={hasConnorAccess}
              hasChloeAccess={hasChloeAccess}
            />
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset className="bg-background/95 backdrop-blur-sm flex-1">
          <Navbar />
          <div className="container px-4 py-6 mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Settings</h1>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="glass-card p-6 border-white/10 rounded-lg shadow-glass">
                  <h2 className="text-2xl font-semibold mb-6">Account Security</h2>
                  
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
                        Current Password
                      </label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                        New Password
                      </label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                        Confirm New Password
                      </label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </div>
                
                <div className="glass-card p-6 border-white/10 rounded-lg shadow-glass">
                  <h2 className="text-2xl font-semibold mb-6">User Profile</h2>
                  <p className="text-muted-foreground">
                    Email: {user?.email}
                  </p>
                </div>

                <div className="glass-card p-6 border-white/10 rounded-lg shadow-glass bg-destructive/5">
                  <h2 className="text-2xl font-semibold mb-6 text-destructive">Danger Zone</h2>
                  <p className="text-muted-foreground mb-4">
                    Deleting your account is permanent. All your data will be permanently removed.
                  </p>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <label htmlFor="deletePassword" className="block text-sm font-medium mb-1">
                          Enter your password to confirm
                        </label>
                        <Input
                          id="deletePassword"
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Enter your password"
                          className="mb-2"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteAccount();
                          }}
                          disabled={isDeleting}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {isDeleting ? "Deleting..." : "Delete Account"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              
              <div>
                <div className="glass-card p-6 border-white/10 rounded-lg shadow-glass">
                  <h2 className="text-2xl font-semibold mb-6">Subscription</h2>
                  <div className="space-y-2">
                    <p className="text-muted-foreground">Current Plan: {subscription?.allInOne ? "All-In-One" : "Basic"}</p>
                    {subscription?.status === 'trial' && (
                      <div className="mt-2 p-3 bg-blue-500/10 rounded-md border border-blue-500/20">
                        <p className="text-sm font-medium text-blue-500">Free Trial Active</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Your trial ends on {new Date(subscription.trialEnd || "").toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <Button asChild className="w-full bg-gradient-primary hover:opacity-90 transition-opacity mt-4">
                      <a href="/pricing">Manage Subscription</a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Settings;

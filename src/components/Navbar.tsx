import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useDeveloper } from "@/contexts/DeveloperContext";
import { Briefcase, Menu, X, Terminal, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { removeForceAgentAccess } from "@/utils/forceAgentAccess";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { isDeveloper } = useDeveloper();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isHomePage = location.pathname === "/";
  
  const handleSignOut = async () => {
    try {
      // Clear ALL localStorage items related to authentication and access
      localStorage.removeItem('forceAgentAccess');
      localStorage.removeItem('trialCompleted');
      localStorage.removeItem('paymentCompleted');
      localStorage.removeItem('accessGrantedAt');
      localStorage.removeItem('has_used_trial_ever');
      
      // Clear ALL sessionStorage items
      sessionStorage.clear();
      
      // Close the menu if it's open
      setMenuOpen(false);
      
      // Call the authentication signOut method which handles token removal
      if (signOut) {
        await signOut();
      } else {
        // Fallback: direct signOut via Supabase client if context method unavailable
        await supabase.auth.signOut({ scope: 'global' });
      }
      
      // Only show success toast for successful signout
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      
      // Force navigation to home page
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      
      // Only show error toast if there was actually an error
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
      
      // Attempt a more aggressive fallback approach
      try {
        // Try a direct signOut without options
        await supabase.auth.signOut();
        
        // Clear all storage as a last resort
        localStorage.clear();
        sessionStorage.clear();
        
        // Force redirect and reload
        window.location.href = "/";
      } catch (fallbackError) {
        console.error("Critical sign-out failure:", fallbackError);
      }
    }
  };

  return (
    <header className={`w-full z-50 ${isHomePage ? 'absolute' : ''}`}>
      <div className={`container mx-auto px-4 py-4 flex items-center justify-between ${isHomePage ? 'text-white' : ''}`}>
        <Link to="/" className="flex items-center space-x-2">
          <Briefcase className={`h-6 w-6 ${isHomePage ? 'text-white' : 'text-primary'}`} />
          <span className="font-bold text-xl">MazAI</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/pricing"
            className={`${isHomePage ? 'text-white hover:text-white/80' : 'text-foreground hover:text-foreground/80'} transition-colors`}
          >
            Pricing
          </Link>
          <Link
            to="/about"
            className={`${isHomePage ? 'text-white hover:text-white/80' : 'text-foreground hover:text-foreground/80'} transition-colors`}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={`${isHomePage ? 'text-white hover:text-white/80' : 'text-foreground hover:text-foreground/80'} transition-colors`}
          >
            Contact
          </Link>
          {isDeveloper && (
            <Link
              to="/developer"
              className={`${isHomePage ? 'text-white hover:text-white/80' : 'text-foreground hover:text-foreground/80'} transition-colors flex items-center`}
            >
              <Terminal className="mr-1 h-4 w-4" />
              Developer
            </Link>
          )}
        </nav>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant={isHomePage ? "outline" : "default"} 
                  className={`font-semibold ${isHomePage ? 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30' : 'bg-primary/90 text-white hover:bg-primary'} flex items-center gap-2`}
                >
                  <User className="h-4 w-4" />
                  <span>Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                {isDeveloper && (
                  <DropdownMenuItem asChild>
                    <Link to="/developer">Developer Tools</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="ghost" className={isHomePage ? "text-white hover:text-white/80 hover:bg-white/10" : ""}>
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant={isHomePage ? "outline" : "default"}>Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <X className={`h-6 w-6 ${isHomePage ? 'text-white' : ''}`} />
          ) : (
            <Menu className={`h-6 w-6 ${isHomePage ? 'text-white' : ''}`} />
          )}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-background z-40 py-20 px-6 md:hidden animate-fade-in">
          <nav className="flex flex-col space-y-6">
            <Link
              to="/pricing"
              className="text-lg font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              to="/about"
              className="text-lg font-medium"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-lg font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </Link>
            
            {isDeveloper && (
              <Link
                to="/developer"
                className="text-lg font-medium flex items-center"
                onClick={() => setMenuOpen(false)}
              >
                <Terminal className="mr-2 h-5 w-5" />
                Developer Tools
              </Link>
            )}
            
            <div className="h-px bg-border my-4" />
            
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-lg font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/settings"
                  className="text-lg font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Settings
                </Link>
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2"
                >
                  <LogOut className="h-5 w-5" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  onClick={() => setMenuOpen(false)}
                >
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                >
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;

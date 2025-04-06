
import React from "react";
import { PieChart } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarInset } from "@/components/ui/sidebar";
import Navbar from "@/components/Navbar";
import SidebarLinks from "@/components/dashboard/SidebarLinks";

interface DashboardLayoutProps {
  user: any;
  isInTrialMode: boolean;
  hasActiveSubscription: boolean;
  hasMarkusAccess: boolean;
  hasKaraAccess: boolean;
  hasConnorAccess: boolean;
  hasChloeAccess: boolean;
  hasLutherAccess: boolean;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  isInTrialMode,
  hasActiveSubscription,
  hasMarkusAccess,
  hasKaraAccess,
  hasConnorAccess,
  hasChloeAccess,
  hasLutherAccess,
  children
}) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar className="bg-sidebar border-r border-sidebar-border">
          <SidebarHeader className="p-4">
            <div className="flex items-center">
              <div className="rounded-md bg-gradient-to-br from-blue-500 to-purple-500 p-1.5 mr-2">
                <PieChart className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">MazAI</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarLinks 
              hasMarkusAccess={hasMarkusAccess}
              hasKaraAccess={hasKaraAccess}
              hasConnorAccess={hasConnorAccess}
              hasChloeAccess={hasChloeAccess}
              hasLutherAccess={hasLutherAccess}
            />
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-sidebar-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {user.email ? user.email.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="text-xs">
                <p className="font-medium truncate">{user.email}</p>
                <p className="text-muted-foreground truncate">
                  {isInTrialMode ? 'Trial Plan' : (hasActiveSubscription ? 'Paid Plan' : 'Free Plan')}
                </p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="bg-background/95 backdrop-blur-sm flex-1">
          <Navbar />
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;

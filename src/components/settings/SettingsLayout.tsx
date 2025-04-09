
import React from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset } from "@/components/ui/sidebar";
import Navbar from "@/components/Navbar";
import SidebarLinks from "@/components/dashboard/SidebarLinks";
import { useAuth } from "@/contexts/AuthContext";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const SettingsLayout = ({ children }: SettingsLayoutProps) => {
  const { subscription } = useAuth();

  const hasMarkusAccess = subscription?.markus || subscription?.allInOne || false;
  const hasKaraAccess = subscription?.kara || subscription?.allInOne || false;
  const hasJerryAccess = subscription?.jerry || subscription?.allInOne || false;
  const hasConnorAccess = subscription?.allInOne || false;
  const hasChloeAccess = subscription?.chloe || subscription?.allInOne || false;
  const hasLutherAccess = subscription?.luther || subscription?.allInOne || false;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar className="bg-sidebar border-r border-sidebar-border">
          <SidebarContent>
            <SidebarLinks 
              hasMarkusAccess={hasMarkusAccess}
              hasKaraAccess={hasKaraAccess}
              hasJerryAccess={hasJerryAccess}
              hasConnorAccess={hasConnorAccess}
              hasChloeAccess={hasChloeAccess}
              hasLutherAccess={hasLutherAccess}
            />
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset className="bg-background/95 backdrop-blur-sm flex-1">
          <Navbar />
          <div className="container px-4 py-6 mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Settings</h1>
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SettingsLayout;

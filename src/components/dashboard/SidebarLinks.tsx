
import React from "react";
import { Link } from "react-router-dom";
import { PieChart, Calendar, Bell, Settings, FileText, MessageSquare, Phone, Mail, ClipboardList, BarChart3 } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface SidebarLinksProps {
  hasMarkusAccess: boolean;
  hasKaraAccess: boolean;
  hasConnorAccess: boolean;
  hasChloeAccess?: boolean;
  hasLutherAccess?: boolean;
}

const SidebarLinks: React.FC<SidebarLinksProps> = ({
  hasMarkusAccess,
  hasKaraAccess,
  hasConnorAccess,
  hasChloeAccess = false,
  hasLutherAccess = false
}) => {
  // Log access status for each agent to help debug
  console.log("SidebarLinks - Agent access:", {
    hasMarkusAccess,
    hasKaraAccess,
    hasConnorAccess,
    hasChloeAccess,
    hasLutherAccess
  });
  
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">Overview</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Dashboard" className="transition-all duration-200 hover:bg-sidebar-accent">
              <Link to="/dashboard" className="bg-sidebar-accent text-sidebar-accent-foreground">
                <div className="glass-card inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                  <PieChart className="h-3 w-3" />
                </div>
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Calendar">
              <Link to="/calendar">
                <div className="bg-sidebar-accent/30 inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                  <Calendar className="h-3 w-3" />
                </div>
                <span>Calendar</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Notifications">
              <Link to="/notifications">
                <div className="bg-sidebar-accent/30 inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                  <Bell className="h-3 w-3" />
                </div>
                <span>Notifications</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">AI Agents</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Markus" disabled={!hasMarkusAccess}>
              <Link to="/agents/markus">
                <div className="agent-label-markus inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                  <MessageSquare className="h-3 w-3 text-markus" />
                </div>
                <span>{!hasMarkusAccess && "🔒 "}Markus</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Kara" disabled={!hasKaraAccess}>
              <Link to="/agents/kara">
                <div className="agent-label-kara inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                  <Phone className="h-3 w-3 text-kara" />
                </div>
                <span>{!hasKaraAccess && "🔒 "}Kara</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Connor" disabled={!hasConnorAccess}>
              <Link to="/agents/connor">
                <div className="agent-label-connor inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                  <Mail className="h-3 w-3 text-connor" />
                </div>
                <span>{!hasConnorAccess && "🔒 "}Connor</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Chloe" disabled={!hasChloeAccess}>
              <Link to="/agents/chloe">
                <div className="agent-label-chloe inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                  <ClipboardList className="h-3 w-3 text-chloe" />
                </div>
                <span>{!hasChloeAccess && "🔒 "}Chloe</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Luther" disabled={!hasLutherAccess}>
              <Link to="/agents/luther">
                <div className="agent-label-luther inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                  <BarChart3 className="h-3 w-3 text-luther" />
                </div>
                <span>{!hasLutherAccess && "🔒 "}Luther</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">Settings</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link to="/settings">
                <div className="bg-sidebar-accent/30 inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                  <Settings className="h-3 w-3" />
                </div>
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Billing">
              <Link to="/settings/billing">
                <div className="bg-sidebar-accent/30 inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                  <FileText className="h-3 w-3" />
                </div>
                <span>Billing & Plans</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
};

export default SidebarLinks;

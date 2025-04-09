
import React from "react";
import { Link } from "react-router-dom";
import { PieChart, Calendar, Bell, Settings, FileText, MessageSquare, Phone, Mail, ClipboardList, BarChart3, Lock } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { hasCompletedTrialOrPayment } from "@/utils/forceAgentAccess";

interface SidebarLinksProps {
  hasMarkusAccess: boolean;
  hasKaraAccess: boolean;
  hasJerryAccess: boolean;
  hasChloeAccess?: boolean;
  hasLutherAccess?: boolean;
  hasConnorAccess?: boolean;
}

const SidebarLinks: React.FC<SidebarLinksProps> = ({
  hasMarkusAccess,
  hasKaraAccess,
  hasJerryAccess,
  hasChloeAccess = false,
  hasLutherAccess = false,
  hasConnorAccess = false
}) => {
  // Check if trial or payment completed
  const completedTrialOrPayment = hasCompletedTrialOrPayment();
  
  // Calculate final access state
  const finalMarkusAccess = hasMarkusAccess || completedTrialOrPayment;
  const finalKaraAccess = hasKaraAccess || completedTrialOrPayment;
  const finalJerryAccess = hasJerryAccess || completedTrialOrPayment;
  const finalChloeAccess = hasChloeAccess || completedTrialOrPayment;
  const finalLutherAccess = hasLutherAccess || completedTrialOrPayment;
  const finalConnorAccess = hasConnorAccess || completedTrialOrPayment;
  
  // Log access status for each agent to help debug
  console.log("SidebarLinks - Agent access:", {
    hasMarkusAccess,
    hasKaraAccess,
    hasJerryAccess,
    hasChloeAccess,
    hasLutherAccess,
    hasConnorAccess,
    completedTrialOrPayment,
    finalAccess: {
      markus: finalMarkusAccess,
      kara: finalKaraAccess,
      jerry: finalJerryAccess,
      chloe: finalChloeAccess,
      luther: finalLutherAccess,
      connor: finalConnorAccess
    }
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
            <SidebarMenuButton asChild tooltip="Markus" disabled={!finalMarkusAccess}>
              <Link to={finalMarkusAccess ? "/agents/markus" : "/pricing"}>
                <div className="agent-label-markus inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                  <MessageSquare className="h-3 w-3 text-markus" />
                </div>
                <span>{!finalMarkusAccess && "🔒 "}Markus</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Kara" disabled={!finalKaraAccess}>
              <Link to={finalKaraAccess ? "/agents/kara" : "/pricing"}>
                <div className="agent-label-kara inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                  <Phone className="h-3 w-3 text-kara" />
                </div>
                <span>{!finalKaraAccess && "🔒 "}Kara</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Jerry" disabled={!finalJerryAccess}>
              <Link to={finalJerryAccess ? "/agents/jerry" : "/pricing"}>
                <div className="agent-label-jerry inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                  <Mail className="h-3 w-3 text-jerry" />
                </div>
                <span>{!finalJerryAccess && "🔒 "}Jerry</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Chloe" disabled={!finalChloeAccess}>
              <Link to={finalChloeAccess ? "/agents/chloe" : "/pricing"}>
                <div className="agent-label-chloe inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                  <ClipboardList className="h-3 w-3 text-chloe" />
                </div>
                <span>{!finalChloeAccess && "🔒 "}Chloe</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Luther" disabled={!finalLutherAccess}>
              <Link to={finalLutherAccess ? "/agents/luther" : "/pricing"}>
                <div className="agent-label-luther inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                  <BarChart3 className="h-3 w-3 text-luther" />
                </div>
                <span>{!finalLutherAccess && "🔒 "}Luther</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Connor" disabled={!finalConnorAccess}>
              <Link to={finalConnorAccess ? "/agents/connor" : "/pricing"}>
                <div className="agent-label-connor inline-flex items-center justify-center w-6 h-6 rounded-full mr-2">
                  <MessageSquare className="h-3 w-3 text-connor" />
                </div>
                <span>{!finalConnorAccess && "🔒 "}Connor (All-in-One)</span>
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

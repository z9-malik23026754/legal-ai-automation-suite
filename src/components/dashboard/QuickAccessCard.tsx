
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Mail, ClipboardList } from "lucide-react";

interface QuickAccessCardProps {
  hasMarkusAccess: boolean;
  hasKaraAccess: boolean;
  hasConnorAccess: boolean;
  hasChloeAccess?: boolean;
}

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({ 
  hasMarkusAccess,
  hasKaraAccess,
  hasConnorAccess,
  hasChloeAccess = false
}) => {
  return (
    <div className="glass-card border-white/10 rounded-lg shadow-glass overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg"></div>
      <div className="divide-y divide-white/10 relative z-10">
        {hasMarkusAccess && (
          <div className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
            <div>
              <h3 className="font-medium bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">Chatbot Setup</h3>
              <p className="text-sm text-muted-foreground">Configure your client intake chatbot</p>
            </div>
            <Link to="/settings/markus">
              <Button variant="ghost" className="hover:bg-blue-500/10 hover:text-blue-600">Configure</Button>
            </Link>
          </div>
        )}
        
        {hasKaraAccess && (
          <div className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
            <div>
              <h3 className="font-medium bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent">Customer Support Settings</h3>
              <p className="text-sm text-muted-foreground">Manage phone numbers and SMS templates</p>
            </div>
            <Link to="/settings/kara">
              <Button variant="ghost" className="hover:bg-purple-500/10 hover:text-purple-600">Configure</Button>
            </Link>
          </div>
        )}
        
        {hasConnorAccess && (
          <div className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
            <div>
              <h3 className="font-medium bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">Email Campaigns</h3>
              <p className="text-sm text-muted-foreground">Create and schedule marketing emails</p>
            </div>
            <Link to="/settings/connor">
              <Button variant="ghost" className="hover:bg-green-500/10 hover:text-green-600">Configure</Button>
            </Link>
          </div>
        )}
        
        {hasChloeAccess && (
          <div className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
            <div>
              <h3 className="font-medium bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">Admin Tools</h3>
              <p className="text-sm text-muted-foreground">Manage administrative tasks and reporting</p>
            </div>
            <Link to="/settings/chloe">
              <Button variant="ghost" className="hover:bg-amber-500/10 hover:text-amber-600">Configure</Button>
            </Link>
          </div>
        )}
        
        <div className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
          <div>
            <h3 className="font-medium">Billing & Subscription</h3>
            <p className="text-sm text-muted-foreground">Manage your subscription plan</p>
          </div>
          <Link to="/settings/billing">
            <Button variant="ghost">Manage</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuickAccessCard;

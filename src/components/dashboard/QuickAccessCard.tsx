
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { MessageSquare, Phone, Mail, ClipboardList, BarChart3, LockIcon } from "lucide-react";

interface QuickAccessCardProps {
  hasMarkusAccess: boolean;
  hasKaraAccess: boolean;
  hasJerryAccess: boolean;
  hasConnorAccess: boolean;
  hasChloeAccess: boolean;
  hasLutherAccess: boolean;
}

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({
  hasMarkusAccess,
  hasKaraAccess,
  hasJerryAccess,
  hasConnorAccess,
  hasChloeAccess,
  hasLutherAccess
}) => {
  return (
    <Card className="glass-card border-white/10 shadow-glass">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <AgentQuickLink 
            name="Markus" 
            icon={<MessageSquare className="h-5 w-5 text-markus" />}
            color="markus"
            hasAccess={hasMarkusAccess}
          />
          <AgentQuickLink 
            name="Kara" 
            icon={<Phone className="h-5 w-5 text-kara" />}
            color="kara"
            hasAccess={hasKaraAccess}
          />
          <AgentQuickLink 
            name="Jerry" 
            icon={<Mail className="h-5 w-5 text-jerry" />}
            color="jerry"
            hasAccess={hasJerryAccess}
          />
          <AgentQuickLink 
            name="Chloe" 
            icon={<ClipboardList className="h-5 w-5 text-chloe" />}
            color="chloe"
            hasAccess={hasChloeAccess}
          />
          <AgentQuickLink 
            name="Luther" 
            icon={<BarChart3 className="h-5 w-5 text-luther" />}
            color="luther"
            hasAccess={hasLutherAccess}
          />
          <AgentQuickLink 
            name="Connor" 
            icon={<MessageSquare className="h-5 w-5 text-connor" />}
            color="connor"
            hasAccess={hasConnorAccess}
          />
        </div>
      </CardContent>
    </Card>
  );
};

interface AgentQuickLinkProps {
  name: string;
  icon: React.ReactNode;
  color: string;
  hasAccess: boolean;
}

const AgentQuickLink: React.FC<AgentQuickLinkProps> = ({ name, icon, color, hasAccess }) => {
  const linkTo = hasAccess ? `/agents/${name.toLowerCase()}` : "/pricing";
  
  return (
    <Link to={linkTo} className="relative">
      <div className={`p-4 rounded-lg border border-${color}-500/20 transition-all hover:border-${color}-500/40 hover:bg-${color}-500/5 ${hasAccess ? '' : 'opacity-50'}`}>
        <div className="mb-2 flex justify-center">
          <div className={`rounded-full p-3 bg-${color}-500/10`}>
            {icon}
            {!hasAccess && (
              <div className="absolute top-1 right-1 bg-background rounded-full p-1">
                <LockIcon className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-sm font-medium">{name}</p>
      </div>
    </Link>
  );
};

export default QuickAccessCard;

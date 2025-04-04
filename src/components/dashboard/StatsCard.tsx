
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change }) => {
  return (
    <Card className="glass-card border-white/10 overflow-hidden shadow-glass">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg"></div>
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs mt-1 ${change.startsWith('+') ? 'text-green-500' : change === '0%' ? 'text-muted-foreground' : 'text-red-500'}`}>
          {change} from last month
        </p>
      </CardContent>
    </Card>
  );
};

export default StatsCard;

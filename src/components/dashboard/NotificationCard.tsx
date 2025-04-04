
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface NotificationProps {
  title: string;
  time: string;
  agent: string;
}

interface NotificationCardProps {
  notifications: NotificationProps[];
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notifications }) => {
  return (
    <Card className="glass-card border-white/10 shadow-glass overflow-hidden">
      <CardHeader className="relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -mr-10 -mt-10 blur-3xl"></div>
        <CardTitle className="text-lg relative z-10">Notifications</CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative z-10">
        <div className="divide-y divide-border/30">
          {notifications.map((notification, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 px-6 hover:bg-white/5 transition-colors">
              <div>
                <p className="font-medium">{notification.title}</p>
                <p className="text-xs text-muted-foreground">
                  Via <span className={`text-${notification.agent.toLowerCase()}`}>{notification.agent}</span> • {notification.time}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-center pt-2 pb-4 relative z-10">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          View All Notifications
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationCard;

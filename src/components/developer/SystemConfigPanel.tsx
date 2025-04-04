
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SystemConfigPanel = () => {
  const [debugMode, setDebugMode] = useState(localStorage.getItem("debug_mode") === "true");
  const [logLevel, setLogLevel] = useState(localStorage.getItem("log_level") || "info");
  const [maxUsers, setMaxUsers] = useState(localStorage.getItem("max_users") || "1000");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveConfig = () => {
    setIsLoading(true);
    
    try {
      // Save settings to localStorage (in a real app, this would be saved to a database)
      localStorage.setItem("debug_mode", debugMode.toString());
      localStorage.setItem("log_level", logLevel);
      localStorage.setItem("max_users", maxUsers);
      
      toast({
        title: "Success",
        description: "System configuration saved successfully",
      });
    } catch (error) {
      console.error("Error saving system config:", error);
      toast({
        title: "Error",
        description: "Failed to save system configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="debug-mode">Debug Mode</Label>
            <p className="text-sm text-muted-foreground">
              Enable verbose logging and developer features
            </p>
          </div>
          <Switch
            id="debug-mode"
            checked={debugMode}
            onCheckedChange={setDebugMode}
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="log-level">Log Level</Label>
          <Select value={logLevel} onValueChange={setLogLevel}>
            <SelectTrigger id="log-level">
              <SelectValue placeholder="Select log level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="debug">Debug</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warn">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Set the minimum log level for system logs
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="max-users">Maximum Users</Label>
          <Input
            id="max-users"
            type="number"
            value={maxUsers}
            onChange={(e) => setMaxUsers(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Set the maximum number of users allowed in the system
          </p>
        </div>
      </div>

      <Button 
        onClick={handleSaveConfig} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Saving..." : "Save System Configuration"}
      </Button>
    </div>
  );
};

export default SystemConfigPanel;

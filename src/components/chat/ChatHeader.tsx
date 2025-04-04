
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ChatHeaderProps {
  agentName: string;
  agentColor: string;
  webhookUrls: string[];
  webhookUrl: string;
  onWebhookChange: (url: string) => void;
  isDeveloper: boolean;
  isConfigOpen: boolean;
  setIsConfigOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  agentName,
  agentColor,
  webhookUrls,
  webhookUrl,
  onWebhookChange,
  isDeveloper,
  isConfigOpen,
  setIsConfigOpen
}) => {
  return (
    <div className="bg-white border-b p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`agent-label-${agentColor} p-2 rounded-lg flex items-center justify-center w-10 h-10`}>
            {agentName === 'Markus' && <span className={`text-${agentColor} text-xl font-bold`}>M</span>}
            {agentName === 'Kara' && <span className={`text-${agentColor} text-xl font-bold`}>K</span>}
            {agentName === 'Connor' && <span className={`text-${agentColor} text-xl font-bold`}>C</span>}
          </div>
          <div>
            <h2 className="font-semibold text-lg">{agentName}</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full bg-${agentColor} inline-block`}></span>
              {webhookUrls.length > 0 
                ? `${webhookUrls.length} webhook${webhookUrls.length > 1 ? 's' : ''} active` 
                : "Not configured"}
            </p>
          </div>
        </div>
        
        {isDeveloper && (
          <Collapsible 
            open={isConfigOpen} 
            onOpenChange={setIsConfigOpen}
            className="max-w-[400px]"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2">
                <Settings className="h-4 w-4" />
                <span className="ml-2 text-xs">Developer Config</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 p-2 border rounded-lg bg-secondary/30">
              <p className="mb-1 text-xs font-medium">Webhooks: {webhookUrls.length}</p>
              <Input
                type="text"
                placeholder="Enter webhook URL (for testing only)"
                value={webhookUrl}
                onChange={(e) => onWebhookChange(e.target.value)}
                className="text-xs chatfuel-input"
              />
              <div className="text-xs text-muted-foreground mt-1 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                <span>Configure multiple webhooks in Developer Tools</span>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;


import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatFooterProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  agentName: string;
  agentColor: string;
}

const ChatFooter: React.FC<ChatFooterProps> = ({
  onSendMessage,
  isLoading,
  agentName,
  agentColor
}) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="p-4 border-t bg-white">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          type="text"
          placeholder={`Message ${agentName}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="chatfuel-input focus:border-[#E5E7EB]"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || !input.trim()}
          className={`bg-${agentColor} hover:bg-${agentColor}/90`}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatFooter;

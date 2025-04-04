
import React from "react";

interface MessageProps {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  agentColor?: string;
}

const MessageBubble: React.FC<MessageProps> = ({
  content,
  sender,
  timestamp,
  agentColor
}) => {
  return (
    <div
      className={`flex animate-slide-in ${sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          sender === 'user'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : `bg-white border border-[#E5E7EB] shadow-sm`
        }`}
      >
        <p className={sender === 'agent' && agentColor ? `text-${agentColor}` : ''}>{content}</p>
        <p className="text-xs opacity-70 mt-1">
          {timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;

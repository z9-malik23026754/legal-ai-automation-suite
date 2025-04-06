
import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type ActionButtonProps = {
  onClick?: () => void;
  href?: string;
  children: ReactNode;
  variant?: "default" | "outline";
  className?: string;
  asLink?: boolean;
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  href,
  children,
  variant = "default",
  className = "",
  asLink = false,
}) => {
  // For navigation actions that should use window.location
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      window.location.href = href;
    }
  };

  // If it's meant to be a link but not using React Router
  if (href && !asLink) {
    return (
      <Button 
        className={className}
        variant={variant}
        onClick={handleClick}
      >
        {children}
      </Button>
    );
  }

  // For React Router links
  if (asLink) {
    return (
      <Button 
        asChild 
        variant={variant} 
        className={className}
      >
        {children}
      </Button>
    );
  }

  // Normal button with onClick
  return (
    <Button 
      className={className}
      variant={variant}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

"use client";

import { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function StripeConnectButton({ children, onClick, ...props }: ButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsConnecting(true);
    if (onClick) {
      onClick(e);
    }
    window.location.href = "/api/stripe/connect";
  };

  return (
    <Button onClick={handleClick} disabled={isConnecting || props.disabled} {...props}>
      {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children || "Connect Stripe Account"}
    </Button>
  );
}

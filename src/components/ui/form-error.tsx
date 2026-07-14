import { cn } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";

interface FormErrorProps {
  message?: string | null;
  children?: React.ReactNode;
  className?: string;
}

export function FormError({ message, children, className }: FormErrorProps) {
  const content = message || children;

  if (!content) return null;

  return (
    <p
      className={cn(
        "text-xs text-destructive bg-destructive/5 p-2 rounded border border-destructive animate-in fade-in duration-200 flex items-center gap-2",
        className,
      )}
    >
      <ShieldAlert />
      {content}
    </p>
  );
}

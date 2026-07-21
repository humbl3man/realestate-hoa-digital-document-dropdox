import Image from "next/image";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

interface LogoProps extends Omit<ComponentProps<typeof Image>, "src" | "alt"> {
  width?: number;
  height?: number;
  className?: string;
  imageClassName?: string;
}

export function Logo({ width = 32, height = 32, className, imageClassName, ...props }: LogoProps) {
  return (
    <div className={cn("bg-primary text-foreground p-2.5 rounded-xl border border-primary/20 inline-flex items-center justify-center shrink-0", className)}>
      <Image
        src="/logo.png"
        alt="Logo"
        width={width}
        height={height}
        className={cn("object-contain", imageClassName)}
        {...props}
      />
    </div>
  );
}

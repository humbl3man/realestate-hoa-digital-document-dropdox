"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <button className="relative inline-flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground text-foreground">
        <Sun size="15" />
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative inline-flex items-center justify-center bg-primary/10 rounded-md p-2 hover:bg-accent hover:text-accent-foreground text-foreground transition-colors"
      title="Toggle theme"
    >
      {theme === "dark" ? <Moon size="15" /> : <Sun size="15" />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

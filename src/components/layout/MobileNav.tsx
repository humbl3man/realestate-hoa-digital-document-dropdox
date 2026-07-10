"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, FileText, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { appConfig } from "@/config";
import { navigation } from "./Sidebar";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();


  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle navigation menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-[250px] p-0 flex flex-col bg-sidebar text-sidebar-foreground border-sidebar-border border-r">
        <div className="p-6 flex items-center justify-between border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <FileText size={20} />
            </div>
            <span className="font-heading font-semibold text-lg tracking-tight">
              {appConfig.name || "Untitled"}
            </span>
          </div>
          <ThemeToggle />
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground"
                )}
                onClick={() => setOpen(false)}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-sidebar-accent hover:text-destructive text-muted-foreground transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

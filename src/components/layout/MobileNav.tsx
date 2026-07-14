"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, FileText, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/config";
import { navigation } from "./Sidebar";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const initial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="md:hidden" />}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle navigation menu</span>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[250px] p-0 flex flex-col bg-sidebar text-sidebar-foreground border-sidebar-border border-r"
      >
        <div className="p-6 flex items-center justify-between border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <FileText size={20} />
            </div>
            <span className="font-heading font-semibold text-lg tracking-tight">
              {appConfig.name || "Untitled"}
            </span>
          </div>
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
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground",
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
          {user && (
            <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-md bg-sidebar-primary/5 border border-sidebar-border/50">
              <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                {initial}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.name || "User"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user.email}
                </span>
              </div>
            </div>
          )}
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

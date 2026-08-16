"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { appConfig } from "@/config";
import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";

export const navigation = [
  { name: "Portals", href: "/dashboard", icon: LayoutDashboard },
  // { name: "Sales", href: "/dashboard/sales", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const user = session?.user;
  const initial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <aside 
      className={cn(
        "hidden md:flex h-screen sticky top-0 flex-col transition-all duration-300 ease-in-out shrink-0 relative z-20",
        isCollapsed ? "w-[80px]" : "w-[250px]"
      )}
    >
      <div className="flex-1 flex flex-col h-full bg-secondary/1 border-r border-secondary/10 overflow-y-auto text-sidebar-foreground">
        <div className={cn("p-6 flex items-center h-[88px]", isCollapsed ? "justify-center" : "justify-between")}>
          {!isCollapsed ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <Logo width={32} height={32} className="shrink-0" />
              <span className="font-heading font-semibold text-lg truncate">
                {appConfig.name || "TetherDocs"}
              </span>
            </div>
          ) : (
            <Logo width={32} height={32} className="shrink-0" title={appConfig.name || "TetherDocs"} />
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md transition-colors text-sm font-medium",
                  isActive
                    ? "bg-secondary/8 text-secondary font-semibold"
                    : "hover:bg-secondary/8 hover:text-foreground text-muted-foreground",
                  isCollapsed ? "justify-center gap-0" : "gap-3"
                )}
              >
                <item.icon size={18} className="shrink-0" />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-secondary/15">
          {user && (
            <div className={cn(
              "flex items-center mb-2 bg-secondary/5 border border-secondary/15 rounded-md",
              isCollapsed ? "p-2 justify-center" : "gap-3 p-3"
            )}>
              <div 
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-foreground font-semibold text-sm select-none"
                title={isCollapsed ? user.name || user.email : undefined}
              >
                {initial}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium text-sidebar-foreground truncate">
                    {user.name || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </span>
                </div>
              )}
            </div>
          )}
          <form action="/api/logout" method="POST">
            <Button 
              type="submit" 
              variant="ghost" 
              className={cn("w-full", isCollapsed ? "px-0 justify-center" : "")}
              title={isCollapsed ? "Sign Out" : undefined}
            >
              <LogOut size={18} className={isCollapsed ? "" : "mr-2"} />
              {!isCollapsed && "Sign Out"}
            </Button>
          </form>
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 rounded-full text-secondary/50 w-8 h-8 flex items-center justify-center bg-background border-secondary/10 hover:bg-background hover:text-secondary/70 hover:border-secondary/20"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </Button>
    </aside>
  );
}

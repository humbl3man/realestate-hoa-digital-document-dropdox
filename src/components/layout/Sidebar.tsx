"use client";

import { Link } from "next-view-transitions";
import { Logo } from "@/components/ui/logo";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Settings,
  CreditCard,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { appConfig } from "@/config";
import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";

export const navigation = [
  { name: "Portals", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sales", href: "/dashboard/sales", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const initial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <aside className="hidden md:flex w-[250px] border-r border-secondary/10 bg-secondary/1 h-full flex-col fixed left-0 top-0 text-sidebar-foreground">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo width={32} height={32} />
          <span className="font-heading font-semibold text-lg tracking-tight">
            {appConfig.name || "Untitled Digital Dropbox"}
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
                  ? "bg-secondary/8 text-secondary font-semibold"
                  : "hover:bg-secondary/8 hover:text-foreground text-muted-foreground",
              )}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-secondary/15">
        {user && (
          <div className="flex items-center gap-3 p-3 mb-2 bg-secondary/5 border border-secondary/15 rounded-md">
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-foreground font-bold text-sm select-none">
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
          <Button type="submit" variant="ghost" className="w-full">
            <LogOut size={18} />
            Sign Out
          </Button>
        </form>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
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

export const navigation = [
  { name: "Portals", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sales", href: "/dashboard/sales", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-[250px] border-r border-sidebar-border bg-sidebar h-full flex-col fixed left-0 top-0 text-sidebar-foreground">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <FileText size={20} />
          </div>
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
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-primary/10 hover:text-sidebar-accent-foreground text-muted-foreground",
              )}
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
    </aside>
  );
}

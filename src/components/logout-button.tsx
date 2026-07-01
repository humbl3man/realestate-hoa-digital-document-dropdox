"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.refresh();
    router.push("/");
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className="text-slate-400 hover:text-white hover:bg-slate-800"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  );
}

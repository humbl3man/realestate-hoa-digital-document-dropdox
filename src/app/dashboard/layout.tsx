import { Logo } from "@/components/ui/logo";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { appConfig } from "@/config";
import { ClientSessionCheck } from "@/components/client-session-check";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex w-full">
      <ClientSessionCheck />
      <Sidebar />
      <main className="flex-1 md:ml-[250px] flex flex-col min-h-[100dvh] relative w-full">
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background z-10">
          <MobileNav />
          <div className="flex items-center gap-2">
            <Logo width={28} height={28} />
            <span className="font-heading font-semibold text-lg truncate max-w-[200px]">
              {appConfig.name || "Untitled"}
            </span>
          </div>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
        <div className="flex-1 p-6 md:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

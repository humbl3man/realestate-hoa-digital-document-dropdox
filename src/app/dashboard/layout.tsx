import { Sidebar } from "@/components/layout/Sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex w-full">
      <Sidebar />
      <main className="flex-1 ml-[250px] p-6 md:p-8 overflow-y-auto h-screen relative">
        <div className="absolute top-4 right-6 md:right-8">
          <ThemeToggle />
        </div>
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

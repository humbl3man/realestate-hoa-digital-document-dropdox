import { auth } from "@/lib/auth";
import { db } from "@/db";
import { portals, documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { PortalManager } from "./portal-manager";
import { FolderKanban } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PortalDetailPage({ params }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const { id } = await params;

  // Fetch portal
  const [portal] = await db
    .select()
    .from(portals)
    .where(eq(portals.id, id))
    .limit(1);

  if (!portal) {
    notFound();
  }

  // Verify ownership
  if (portal.userId !== session.user.id) {
    redirect("/dashboard");
  }

  // Fetch associated documents
  const docs = await db
    .select()
    .from(documents)
    .where(eq(documents.portalId, id));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
              <FolderKanban className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">HOA Document Dropdox</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:inline">
              Logged in as <span className="text-slate-200">{session.user.email}</span>
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PortalManager portal={portal} documents={docs} />
      </main>
    </div>
  );
}

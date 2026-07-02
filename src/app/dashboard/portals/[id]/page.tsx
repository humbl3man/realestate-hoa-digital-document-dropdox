import { auth } from "@/lib/auth";
import { db } from "@/db";
import { portals, documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { PortalManager } from "./portal-manager";

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
    <div className="py-2">
      <PortalManager portal={portal} documents={docs} />
    </div>
  );
}

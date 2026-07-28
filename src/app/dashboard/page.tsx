import { auth } from "@/lib/auth";
import { db } from "@/db";
import { portals, documents, user } from "@/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import Link from "next/link";
import { CreatePortalDialog } from "./create-portal-dialog";
import { deletePortal } from "./actions";
import { PortalList } from "./portal-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { ExternalLink, FolderKanban, Trash2, Unplug, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

import { StripeConnectButton } from "@/components/stripe-connect-button";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string }>;
}) {
  const { limit: limitParam } = await searchParams;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const limit = limitParam ? parseInt(limitParam, 10) : 10;
  const userPortalsResult = await db
    .select()
    .from(portals)
    .where(eq(portals.userId, session.user.id))
    .orderBy(desc(portals.createdAt))
    .limit(limit + 1);

  const hasMore = userPortalsResult.length > limit;
  const userPortals = userPortalsResult.slice(0, limit);

  // Check if user has FULLY connected their Stripe account (details submitted)
  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  let stripeConnected = false;
  if (dbUser?.stripeAccountId) {
    try {
      const account = await stripe.accounts.retrieve(dbUser.stripeAccountId);
      stripeConnected = account.details_submitted;
    } catch {
      // Ignored
    }
  }

  // Get file counts for each portal
  const docCounts: Record<string, number> = {};
  if (userPortals.length > 0) {
    const portalIds = userPortals.map((p) => p.id);
    const docs = await db
      .select({ id: documents.id, portalId: documents.portalId })
      .from(documents)
      .where(inArray(documents.portalId, portalIds));

    docs.forEach((doc) => {
      docCounts[doc.portalId] = (docCounts[doc.portalId] || 0) + 1;
    });
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold tracking-tight">
            Portal Manager
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create and manage your digital document portals
          </p>
        </div>
        {stripeConnected && <CreatePortalDialog />}
      </div>

      {!stripeConnected ? (
        <Card className="py-12 text-center bg-secondary/3 border-none">
          <CardHeader>
            <div className="p-2 bg-secondary/10 mx-auto rounded-md mb-6">
              <Unplug width={35} height={35} />
            </div>
            <CardTitle className="text-2xl">Stripe Not Connected</CardTitle>
            <CardDescription className="max-w-sm mx-auto">
              Before you can create document portals or accept payments, you
              need to connect your Stripe account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StripeConnectButton variant="secondary">
              Connect Stripe Account
            </StripeConnectButton>
          </CardContent>
        </Card>
      ) : userPortals.length === 0 ? (
        <Card className="border-dashed py-12 text-center bg-transparent">
          <CardHeader>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-border bg-muted/40 mb-2">
              <FolderKanban className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">No portals yet</CardTitle>
            <CardDescription className="max-w-sm mx-auto">
              Get started by creating your first document portal. You&apos;ll be
              able to upload files and set a price.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreatePortalDialog />
          </CardContent>
        </Card>
      ) : (
        <PortalList
          initialPortals={userPortals}
          initialDocCounts={docCounts}
          initialHasMore={hasMore}
        />
      )}
    </div>
  );
}

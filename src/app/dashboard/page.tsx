import { auth } from "@/lib/auth";
import { db } from "@/db";
import { portals, documents, user } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { CreatePortalDialog } from "./create-portal-dialog";
import { PortalsDataTable } from "./portals-data-table";
import { columns, type PortalData } from "./columns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderKanban, Unplug } from "lucide-react";
import { StripeConnectButton } from "@/components/stripe-connect-button";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  // Fetch portals with document counts and user Stripe status concurrently in a single roundtrip
  const [userPortals, [dbUser]] = await Promise.all([
    db
      .select({
        id: portals.id,
        name: portals.name,
        slug: portals.slug,
        priceInCents: portals.priceInCents,
        createdAt: portals.createdAt,
        updatedAt: portals.updatedAt,
        fileCount: count(documents.id),
      })
      .from(portals)
      .leftJoin(documents, eq(portals.id, documents.portalId))
      .where(eq(portals.userId, session.user.id))
      .groupBy(portals.id),
    db
      .select({
        stripeAccountId: user.stripeAccountId,
        stripeDetailsSubmitted: user.stripeDetailsSubmitted,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1),
  ]);

  // Check if user has connected their Stripe account without hitting external Stripe API on every hit
  let stripeConnected = false;
  if (dbUser?.stripeAccountId) {
    if (
      dbUser.stripeDetailsSubmitted !== null &&
      dbUser.stripeDetailsSubmitted !== undefined
    ) {
      stripeConnected = dbUser.stripeDetailsSubmitted;
    } else {
      // Lazy backfill: retrieve once from Stripe and persist to DB for future loads
      try {
        const account = await stripe.accounts.retrieve(dbUser.stripeAccountId);
        stripeConnected = Boolean(account.details_submitted);
        await db
          .update(user)
          .set({ stripeDetailsSubmitted: stripeConnected })
          .where(eq(user.id, session.user.id));
      } catch (err) {
        console.warn(
          "[Dashboard] Stripe lazy backfill failed for account",
          dbUser.stripeAccountId,
          err instanceof Error ? err.message : err
        );
      }
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-semibold">
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
        <PortalsDataTable
          columns={columns}
          data={userPortals.map((portal): PortalData => ({
            id: portal.id,
            name: portal.name,
            slug: portal.slug,
            priceInCents: portal.priceInCents,
            fileCount: Number(portal.fileCount) || 0,
            createdAt: portal.createdAt,
            updatedAt: portal.updatedAt || null,
          }))}
        />
      )}
    </div>
  );
}

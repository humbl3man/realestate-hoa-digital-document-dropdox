import { auth } from "@/lib/auth";
import { db } from "@/db";
import { portals, documents, user } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { Link } from "next-view-transitions";
import { CreatePortalDialog } from "./create-portal-dialog";
import { DeletePortalDialog } from "./delete-portal-dialog";
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
import { ExternalLink, FolderKanban, Unplug } from "lucide-react";
import { cn } from "@/lib/utils";
import { StripeConnectButton } from "@/components/stripe-connect-button";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const userPortals = await db
    .select()
    .from(portals)
    .where(eq(portals.userId, session.user.id));

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
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Portal Name</TableHead>
                <TableHead>Public URL</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Files</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userPortals.map((portal) => {
                const fileCount = docCounts[portal.id] || 0;
                const publicUrl = `/p/${portal.slug}`;
                return (
                  <TableRow key={portal.id}>
                    <TableCell className="font-semibold text-foreground">
                      <Link
                        href={`/dashboard/portals/${portal.id}`}
                        className="hover:underline underline-offset-2 inline-block w-fit"
                        style={{ viewTransitionName: `portal-name-${portal.id}` } as React.CSSProperties}
                      >
                        {portal.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <Link
                        href={publicUrl}
                        target="_blank"
                        className="hover:text-accent flex items-center gap-1.5 transition-colors"
                      >
                        {publicUrl}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      ${(portal.priceInCents / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
                          fileCount === 0
                            ? "bg-muted text-muted-foreground ring-border"
                            : "bg-success/10 text-success ring-success/20",
                        )}
                      >
                        {fileCount} {fileCount === 1 ? "file" : "files"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {portal.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <DeletePortalDialog portalId={portal.id} portalName={portal.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

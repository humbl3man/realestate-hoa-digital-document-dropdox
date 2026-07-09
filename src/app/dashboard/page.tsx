import { auth } from "@/lib/auth";
import { db } from "@/db";
import { portals, documents, user } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import Link from "next/link";
import { CreatePortalDialog } from "./create-portal-dialog";
import { deletePortal } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ExternalLink, FolderKanban, Trash2, AlertTriangle } from "lucide-react";

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
      {/* Stripe not connected warning banner */}
      {!stripeConnected && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-200">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="text-sm">
            <span className="font-semibold">Stripe not connected.</span>{" "}
            You must{" "}
            <a href="/dashboard/settings" className="underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-100 font-medium">
              connect your Stripe account
            </a>{" "}
            before you can create portals or accept payments.
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold tracking-tight">Manager Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Create and manage your HOA digital document storefronts.</p>
        </div>
        <CreatePortalDialog stripeConnected={stripeConnected} />
      </div>

      {userPortals.length === 0 ? (
        <Card className="border-dashed py-12 text-center bg-transparent">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-2">
              <FolderKanban className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">No portals yet</CardTitle>
            <CardDescription className="max-w-sm mx-auto">
              Get started by creating your first document portal. You&apos;ll be able to upload files and set a price.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreatePortalDialog stripeConnected={stripeConnected} />
          </CardContent>
        </Card>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-medium py-4">Portal Name</TableHead>
                <TableHead className="font-medium">Public URL</TableHead>
                <TableHead className="font-medium">Price</TableHead>
                <TableHead className="font-medium">Files</TableHead>
                <TableHead className="font-medium">Created At</TableHead>
                <TableHead className="font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userPortals.map((portal) => {
                const fileCount = docCounts[portal.id] || 0;
                const publicUrl = `/p/${portal.slug}`;
                return (
                  <TableRow key={portal.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-semibold py-4">
                      <Link
                        href={`/dashboard/portals/${portal.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {portal.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={publicUrl}
                        target="_blank"
                        className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
                      >
                        {publicUrl}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      ${(portal.priceInCents / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{fileCount} files</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {portal.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/portals/${portal.id}`} passHref>
                          <Button variant="secondary" size="sm" className="bg-secondary hover:bg-secondary/80">
                            Manage
                          </Button>
                        </Link>
                        <Dialog>
                          <DialogTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            }
                          />
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Portal</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete this portal? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose render={<Button variant="outline" />}>
                                Cancel
                              </DialogClose>
                              <form
                                action={async () => {
                                  "use server";
                                  await deletePortal(portal.id);
                                }}
                              >
                                <Button type="submit" variant="destructive">
                                  Delete
                                </Button>
                              </form>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
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

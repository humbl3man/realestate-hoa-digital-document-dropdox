"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { deletePortal, loadMorePortals } from "./actions";
import { type portals } from "@/db/schema";

export function PortalList({
  initialPortals,
  initialDocCounts,
  initialHasMore,
}: {
  initialPortals: (typeof portals.$inferSelect)[];
  initialDocCounts: Record<string, number>;
  initialHasMore: boolean;
}) {
  const [portals, setPortals] = useState(initialPortals);
  const [docCounts, setDocCounts] = useState(initialDocCounts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLoadMore = async () => {
    setIsLoading(true);
    try {
      const result = await loadMorePortals(portals.length, 10);
      setPortals((prev) => {
        const newPortals = [...prev, ...result.portals];
        
        const params = new URLSearchParams(searchParams.toString());
        params.set("limit", newPortals.length.toString());
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        
        return newPortals;
      });
      setDocCounts((prev) => ({ ...prev, ...result.docCounts }));
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Failed to load more portals", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
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
            {portals.map((portal) => {
              const fileCount = docCounts[portal.id] || 0;
              const publicUrl = `/p/${portal.slug}`;
              return (
                <TableRow key={portal.id}>
                  <TableCell className="font-semibold text-foreground">
                    <Link
                      href={`/dashboard/portals/${portal.id}`}
                      className="hover:underline underline-offset-2"
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
                    {new Date(portal.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog>
                        <DialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Delete portal "${portal.name}"`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          }
                        />
                        <DialogContent>
                          <DialogHeader>
                            <div className="flex items-start gap-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                              </div>
                              <div>
                                <DialogTitle>Delete Portal</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this portal?
                                  This action cannot be undone.
                                </DialogDescription>
                              </div>
                            </div>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose render={<Button variant="ghost" />}>
                              Cancel
                            </DialogClose>
                            <form
                              action={async () => {
                                await deletePortal(portal.id);
                                // Optimistically remove the deleted portal from the local state
                                setPortals((prev) => prev.filter((p) => p.id !== portal.id));
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

      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            size="lg"
            onClick={handleLoadMore}
            disabled={isLoading}
            variant="ghost"
            className="w-full sm:w-auto"
          >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Load More Portals
          </Button>
        </div>
      )}
    </div>
  );
}

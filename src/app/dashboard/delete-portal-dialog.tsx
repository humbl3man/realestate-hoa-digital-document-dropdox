"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { deletePortal } from "./actions";
import { toast } from "sonner";

export function DeletePortalDialog({
  portalId,
  portalName,
}: {
  portalId: string;
  portalName: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deletePortal(portalId);
        toast.success("Portal deleted successfully!");
        setOpen(false);
      } catch (err: any) {
        toast.error(err?.message || "Failed to delete portal.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={isPending ? undefined : setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete portal "${portalName}"`}
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
            <div className="flex flex-col gap-4">
              <DialogTitle>Delete Portal</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this portal? This action cannot
                be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isPending}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={handleDelete}
            size="sm"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

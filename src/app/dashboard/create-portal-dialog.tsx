"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "./actions";
import { appConfig } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Plus, AlertCircle } from "lucide-react";
import { FormError } from "@/components/ui/form-error";
import Link from "next/link";

export function CreatePortalDialog({ stripeConnected = false }: { stripeConnected?: boolean }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Helper to slugify text
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-"); // Replace multiple - with single -
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !price) return;

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Please enter a valid price greater than $0.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createPortal({
        name,
        slug: slugify(slug), // ensure valid slug format
        priceInCents: Math.round(parsedPrice * 100),
      });
      setName("");
      setSlug("");
      setPrice("");
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!stripeConnected ? (
        // Stripe not connected: show disabled button with tooltip explanation
        <div className="relative group">
          <Button
            id="create-portal-trigger"
            className="font-medium transition-colors shadow-sm opacity-50 cursor-not-allowed"
            disabled
            aria-disabled="true"
          >
            <Plus className="h-4 w-4" />
            Create Portal
          </Button>
          {/* Tooltip wrapper with transparent bottom padding to bridge the hover gap */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2 hidden group-hover:flex z-50">
            <div className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-popover border border-border shadow-md px-3 py-2 text-xs text-popover-foreground">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Connect Stripe first —{" "}</span>
              <Link href="/dashboard/settings" className="underline font-medium" onClick={(e) => e.stopPropagation()}>
                Go to Settings
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <DialogTrigger
          render={
            <Button id="create-portal-trigger" className="font-medium transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              Create Portal
            </Button>
          }
        />
      )}
      <DialogContent className="sm:max-w-[425px] bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create Document Portal</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure a portal where buyers can purchase your HOA disclosure bundle.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Portal Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Oakwood HOA Disclosures"
              value={name}
              onChange={handleNameChange}
              className="bg-background border-border text-foreground placeholder-muted-foreground focus-visible:ring-primary focus-visible:border-primary"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium text-foreground">
              Public Link Slug
            </Label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                /p/
              </span>
              <Input
                id="slug"
                placeholder="oakwood-hoa"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="rounded-l-none bg-background border-border text-foreground placeholder-muted-foreground focus-visible:ring-primary focus-visible:border-primary"
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium text-foreground">
              Price (USD)
            </Label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                $
              </span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="35.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-l-none bg-background border-border text-foreground placeholder-muted-foreground focus-visible:ring-primary focus-visible:border-primary"
                required
                disabled={loading}
              />
            </div>
            <p className="text-[10px] text-muted-foreground leading-normal mt-1">
              The platform retains a {appConfig.platformFeePercentage}% fee on each transaction.
            </p>
          </div>
          {error && (
            <FormError>{error}</FormError>
          )}
          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              id="create-portal-submit"
              className="font-medium"
              disabled={loading || !stripeConnected}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Portal"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

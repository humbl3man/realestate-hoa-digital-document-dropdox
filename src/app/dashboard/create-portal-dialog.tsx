"use client";

import { useState } from "react";
import { useTransitionRouter as useRouter } from "next-view-transitions";;
import { createPortal } from "./actions";
import { appConfig } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2, Plus } from "lucide-react";
import { FormError } from "@/components/ui/form-error";
import { toast } from "sonner";

export function CreatePortalDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
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
    if (isNaN(parsedPrice) || parsedPrice < 5.00) {
      setError("Please enter a valid price of at least $5.00.");
      return;
    }

    if (description.length > 100) {
      setError("Description must be 100 characters or less.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await createPortal({
        name,
        slug: slugify(slug), // ensure valid slug format
        description: description || undefined,
        priceInCents: Math.round(parsedPrice * 100),
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      setName("");
      setSlug("");
      setDescription("");
      setPrice("");
      setOpen(false);
      toast.success("Portal created successfully!");
      if (result?.id) {
        router.push(`/dashboard/portals/${result.id}`);
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="default" id="create-portal-trigger">
            <Plus className="h-4 w-4" />
            Create Portal
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Create Document Portal
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure a portal where buyers can purchase your document bundle.
          </DialogDescription>
        </DialogHeader>
        <form
          id="create-portal-form"
          onSubmit={handleSubmit}
          className="space-y-4 pt-4 pb-2"
        >
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-foreground"
            >
              Portal Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Property Documents"
              value={name}
              onChange={handleNameChange}
              className="focus-visible:ring-primary focus-visible:border-primary"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="slug"
              className="text-sm font-medium text-foreground"
            >
              Public Link Slug
            </Label>
            <div className="flex">
              <span className="inline-flex h-8 items-center justify-center px-3 rounded-l-lg border border-r-0 border-secondary bg-muted text-muted-foreground text-sm shrink-0">
                /p/
              </span>
              <Input
                id="slug"
                placeholder="property-documents"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="rounded-l-none focus-visible:ring-primary focus-visible:border-primary"
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-foreground"
            >
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="e.g. Official document package required for property transfer..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100}
              className="resize-none focus-visible:ring-primary focus-visible:border-primary"
              disabled={loading}
            />
            <p className="text-[10px] text-muted-foreground leading-normal mt-1">
              {description.length}/100 characters.
            </p>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="price"
              className="text-sm font-medium text-foreground"
            >
              Price (USD)
            </Label>
            <div className="flex">
              <span className="inline-flex h-8 items-center justify-center px-3 rounded-l-lg border border-r-0 border-secondary bg-muted text-muted-foreground text-sm shrink-0">
                $
              </span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="5.00"
                placeholder="100.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-l-none focus-visible:ring-primary focus-visible:border-primary"
                required
                disabled={loading}
              />
            </div>
            <p className="text-[10px] text-muted-foreground leading-normal mt-1">
              The platform retains a {appConfig.platformFeePercentage}% fee on
              each transaction.
            </p>
          </div>
          {error && <FormError>{error}</FormError>}
        </form>
        <DialogFooter className="mt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-portal-form"
            id="create-portal-submit"
            disabled={loading}
            variant="default"
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
      </DialogContent>
    </Dialog>
  );
}

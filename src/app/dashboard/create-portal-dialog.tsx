"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "./actions";
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
import { Loader2, Plus } from "lucide-react";
import { FormError } from "@/components/ui/form-error";

export function CreatePortalDialog() {
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
      <DialogTrigger
        render={
          <Button className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium transition-colors shadow-sm">
            <Plus className="h-4 w-4" />
            Create Portal
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create Document Portal</DialogTitle>
          <DialogDescription className="text-slate-400">
            Configure a portal where buyers can purchase your HOA disclosure bundle.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-200">
              Portal Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Oakwood HOA Disclosures"
              value={name}
              onChange={handleNameChange}
              className="bg-slate-950/80 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-primary focus-visible:border-primary"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium text-slate-200">
              Public Link Slug
            </Label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-800 bg-slate-950 text-slate-500 text-sm">
                /p/
              </span>
              <Input
                id="slug"
                placeholder="oakwood-hoa"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="rounded-l-none bg-slate-950/80 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-primary focus-visible:border-primary"
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium text-slate-200">
              Price (USD)
            </Label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-800 bg-slate-950 text-slate-500 text-sm">
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
                className="rounded-l-none bg-slate-950/80 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-primary focus-visible:border-primary"
                required
                disabled={loading}
              />
            </div>
          </div>
          {error && (
            <FormError>{error}</FormError>
          )}
          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-white hover:bg-slate-200 text-slate-950 font-medium"
              disabled={loading}
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

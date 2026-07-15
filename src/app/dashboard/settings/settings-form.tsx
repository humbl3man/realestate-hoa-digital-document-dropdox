"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "./actions";
import { appConfig } from "@/config";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ExternalLink, Zap, Unplug } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

interface SettingsFormProps {
  initialName: string;
  stripeAccountId: string | null;
  stripeAccountEmail: string | null;
}

export function SettingsForm({
  initialName,
  stripeAccountId,
  stripeAccountEmail,
}: SettingsFormProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    const result = await updateProfile(formData);

    if (result.error) {
      setIsPending(false);
      toast.error("Error", {
        description: result.error,
      });
    } else {
      // Sync the updated name to the client-side session cache
      // so the sidebar and other components react instantly
      await authClient.updateUser({
        name: formData.get("name") as string,
      });
      setIsPending(false);

      toast.success("Success", {
        description: "Your profile has been updated.",
      });
    }
  }

  return (
    <div className="space-y-8 max-w-md">
      {/* Profile Information */}
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-medium">Profile Information</h2>
          <p className="text-sm text-muted-foreground">
            Update your personal account details.
          </p>
        </div>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initialName}
              placeholder="Jane Doe"
              required
            />
          </div>
          <Button variant="secondary" type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Payouts / Stripe Connect */}
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Payouts</h2>
          <p className="text-sm text-muted-foreground">
            {!stripeAccountId && (
              <>
                Connect your Stripe account to receive payments from document
                sales.
              </>
            )}
            The platform retains a {appConfig.platformFeePercentage}% fee on
            each transaction.
          </p>
        </div>

        {stripeAccountId ? (
          // Connected state
          <>
            <Link
              href="/api/stripe/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: "secondary",
              })}
            >
              <ExternalLink className="w-4 h-4" />
              Open Stripe Dashboard
            </Link>
          </>
        ) : (
          // Not connected state
          <div className="rounded-xl bg-secondary/3 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Unplug className="w-5 h-5 text-muted-foreground shrink-0 mt-2" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                You haven&apos;t connected a Stripe account yet. Once connected,
                buyers will be able to purchase your document bundles and
                payments will be sent directly to your Stripe balance.
              </p>
            </div>
            <a href="/api/stripe/connect">
              <Button
                id="stripe-connect-button"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Connect with Stripe
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

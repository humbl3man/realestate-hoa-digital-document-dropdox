"use client";

import { buttonVariants } from "@/components/ui/button";
import { appConfig } from "@/config";
import { ExternalLink, Unplug } from "lucide-react";
import Link from "next/link";

import { StripeConnectButton } from "@/components/stripe-connect-button";

interface SettingsFormProps {
  stripeAccountId: string | null;
  stripeAccountEmail: string | null;
}

export function SettingsForm({
  stripeAccountId,
  stripeAccountEmail,
}: SettingsFormProps) {
  return (
    <div className="space-y-8 max-w-3xl">
      {/* Payouts / Stripe Connect */}
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Payouts</h2>
          <p className="text-sm text-muted-foreground">
            {!stripeAccountId && (
              <>
                Connect your Stripe account to receive payments from document
                sales.{" "}
              </>
            )}
            The platform retains a {appConfig.platformFeePercentage}% fee on
            each transaction.
          </p>
        </div>

        {stripeAccountId ? (
          // Connected state
          <div className="rounded-xl bg-secondary/3 p-5 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your account is successfully connected to Stripe. You can review all your transactions, sales history, and manage payouts directly from your Stripe Dashboard.
            </p>
            <Link
              href="/api/stripe/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: "secondary",
              })}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Stripe Dashboard
            </Link>
          </div>
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
            <StripeConnectButton
              id="stripe-connect-button"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Connect with Stripe
            </StripeConnectButton>
          </div>
        )}
      </div>
    </div>
  );
}

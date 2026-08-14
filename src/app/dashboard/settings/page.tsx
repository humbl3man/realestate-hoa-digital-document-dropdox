import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SettingsForm } from "./settings-form";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";

export const metadata = {
  title: "Settings | Dashboard",
};

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Fetch user with stripeAccountId
  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  // If connected, fetch the account email from Stripe
  let stripeAccountEmail: string | null = null;
  let isFullyConnected = false;
  
  if (dbUser?.stripeAccountId) {
    try {
      const account = await stripe.accounts.retrieve(dbUser.stripeAccountId);
      if (account.details_submitted) {
        stripeAccountEmail = account.email ?? null;
        isFullyConnected = true;
      }
    } catch {
      // Account may have been deleted on Stripe side — treat as not connected
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <SettingsForm
        stripeAccountId={isFullyConnected ? dbUser!.stripeAccountId : null}
        stripeAccountEmail={stripeAccountEmail}
      />
    </div>
  );
}

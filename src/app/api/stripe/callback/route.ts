import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Fetch the user's current connected account ID
  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  const stripeAccountId = dbUser?.stripeAccountId;

  if (stripeAccountId) {
    // Verify the account is fully onboarded
    const account = await stripe.accounts.retrieve(stripeAccountId);

    if (account.details_submitted) {
      // Fully connected — redirect to settings with success indicator
      return NextResponse.redirect(
        new URL("/dashboard/settings?stripe=connected", appUrl)
      );
    }

    // Account exists but onboarding not complete — generate a new link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${appUrl}/api/stripe/connect`,
      return_url: `${appUrl}/api/stripe/callback`,
      type: "account_onboarding",
    });
    return NextResponse.redirect(accountLink.url);
  }

  // No account at all — redirect to settings
  return NextResponse.redirect(
    new URL("/dashboard/settings", appUrl)
  );
}

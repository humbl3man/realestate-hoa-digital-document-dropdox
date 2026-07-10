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

  // Fetch the user's current record
  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  let stripeAccountId = dbUser?.stripeAccountId;

  // If no connected account yet, create one
  if (!stripeAccountId) {
    // Use Accounts v2 API instead of legacy `type: "express"` v1 accounts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const account = await (stripe.v2.core.accounts.create as any)({
      // Provide an empty object or configuration here; Stripe defaults based on platform settings
      // We cast to any to bypass TS compilation errors if the SDK types are not perfectly synced
    });
    stripeAccountId = account.id;

    await db
      .update(user)
      .set({ stripeAccountId })
      .where(eq(user.id, session.user.id));
  }

  // Generate a one-time onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId as string,
    refresh_url: `${appUrl}/api/stripe/connect`,
    return_url: `${appUrl}/api/stripe/callback`,
    type: "account_onboarding",
  });

  return NextResponse.redirect(accountLink.url);
}

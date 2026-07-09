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
    const account = await stripe.accounts.create({ type: "express" });
    stripeAccountId = account.id;

    await db
      .update(user)
      .set({ stripeAccountId })
      .where(eq(user.id, session.user.id));
  }

  // Generate a one-time onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${appUrl}/api/stripe/connect`,
    return_url: `${appUrl}/api/stripe/callback`,
    type: "account_onboarding",
  });

  return NextResponse.redirect(accountLink.url);
}

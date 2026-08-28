import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { getAppUrl } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const appUrl = getAppUrl(req);

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

    // Persist verified onboarding status to DB
    await db
      .update(user)
      .set({ stripeDetailsSubmitted: account.details_submitted })
      .where(eq(user.id, session.user.id));

    if (account.details_submitted) {
      // Fully connected — redirect to settings with success indicator
      return NextResponse.redirect(
        new URL("/dashboard/settings?stripe=connected", appUrl)
      );
    } else {
      // Account exists but onboarding not complete — redirect back to settings
      return NextResponse.redirect(
        new URL("/dashboard/settings?stripe=incomplete", appUrl)
      );
    }
  }

  // No account at all — redirect to settings
  return NextResponse.redirect(
    new URL("/dashboard/settings", appUrl)
  );
}

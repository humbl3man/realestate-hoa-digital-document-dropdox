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

  // Fetch the user's current record
  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!dbUser?.stripeAccountId) {
    return new NextResponse("No connected account found", { status: 400 });
  }

  try {
    const account = await stripe.accounts.retrieve(dbUser.stripeAccountId);
    
    if (account.type === "standard") {
      // Standard accounts use the regular Stripe dashboard
      return NextResponse.redirect("https://dashboard.stripe.com");
    }

    // Express accounts use a special login link
    const loginLink = await stripe.accounts.createLoginLink(dbUser.stripeAccountId);
    return NextResponse.redirect(loginLink.url);
  } catch (err: any) {
    console.error("Failed to generate dashboard link:", err);
    return new NextResponse(
      "Could not generate dashboard link. Please try again later.",
      { status: 500 }
    );
  }
}

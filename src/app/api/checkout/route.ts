import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { portals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const portalId = formData.get("portalId") as string | null;

    if (!portalId) {
      return new NextResponse("Missing portalId", { status: 400 });
    }

    const [portal] = await db
      .select()
      .from(portals)
      .where(eq(portals.id, portalId))
      .limit(1);

    if (!portal) {
      return new NextResponse("Portal not found", { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${portal.name} - HOA Disclosures`,
              description: "ZIP archive containing uploaded HOA disclosure documents",
            },
            unit_amount: portal.priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        portalId: portal.id,
      },
      success_url: `${appUrl}/p/${portal.slug}?purchased=true`,
      cancel_url: `${appUrl}/p/${portal.slug}`,
    });

    if (!session.url) {
      throw new Error("Failed to create Stripe Session URL");
    }

    // 303 redirection is standard for form post redirects
    return NextResponse.redirect(session.url, { status: 303 });
  } catch (err: any) {
    console.error("Stripe session creation error:", err);
    return new NextResponse(err?.message || "Internal Server Error", { status: 500 });
  }
}

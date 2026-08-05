import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { downloadSessions, portals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { resend } from "@/lib/resend";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  let event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Fallback for local testing without stripe CLI webhooks configured
      console.warn("STRIPE_WEBHOOK_SECRET is not set. Webhook signature verification skipped.");
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    const portalId = session.metadata?.portalId;
    const email = session.customer_details?.email;

    if (!portalId || !email) {
      console.error("Missing portalId or email in session metadata/customer_details");
      return new NextResponse("Missing metadata", { status: 400 });
    }

    try {
      // Check if portal exists
      const [portal] = await db
        .select()
        .from(portals)
        .where(eq(portals.id, portalId))
        .limit(1);

      if (!portal) {
        console.error(`Portal with ID ${portalId} not found`);
        return new NextResponse("Portal not found", { status: 404 });
      }

      // Generate expiring token
      const token = randomUUID();
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now

      // Save download session to DB
      await db.insert(downloadSessions).values({
        id: token,
        portalId: portalId,
        email: email,
        amountInCents: session.amount_total,
        expiresAt: expiresAt,
        createdAt: new Date(),
      });

      // Send email containing the secure proxy link
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const downloadLink = `${appUrl}/download/${token}`;
      const emailFrom = process.env.EMAIL_FROM || "onboarding@resend.dev";

      if (process.env.NODE_ENV === "development") {
        console.log(`\n=========================================`);
        console.log(`📦 PURCHASE SUCCESSFUL FOR: \${email}`);
        console.log(`👉 DOWNLOAD LINK: \${downloadLink}`);
        console.log(`=========================================\n`);
      }

      try {
        await resend.emails.send({
          from: emailFrom,
        to: email,
        subject: `Your disclosures are ready: ${portal.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
            <h2 style="color: #0f172a; margin-bottom: 16px;">Thank you for your purchase!</h2>
            <p style="color: #334155; font-size: 16px; line-height: 1.5;">
              You have successfully purchased the disclosure documents for <strong>${portal.name}</strong>.
            </p>
            <p style="color: #334155; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
              Please click the secure button below to download your document bundle as a ZIP archive.
            </p>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${downloadLink}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
                Download Documents
              </a>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 16px;">
              <strong>Important:</strong> This link is secure and will expire in <strong>48 hours</strong> (expires on ${expiresAt.toLocaleString()}). No account creation is required to access your files.
            </p>
          </div>
        `,
      });
      } catch (emailErr) {
        console.error("Failed to send email (check your Resend domain settings), but download session was created:", emailErr);
      }

      console.log(`Successfully created download session and emailed buyer: ${email}`);
    } catch (err: any) {
      console.error("Webhook processing failed:", err);
      return new NextResponse(`Database/Email Error: ${err.message}`, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

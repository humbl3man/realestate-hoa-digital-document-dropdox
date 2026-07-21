import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { magicLink } from "better-auth/plugins";
import { db } from "@/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  plugins: [
    magicLink({
      expiresIn: 900, // 900s = 15 minutes
      sendMagicLink: async ({ email, url }) => {
        const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
        
        // Always log the link to the terminal so you can log in locally without checking email
        console.log(`\n=========================================`);
        console.log(`🔑 MAGIC LINK FOR ${email}:`);
        console.log(`👉 ${url}`);
        console.log(`=========================================\n`);

        try {
          await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: "Sign in to your Document Portal Dashboard",
            html: `<p>Click the link to sign in to your dashboard:</p><p><a href="${url}">${url}</a></p>`,
          });
        } catch (err) {
          console.error("Failed to send email via Resend:", err);
        }
      },
    }),
  ],
});

if (process.env.E2E_MOCK === "true") {
  const originalGetSession = auth.api.getSession;
  // @ts-expect-error — intentional E2E mock override; signature doesn't match strict API type
  auth.api.getSession = async (opts: any) => {
    const reqHeaders = await opts?.headers;
    const cookieHeader = reqHeaders?.get("cookie") || "";
    if (cookieHeader.includes("better-auth.session_token=test-session-token-123")) {
      return {
        session: { id: "test-session-id", userId: "test-user-id", expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), createdAt: new Date(), updatedAt: new Date(), token: "test-session-token-123" },
        user: { id: "test-user-id", email: "e2e-test@example.com", name: "E2E Test User", emailVerified: true, stripeAccountId: "acct_mock123", createdAt: new Date(), updatedAt: new Date() }
      } as any;
    }
    return originalGetSession(opts);
  };
}

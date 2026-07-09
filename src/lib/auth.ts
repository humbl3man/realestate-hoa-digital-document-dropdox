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
            subject: "Sign in to your HOA Portal Dashboard",
            html: `<p>Click the link to sign in to your dashboard:</p><p><a href="${url}">${url}</a></p>`,
          });
        } catch (err) {
          console.error("Failed to send email via Resend:", err);
        }
      },
    }),
  ],
});

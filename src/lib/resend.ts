import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "re_placeholder";

export const resend = new Resend(resendApiKey);

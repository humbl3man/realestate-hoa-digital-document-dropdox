import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const sansFont = Poppins({
  variable: "--app-font",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"]
});

import { appConfig } from "@/config";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ViewTransitions } from "next-view-transitions";

export const metadata: Metadata = {
  title: appConfig.name,
  description: "Securely purchase and download document bundles.",
  openGraph: {
    title: appConfig.name,
    description: "Securely purchase and download document bundles.",
    type: "website",
    siteName: appConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: appConfig.name,
    description: "Securely purchase and download document bundles.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        className={`${sansFont.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <body className="min-h-[100dvh] flex flex-col bg-background text-foreground">
          {children}
          <Toaster />
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ViewTransitions>
  );
}

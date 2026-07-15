import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  FileText,
  Shield,
  CircleDollarSign,
  FolderOpen,
  ArrowRight,
} from "lucide-react";
import { appConfig } from "@/config";

export default async function LandingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] opacity-70" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <div className="flex items-center gap-3 group">
          <div className="bg-primary text-foreground p-2.5 rounded-xl border border-primary/20">
            <FileText
              size={24}
              className="group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <span className="font-heading font-bold text-xl md:text-2xl tracking-tight text-foreground">
            {appConfig.name}
          </span>
        </div>
        <nav className="flex items-center gap-4">
          {session ? (
            <Link href="/dashboard">
              <Button
                variant="default"
                className="rounded-full px-6 transition-all font-medium"
              >
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </Link>
              <Link href="/login">
                <Button
                  variant="default"
                  className="rounded-full px-6 transition-all font-medium"
                >
                  Create Account
                </Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        {/* Hero Typography */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent pb-1 bg-clip-text bg-linear-to-br from-foreground via-foreground to-muted-foreground max-w-4xl mb-8">
          Securely share documents and collect payments effortlessly.
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed">
          The modern digital dropbox designed for real estate professionals.
          Automate document requests, charge for downloads, and stay compliant
          without the email chaos.
        </p>

        {/* CTA */}
        <div className="flex flex-col gap-2">
          <Link
            href="/login"
            className={buttonVariants({
              variant: "accent",
              size: "xl",
            })}
          >
            Create a free account
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-xs text-muted-foreground">
            Requires easy Stripe setup
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-32">
          {/* Feature 1 */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left p-6 rounded-3xl bg-card border border-border">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-3">
              Bank-Grade Security
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Protect sensitive tenant and HOA information. All documents are
              encrypted in transit and at rest.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left p-6 rounded-3xl bg-card border border-border">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6">
              <FolderOpen size={24} />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-3">
              Perfect Organization
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Say goodbye to lost email attachments. Everything is automatically
              sorted by property and resident.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left p-6 rounded-3xl bg-card border border-border">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
              <CircleDollarSign size={24} />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-3">
              Monetize Downloads
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Easily charge fees for CC&amp;Rs, resale certificates, and other
              records. Payments process securely via Stripe before the download
              unlocks.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-border bg-background py-8 text-center text-muted-foreground text-sm">
        <p>
          &copy; {new Date().getFullYear()} {appConfig.name}. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}

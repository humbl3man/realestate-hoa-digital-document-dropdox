import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Link } from "next-view-transitions";
import { Logo } from "@/components/ui/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Shield, CircleDollarSign, FolderOpen, ArrowRight, Users, LogIn } from "lucide-react";
import { AnimatedHeroBackground } from "@/components/ui/animated-hero-background";
import { appConfig } from "@/config";
import { cn } from "@/lib/utils";

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
        <div className="absolute top-[10dvh] left-1/2 -translate-x-1/2 w-[90dvw] h-[30dvh] bg-primary/30 rounded-sm blur-[1000px] opacity-70" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo width={32} height={32} />
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
                className={cn(buttonVariants({
                  variant: "outline",
                }), 'flex items-center gap-2')}
              >
                Login
                <LogIn className="w-4 h-4" />
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <AnimatedHeroBackground />
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        {/* Hero Typography */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent pb-1 bg-clip-text bg-linear-to-br from-foreground via-foreground to-muted-foreground max-w-4xl mb-8">
          Securely share documents and collect payments effortlessly.
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed">
          The modern digital dropbox designed for professionals. Automate
          document requests, charge for downloads, and stay compliant without
          the email chaos.
        </p>

        {/* CTA */}
        <div className="flex flex-col gap-2">
          <Link
            href="/login"
            className={cn(
              buttonVariants({
                variant: "default",
                size: "xl",
              }),
              "h-14 text-lg group flex items-center gap-2 px-6 transition-all duration-200",
            )}
          >
            Create a free account
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-all duration-200" />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 w-full max-w-5xl mt-24 sm:mt-32 text-left">
          {/* Feature 1 */}
          <div className="flex gap-4 md:gap-6 items-start">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mt-1">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground mb-2">
                Bank-Grade Security
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Protect sensitive information. All documents are encrypted in
                transit and at rest.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex gap-4 md:gap-6 items-start">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center mt-1">
              <FolderOpen size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground mb-2">
                Perfect Organization
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Say goodbye to lost email attachments. Everything is automatically
                centralized, searchable, and securely organized.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex gap-4 md:gap-6 items-start">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mt-1">
              <CircleDollarSign size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground mb-2">
                Monetize Downloads
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Easily charge fees for CC&amp;Rs, resale certificates, and other
                records. Payments process securely via Stripe before the download
                unlocks.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex gap-4 md:gap-6 items-start">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center mt-1">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground mb-2">
                Client Portals
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Provide a professional experience. Clients get a secure link to access their requested documents and payment history in one place.
              </p>
            </div>
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

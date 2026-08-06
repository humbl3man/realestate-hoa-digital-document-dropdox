import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Link } from "next-view-transitions";
import { Logo } from "@/components/ui/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Shield, CircleDollarSign, FolderOpen, ArrowRight, ArrowDown, Users, LogIn } from "lucide-react";
import { AnimatedHeroBackground } from "@/components/ui/animated-hero-background";
import { appConfig } from "@/config";
import { cn } from "@/lib/utils";
import { ScrollButton } from "@/components/scroll-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            className={cn(
              buttonVariants({
                variant: "default",
                size: "xl",
              }),
              "h-14 text-lg group flex items-center justify-center gap-2 px-6 transition-all duration-200",
            )}
          >
            Create a free account
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-all duration-200" />
          </Link>
          <ScrollButton
            targetId="how-it-works"
            className="h-14 text-lg group flex items-center justify-center gap-2 px-6 transition-all duration-200 bg-background/50 backdrop-blur-sm"
          >
            How it works
            <ArrowDown className="ml-2 w-5 h-5 group-hover:translate-y-1 transition-all duration-200" />
          </ScrollButton>
        </div>

        {/* Features Section */}
        <section className="w-full max-w-5xl mt-24 sm:mt-32 flex flex-col items-center">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              Everything you need to manage documents
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete platform to securely request, store, and monetize your digital real estate documents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 w-full text-left">
            {/* Feature 1 */}
            <div className="flex gap-4 md:gap-6 items-start">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mt-1">
                <Shield size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground mb-2">
                  Bank-Grade Security
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Protect sensitive information. All documents are encrypted in
                  transit and at rest.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4 md:gap-6 items-start">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mt-1">
                <FolderOpen size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground mb-2">
                  Perfect Organization
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Say goodbye to lost email attachments. Everything is automatically
                  centralized, searchable, and securely organized.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4 md:gap-6 items-start">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mt-1">
                <CircleDollarSign size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground mb-2">
                  Monetize Downloads
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Easily charge fees for CC&amp;Rs, resale certificates, and other
                  records. Payments process securely via Stripe before the download
                  unlocks.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-4 md:gap-6 items-start">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mt-1">
                <Users size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground mb-2">
                  Client Portals
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Provide a professional experience. Clients get a secure link to access their requested documents and payment history in one place.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works? */}
        <section id="how-it-works" className="w-full max-w-5xl mt-32 text-left scroll-mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              From Setup to Paid in 4 Simple Steps
            </h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              We handle the payment processing and secure file delivery so you don&apos;t have to.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center gap-4 relative">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl z-10">
                1
              </div>
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-border -z-10" />
              <h3 className="text-xl font-bold text-foreground">Create Account</h3>
              <p className="text-muted-foreground text-sm">
                Sign up in seconds and access your secure dashboard.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center gap-4 relative">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl z-10">
                2
              </div>
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-border -z-10" />
              <h3 className="text-xl font-bold text-foreground">Connect Stripe</h3>
              <p className="text-muted-foreground text-sm">
                Link your bank account to securely collect payments.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center gap-4 relative">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl z-10">
                3
              </div>
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-border -z-10" />
              <h3 className="text-xl font-bold text-foreground">Share Portal</h3>
              <p className="text-muted-foreground text-sm">
                Upload documents, set a price, and generate a public link.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl z-10">
                4
              </div>
              <h3 className="text-xl font-bold text-foreground">Get Paid</h3>
              <p className="text-muted-foreground text-sm">
                Buyers purchase through your link and instantly receive the files.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full max-w-3xl mt-32 text-left">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg">What types of documents can I sell?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                You can sell any PDF document, such as HOA bylaws, CC&Rs, resale certificates, demand payoffs, and condo questionnaires.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg">How do I get paid?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                Payments are processed securely through Stripe. Funds are routed directly to your connected bank account, minus standard processing fees and our platform fee.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg">Are my documents secure?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                Yes. Your documents are stored securely and are only accessible to buyers after they complete a successful payment.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg">Is there a limit on file size?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                You can upload up to {appConfig.maxDocsPerPortal} PDFs per portal, with a maximum file size of {appConfig.maxUploadMb}MB per document.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* CTA Callout */}
        <section className="w-full max-w-5xl mx-auto mt-32 mb-16 text-center py-20 px-6">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
            Boost your productivity.<br />
            Start using our app today.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop dealing with lost email attachments and manual invoicing. Automate document requests and charge for downloads seamlessly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className={cn(
                buttonVariants({
                  variant: "default",
                  size: "xl",
                }),
                "h-12 px-8 text-base font-semibold",
              )}
            >
              Get started
            </Link>
          </div>
        </section>
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

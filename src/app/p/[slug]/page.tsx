import { db } from "@/db";
import { portals, documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, ShieldCheck, Mail, ArrowRight, Lock } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ purchased?: string; error?: string }>;
}

export default async function PublicPortalPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { purchased, error } = await searchParams;

  // Fetch portal
  const [portal] = await db
    .select()
    .from(portals)
    .where(eq(portals.slug, slug))
    .limit(1);

  if (!portal) {
    notFound();
  }

  // Fetch documents
  const docs = await db
    .select()
    .from(documents)
    .where(eq(documents.portalId, portal.id));

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const totalSize = docs.reduce((acc, curr) => acc + curr.fileSize, 0);

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-secondary/5 font-sans">
      <main className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-8">
        {purchased === "true" && (
          <div className="w-full max-w-lg mb-6 p-5 bg-success text-success-foreground rounded-xl flex flex-col items-center text-center space-y-2 animate-in fade-in zoom-in-95 duration-300">
            <ShieldCheck className="w-10 h-10 text-success-foreground mb-2" />
            <h3 className="font-bold font-heading text-lg">
              Thank you for your purchase!
            </h3>
            <p className="text-sm text-success-foreground/90 leading-relaxed">
              We{`'`}ve emailed your secure, expiring download link to the
              address provided during checkout. Please check your inbox (and
              spam folder) within the next few minutes.
            </p>
          </div>
        )}

        {error && (
          <div className="w-full max-w-lg mb-6 p-5 bg-destructive/10 text-destructive rounded-xl flex flex-col items-center text-center space-y-2 animate-in fade-in zoom-in-95 duration-300">
            <h3 className="font-bold font-heading text-lg">
              Checkout Unavailable
            </h3>
            <p className="text-sm leading-relaxed">
              {error === "unavailable" && "This portal is currently unavailable for purchase."}
              {error === "not-connected" && "The portal owner has not fully connected their payment account."}
              {error === "not-found" && "The requested portal was not found."}
              {!["unavailable", "not-connected", "not-found"].includes(error) && "An unexpected error occurred during checkout. Please try again."}
            </p>
          </div>
        )}

        <Card className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="text-center pt-10 pb-8 border-b border-slate-100">
            <div className="mx-auto inline-flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-secondary text-xs font-semibold rounded-full mb-4">
              <ShieldCheck size={14} />
              Official Document Portal
            </div>
            <CardTitle className="text-3xl font-heading font-bold tracking-tight text-slate-900">
              {portal.name}
            </CardTitle>
            <CardDescription className="text-slate-500 mt-3 text-base max-w-sm mx-auto leading-relaxed">
              {portal.description ||
                "Official document package for secure distribution and due diligence."}
            </CardDescription>
          </CardHeader>

          <CardContent className="py-8 space-y-8 px-6 sm:px-10">
            {/* Document list */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex justify-between items-center">
                <span>Documents Included ({docs.length})</span>
                <span className="text-slate-500 font-normal">
                  {formatBytes(totalSize)}
                </span>
              </h3>

              {docs.length === 0 ? (
                <p className="text-sm text-slate-500 italic py-2 text-center bg-slate-50 rounded-lg">
                  No files have been added to this bundle yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-4">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        </div>
                        <span
                          className="text-slate-700 text-sm font-medium truncate"
                          title={doc.fileName}
                        >
                          {doc.fileName}
                        </span>
                      </div>
                      <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  ))}
                  <p className="text-xs text-center text-slate-500 mt-3">
                    Files unlock immediately after purchase.
                  </p>
                </div>
              )}
            </div>

            {/* Value Prop/Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <div className="bg-secondary/10 p-1.5 rounded-lg shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Secure Access
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Time-limited download links via secure Stripe checkout.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-secondary/10 p-1.5 rounded-lg shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Instant Delivery
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Link sent directly to your email instantly. No signup.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>

          {purchased !== "true" && (
            <CardFooter className="bg-slate-50 p-6 sm:px-10 sm:py-8 flex flex-col gap-5 border-t border-slate-100">
              {portal.isActive ? (
                <form action="/api/checkout" method="POST" className="w-full">
                  <input type="hidden" name="portalId" value={portal.id} />
                  <Button
                    type="submit"
                    variant="accent"
                    className="w-full h-14 text-lg flex items-center justify-center gap-2"
                    disabled={docs.length === 0}
                  >
                    Purchase Bundle &mdash; $
                    {(portal.priceInCents / 100).toFixed(2)}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </form>
              ) : (
                <div className="w-full text-center py-4 px-6 rounded-xl bg-slate-100 border border-slate-200">
                  <p className="text-slate-500 text-sm font-medium">
                    This portal is currently unavailable.
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    Please check back later or contact the portal owner.
                  </p>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Lock className="w-3.5 h-3.5" />
                <span>Secure, encrypted checkout via Stripe</span>
              </div>
            </CardFooter>
          )}
        </Card>
      </main>

      <footer className="w-full py-8 text-center text-slate-400 text-sm">
        <p>
          &copy; {new Date().getFullYear()} {portal.name}
        </p>
      </footer>
    </div>
  );
}

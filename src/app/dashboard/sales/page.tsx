import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { portals, downloadSessions, user } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { appConfig } from "@/config";
import { Button, buttonVariants } from "@/components/ui/button";
import { ExternalLink, DollarSign, PlusCircle, ArrowLeft } from "lucide-react";
import { Link } from "next-view-transitions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

import { StripeConnectButton } from "@/components/stripe-connect-button";

export default async function SalesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  // Fetch the user to check Stripe connection
  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!dbUser?.stripeAccountId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] max-w-md mx-auto text-center space-y-6">
        <div className="bg-slate-100 p-4 rounded-full">
          <DollarSign className="w-10 h-10 text-secondary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Start Selling Documents
          </h2>
          <p className="text-foreground-muted mb-6 leading-relaxed">
            Connect your Stripe account to start accepting payments and view
            your sales history here.
          </p>
          <StripeConnectButton variant="secondary">
            Connect Stripe Account
            <ExternalLink className="ml-2 w-4 h-4 inline-block" />
          </StripeConnectButton>
        </div>
      </div>
    );
  }

  // Fetch all successful sales (download sessions) for this user's portals
  const sales = await db
    .select({
      id: downloadSessions.id,
      buyerEmail: downloadSessions.email,
      date: downloadSessions.createdAt,
      portalName: portals.name,
      amountInCents: downloadSessions.amountInCents,
      portalPrice: portals.priceInCents,
    })
    .from(downloadSessions)
    .innerJoin(portals, eq(downloadSessions.portalId, portals.id))
    .where(eq(portals.userId, session.user.id))
    .orderBy(desc(downloadSessions.createdAt));

  const feePercentage = appConfig.platformFeePercentage;

  const totalGross = sales.reduce((acc, sale) => acc + (sale.amountInCents ?? sale.portalPrice), 0);
  const totalFees = sales.reduce(
    (acc, sale) => acc + Math.round((sale.amountInCents ?? sale.portalPrice) * (feePercentage / 100)),
    0,
  );
  const totalNet = totalGross - totalFees;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">
          Sales
        </h1>
      </div>

      {sales.length === 0 ? (
        <div className="border border-slate-200 rounded-xl bg-white p-12 text-center flex flex-col items-center">
          <div className="bg-slate-50 p-4 rounded-full mb-4">
            <DollarSign className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No sales yet
          </h3>
          <p className="text-slate-500 max-w-sm mb-6">
            When you sell a document bundle, the transaction details will appear
            here.
          </p>
          <Link
            href="/dashboard"
            className={buttonVariants({
              variant: "secondary",
            })}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Table header section */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 px-6 py-5 border-b border-border">
            <div>
              <h2 className="text-base font-semibold text-foreground">Transactions</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                A list of all your recent sales including document, buyer, and earnings breakdown.
              </p>
            </div>
            <Link
              href="/api/stripe/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              View in Stripe
              <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[180px]">Date</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Platform Fee</TableHead>
                <TableHead className="text-right">Net Earned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => {
                const feePercentage = appConfig.platformFeePercentage;
                const grossAmount = sale.amountInCents ?? sale.portalPrice;
                const platformFee = Math.round(
                  grossAmount * (feePercentage / 100),
                );
                const netEarned = grossAmount - platformFee;

                return (
                  <TableRow key={sale.id}>
                    <TableCell className="text-muted-foreground">
                      {formatDate(sale.date)}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {sale.portalName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {sale.buyerEmail}
                    </TableCell>
                    <TableCell className="text-right text-foreground">
                      {formatCurrency(grossAmount)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      -{formatCurrency(platformFee)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-success">
                      {formatCurrency(netEarned)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-right font-medium text-foreground"
                >
                  Totals
                </TableCell>
                <TableCell className="text-right font-medium text-foreground">
                  {formatCurrency(totalGross)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground font-medium">
                  -{formatCurrency(totalFees)}
                </TableCell>
                <TableCell className="text-right font-medium text-success">
                  {formatCurrency(totalNet)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
    </div>
  );
}

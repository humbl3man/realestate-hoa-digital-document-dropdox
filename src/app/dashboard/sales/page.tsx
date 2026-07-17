import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { portals, downloadSessions, user } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { appConfig } from "@/config";
import { Button, buttonVariants } from "@/components/ui/button";
import { ExternalLink, DollarSign, PlusCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
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
      grossAmount: portals.priceInCents,
    })
    .from(downloadSessions)
    .innerJoin(portals, eq(downloadSessions.portalId, portals.id))
    .where(eq(portals.userId, session.user.id))
    .orderBy(desc(downloadSessions.createdAt));

  const feePercentage = appConfig.platformFeePercentage;

  const totalGross = sales.reduce((acc, sale) => acc + sale.grossAmount, 0);
  const totalFees = sales.reduce(
    (acc, sale) => acc + Math.round(sale.grossAmount * (feePercentage / 100)),
    0,
  );
  const totalNet = totalGross - totalFees;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-slate-900">
            Sales
          </h1>
          <p className="text-slate-500 mt-1">
            View your recent transactions and earnings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/api/stripe/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "ghost" })}
          >
            View in Stripe
            <ExternalLink className="w-4 h-4 ml-2" />
          </Link>
        </div>
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
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
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
                const platformFee = Math.round(
                  sale.grossAmount * (feePercentage / 100),
                );
                const netEarned = sale.grossAmount - platformFee;

                return (
                  <TableRow
                    key={sale.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <TableCell className="text-slate-500 text-sm">
                      {formatDate(sale.date)}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {sale.portalName}
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {sale.buyerEmail}
                    </TableCell>
                    <TableCell className="text-right text-slate-900">
                      {formatCurrency(sale.grossAmount)}
                    </TableCell>
                    <TableCell className="text-right text-slate-500 text-sm">
                      -{formatCurrency(platformFee)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-emerald-600">
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
                  className="text-right font-medium text-slate-900"
                >
                  Totals
                </TableCell>
                <TableCell className="text-right font-medium text-slate-900">
                  {formatCurrency(totalGross)}
                </TableCell>
                <TableCell className="text-right text-slate-500 font-medium">
                  -{formatCurrency(totalFees)}
                </TableCell>
                <TableCell className="text-right font-medium text-emerald-600">
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

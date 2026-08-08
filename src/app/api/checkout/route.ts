import { NextRequest, NextResponse } from "next/server";
import { PurchaseFlow } from "@/core/purchase";

export async function POST(req: NextRequest) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const formData = await req.formData();
    const portalId = formData.get("portalId") as string | null;

    const referer = req.headers.get("referer");
    const fallbackErrorRedirect = (errorCode: string) => {
      if (referer) {
        const url = new URL(referer);
        url.searchParams.set("error", errorCode);
        return NextResponse.redirect(url.toString(), { status: 303 });
      }
      return new NextResponse(`Checkout Error: ${errorCode}`, { status: 400 });
    };

    if (!portalId) {
      return fallbackErrorRedirect("not-found");
    }

    const result = await PurchaseFlow.createCheckoutSession(portalId, appUrl);

    if (!result.success) {
      if (result.reason === "not-found") {
        return fallbackErrorRedirect("not-found");
      }
      if (result.reason === "unavailable" || result.reason === "not-connected") {
        // Fallback assuming the referer has the slug or redirecting back isn't easy here without slug
        // Actually we used to redirect to /p/${portal.slug}?error=... 
        // We can just rely on fallbackErrorRedirect since the referer is usually the public page anyway
        return fallbackErrorRedirect(result.reason);
      }
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    // 303 redirection is standard for form post redirects
    return NextResponse.redirect(result.url, { status: 303 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Stripe session creation error:", err);
    return new NextResponse(message, { status: 500 });
  }
}

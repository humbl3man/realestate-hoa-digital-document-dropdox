import { NextRequest, NextResponse } from "next/server";
import { DocumentBundle } from "@/core/document-bundle";

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;

    if (!token) {
      return new NextResponse("Token is required", { status: 400 });
    }

    const result = await DocumentBundle.generateForSession(token);

    if (!result.success) {
      switch (result.reason) {
        case "invalid-token":
          return new NextResponse("Invalid or expired download link", { status: 404 });
        case "expired":
          return new NextResponse("This download link has expired (valid for 48 hours only)", { status: 403 });
        case "not-found":
          return new NextResponse("Portal not found", { status: 404 });
        case "empty":
          return new NextResponse("No files found in this portal bundle", { status: 404 });
        case "storage-error":
        default:
          return new NextResponse("Internal Server Error during download packaging", { status: 500 });
      }
    }

    return new Response(result.buffer as any, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
      },
    });
  } catch (err: any) {
    console.error("Secure download proxy error:", err);
    return new NextResponse(err?.message || "Internal Server Error during download packaging", { status: 500 });
  }
}

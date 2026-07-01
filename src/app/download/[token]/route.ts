import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { downloadSessions, portals, documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { supabase, BUCKET_NAME } from "@/lib/supabase";
import JSZip from "jszip";

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;

    if (!token) {
      return new NextResponse("Token is required", { status: 400 });
    }

    // Fetch the download session
    const [session] = await db
      .select()
      .from(downloadSessions)
      .where(eq(downloadSessions.id, token))
      .limit(1);

    if (!session) {
      return new NextResponse("Invalid or expired download link", { status: 404 });
    }

    // Check expiration (48 hours)
    if (new Date() > session.expiresAt) {
      return new NextResponse("This download link has expired (valid for 48 hours only)", { status: 403 });
    }

    // Fetch portal metadata
    const [portal] = await db
      .select()
      .from(portals)
      .where(eq(portals.id, session.portalId))
      .limit(1);

    if (!portal) {
      return new NextResponse("Portal not found", { status: 404 });
    }

    // Fetch documents associated with portal
    const docs = await db
      .select()
      .from(documents)
      .where(eq(documents.portalId, session.portalId));

    if (docs.length === 0) {
      return new NextResponse("No files found in this portal bundle", { status: 404 });
    }

    const zip = new JSZip();

    // Download each file from Supabase and append to ZIP
    for (const doc of docs) {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(doc.storagePath);

      if (error || !data) {
        console.error(`Failed to download ${doc.storagePath} from Supabase:`, error);
        throw new Error(`Failed to retrieve file: ${doc.fileName}`);
      }

      // Convert Blob to ArrayBuffer then Buffer
      const arrayBuffer = await data.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      zip.file(doc.fileName, fileBuffer);
    }

    // Generate zip buffer as a standard Uint8Array and cast as any to bypass TS generic issue
    const zipUint8Array = await zip.generateAsync({ type: "uint8array" });
    const safeFilename = `${portal.slug || "documents"}-disclosures.zip`;

    return new Response(zipUint8Array as any, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
      },
    });
  } catch (err: any) {
    console.error("Secure download proxy error:", err);
    return new NextResponse(err?.message || "Internal Server Error during download packaging", { status: 500 });
  }
}

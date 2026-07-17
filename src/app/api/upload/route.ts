import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { portals, documents } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { appConfig } from "@/config";
import { uploadDocument } from "@/lib/supabase";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("file") as File[];
    const portalId = formData.get("portalId") as string | null;

    if (!files || files.length === 0 || !portalId) {
      return NextResponse.json({ error: "Missing file or portalId" }, { status: 400 });
    }

    // Verify ownership of portal
    const portal = await db
      .select()
      .from(portals)
      .where(eq(portals.id, portalId))
      .limit(1);

    if (portal.length === 0 || portal[0].userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check total documents limit
    const MAX_DOCS_PER_PORTAL = appConfig.maxDocsPerPortal;
    const docCountResult = await db
      .select({ count: count() })
      .from(documents)
      .where(eq(documents.portalId, portalId));

    if (docCountResult[0].count + files.length > MAX_DOCS_PER_PORTAL) {
      return NextResponse.json({ error: `Uploading these ${files.length} files would exceed the maximum limit of ${MAX_DOCS_PER_PORTAL} documents per portal.` }, { status: 400 });
    }

    const MAX_FILE_SIZE_MB = appConfig.maxUploadMb;
    
    // Validate all files before uploading
    for (const file of files) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        return NextResponse.json({ error: `File ${file.name} is not a valid PDF` }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        return NextResponse.json({ error: `File ${file.name} exceeds the ${MAX_FILE_SIZE_MB}MB limit` }, { status: 400 });
      }
    }

    // Upload and save all valid files
    for (const file of files) {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const fileId = randomUUID();
      const storagePath = `portals/${portalId}/${fileId}-${file.name}`;

      // Upload to Supabase
      await uploadDocument(storagePath, fileBuffer, file.type);

      // Save to Database
      await db.insert(documents).values({
        id: fileId,
        portalId: portalId,
        storagePath: storagePath,
        fileName: file.name,
        fileSize: file.size,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 });
  }
}

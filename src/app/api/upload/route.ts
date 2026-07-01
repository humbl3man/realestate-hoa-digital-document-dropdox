import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { portals, documents } from "@/db/schema";
import { eq } from "drizzle-orm";
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
    const file = formData.get("file") as File | null;
    const portalId = formData.get("portalId") as string | null;

    if (!file || !portalId) {
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

    // Standard check: only PDFs
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

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

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 });
  }
}

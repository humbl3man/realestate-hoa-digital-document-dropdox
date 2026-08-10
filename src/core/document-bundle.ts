import { db } from "@/db";
import { downloadSessions, portals, documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { supabase, BUCKET_NAME } from "@/lib/supabase";
import JSZip from "jszip";

export type GenerateBundleResult =
  | { success: true; buffer: Uint8Array; filename: string }
  | {
      success: false;
      reason:
        | "invalid-token"
        | "expired"
        | "not-found"
        | "empty"
        | "storage-error";
    };

export const DocumentBundle = {
  async generateForSession(token: string): Promise<GenerateBundleResult> {
    try {
      // Fetch the download session
      const [session] = await db
        .select()
        .from(downloadSessions)
        .where(eq(downloadSessions.id, token))
        .limit(1);

      if (!session) {
        return { success: false, reason: "invalid-token" };
      }

      // Check expiration
      if (new Date() > session.expiresAt) {
        return { success: false, reason: "expired" };
      }

      // Fetch portal metadata
      const [portal] = await db
        .select()
        .from(portals)
        .where(eq(portals.id, session.portalId))
        .limit(1);

      if (!portal) {
        return { success: false, reason: "not-found" };
      }

      // Fetch documents associated with portal
      const docs = await db
        .select()
        .from(documents)
        .where(eq(documents.portalId, session.portalId));

      if (docs.length === 0) {
        return { success: false, reason: "empty" };
      }

      const zip = new JSZip();

      // Download each file from Supabase and append to ZIP
      for (const doc of docs) {
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .download(doc.storagePath);

        if (error || !data) {
          console.error(
            `Failed to download ${doc.storagePath} from Supabase:`,
            error
          );
          return { success: false, reason: "storage-error" };
        }

        // Convert Blob to ArrayBuffer then Buffer
        const arrayBuffer = await data.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        zip.file(doc.fileName, fileBuffer);
      }

      // Generate zip buffer as a standard Uint8Array
      const zipUint8Array = await zip.generateAsync({ type: "uint8array" });
      const filename = `${portal.slug || "documents"}-disclosures.zip`;

      return { success: true, buffer: zipUint8Array, filename };
    } catch (err: any) {
      console.error("DocumentBundle generation error:", err);
      return { success: false, reason: "storage-error" };
    }
  },
};

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder_service_role_key";

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

export const BUCKET_NAME = process.env.SUPABASE_BUCKET || "hoa-documents";

export async function uploadDocument(path: string, file: Buffer, contentType: string) {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (error) throw error;
  return data;
}

export async function getSignedUrl(path: string, expiresInSeconds: number = 60) {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresInSeconds);

  if (error) throw error;
  return data.signedUrl;
}

export async function deleteDocument(path: string) {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) throw error;
  return data;
}

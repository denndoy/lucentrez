import { NextRequest, NextResponse } from "next/server";
import { logBackendError, requireAdminAccess } from "@/lib/api";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FOLDERS = new Set(["products", "gallery", "hero-slides", "uploads"]);
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

function sanitizeFilename(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-");
}

export async function POST(request: NextRequest) {
  const authError = requireAdminAccess(request);
  if (authError) {
    return authError;
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "uploads");
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "media";

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Missing file" }, { status: 400 });
  }

  if (!ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json({ message: "Invalid upload folder" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ message: "File too large (max 5MB)" }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ message: "Unsupported file type" }, { status: 400 });
  }

  const safeName = sanitizeFilename(file.name || "upload");
  const path = `${folder}/${Date.now()}-${safeName}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    logBackendError("admin.upload", uploadError, { folder, filename: safeName, mimeType: file.type });
    return NextResponse.json({ message: "Upload failed", error: uploadError.message }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

  return NextResponse.json({ url: data.publicUrl, path }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logBackendError, parseJsonBody, requireAdminAccess } from "@/lib/api";
import { invalidateContactSettingsCache } from "@/lib/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

const contactSettingsSchema = z.object({
  whatsappNumber: z.string().min(5),
  instagramUrl: z.string().url(),
});

export async function GET(request: NextRequest) {
  const authError = requireAdminAccess(request, { enforceOrigin: false });
  if (authError) {
    return authError;
  }

  const { data, error } = await supabaseAdmin
    .from("contact_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    return NextResponse.json({
      whatsappNumber: "6281234567890",
      instagramUrl: "https://instagram.com",
    });
  }

  return NextResponse.json({
    whatsappNumber: data.whatsapp_number,
    instagramUrl: data.instagram_url,
  });
}

export async function PUT(request: NextRequest) {
  const authError = requireAdminAccess(request);
  if (authError) {
    return authError;
  }

  const json = await parseJsonBody<unknown>(request);
  if (!json) {
    return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = contactSettingsSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload", errors: parsed.error.issues }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("contact_settings")
    .upsert({
      id: 1,
      whatsapp_number: parsed.data.whatsappNumber,
      instagram_url: parsed.data.instagramUrl,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

  if (error) {
    logBackendError("admin.contact-settings.update", error);
    return NextResponse.json({ message: "Failed to update contact settings", error: error.message }, { status: 500 });
  }

  await invalidateContactSettingsCache();

  return NextResponse.json({ ok: true });
}

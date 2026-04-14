import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

const contactSettingsSchema = z.object({
  whatsappNumber: z.string().min(5),
  instagramUrl: z.string().url(),
});

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
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
    return NextResponse.json({ message: "Failed to update contact settings", error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

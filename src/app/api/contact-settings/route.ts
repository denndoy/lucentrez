import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

const contactSettingsSchema = z.object({
  whatsappNumber: z.string().min(5),
  instagramUrl: z.string().url(),
});

// Public GET - no auth required for reading contact settings
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("contact_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    // Return default values if no settings found
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

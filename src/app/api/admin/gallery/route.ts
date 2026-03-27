import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const gallerySchema = z.object({
  title: z.string().min(2),
  imageUrl: z.string().url(),
});

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { data: gallery, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: "Failed to fetch gallery", error: error.message }, { status: 500 });
  }

  return NextResponse.json({ gallery });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = gallerySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload", errors: parsed.error.issues }, { status: 400 });
  }

  const { data: image, error } = await supabase
    .from("gallery_images")
    .insert([{ title: parsed.data.title, image_url: parsed.data.imageUrl }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: "Failed to create gallery item", error: error.message }, { status: 500 });
  }

  return NextResponse.json({ image }, { status: 201 });
}

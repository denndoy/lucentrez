import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { isAdminRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

const gallerySchema = z.object({
  title: z.string().min(2).optional(),
  imageUrl: z.string().url(),
});

function buildAutoTitle(imageUrl: string, prefix: string) {
  const url = new URL(imageUrl);
  const baseName = url.pathname.split("/").filter(Boolean).pop()?.replace(/\.[^.]+$/, "") ?? "image";
  const readable = baseName.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim() || "image";
  const suffix = createHash("sha1").update(imageUrl).digest("hex").slice(0, 6);
  return `${prefix} ${readable} ${suffix}`;
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { data: gallery, error } = await supabaseAdmin
    .from("gallery_images")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: "Failed to fetch gallery", error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    gallery: (gallery || []).map((item) => ({
      id: item.id,
      title: item.title,
      imageUrl: item.image_url,
      createdAt: item.created_at,
    })),
  });
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

  const title = parsed.data.title?.trim() || buildAutoTitle(parsed.data.imageUrl, "Gallery");

  const { data: image, error } = await supabaseAdmin
    .from("gallery_images")
    .insert([{ title, image_url: parsed.data.imageUrl }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: "Failed to create gallery item", error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    image: {
      id: image.id,
      title: image.title,
      imageUrl: image.image_url,
      createdAt: image.created_at,
    },
  }, { status: 201 });
}

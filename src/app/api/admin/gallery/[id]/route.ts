import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Params = {
  params: Promise<{ id: string }>;
};

const gallerySchema = z.object({
  title: z.string().min(2).optional(),
  imageUrl: z.string().url(),
});

function buildAutoTitle(imageUrl: string, prefix: string) {
  const url = new URL(imageUrl);
  const baseName = url.pathname.split("/").filter(Boolean).pop()?.replace(/\.[^.]+$/, "") ?? "image";
  const readable = baseName.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim() || "image";
  return `${prefix} ${readable}`;
}

const idSchema = z.string().uuid();

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ message: "Invalid gallery id" }, { status: 400 });
  }
  const json = await request.json();
  const parsed = gallerySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload", errors: parsed.error.issues }, { status: 400 });
  }

  const { data: image, error } = await supabaseAdmin
    .from("gallery_images")
    .update({
      title: parsed.data.title?.trim() || buildAutoTitle(parsed.data.imageUrl, "Gallery"),
      image_url: parsed.data.imageUrl,
    })
    .eq("id", parsedId.data)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: "Failed to update gallery item", error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    image: {
      id: image.id,
      title: image.title,
      imageUrl: image.image_url,
      createdAt: image.created_at,
    },
  });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ message: "Invalid gallery id" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("gallery_images").delete().eq("id", parsedId.data);

  if (error) {
    return NextResponse.json({ message: "Failed to delete gallery item", error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

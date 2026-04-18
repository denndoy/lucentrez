import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logBackendError, parseJsonBody, requireAdminAccess } from "@/lib/api";
import { invalidateHeroSlidesCache } from "@/lib/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Params = {
  params: Promise<{ id: string }>;
};

const heroSlideSchema = z.object({
  title: z.string().min(2).optional(),
  imageUrl: z.string().url(),
});

function buildAutoTitle(imageUrl: string, prefix: string) {
  const url = new URL(imageUrl);
  const baseName = url.pathname.split("/").filter(Boolean).pop()?.replace(/\.[^.]+$/, "") ?? "slide";
  const readable = baseName.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim() || "slide";
  return `${prefix} ${readable}`;
}

const idSchema = z.string().uuid();

export async function PATCH(request: NextRequest, { params }: Params) {
  const authError = requireAdminAccess(request);
  if (authError) {
    return authError;
  }

  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ message: "Invalid hero slide id" }, { status: 400 });
  }
  const json = await parseJsonBody<unknown>(request);
  if (!json) {
    return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = heroSlideSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload", errors: parsed.error.issues }, { status: 400 });
  }

  const { data: slide, error } = await supabaseAdmin
    .from("hero_slides")
    .update({
      title: parsed.data.title?.trim() || buildAutoTitle(parsed.data.imageUrl, "Slide"),
      image_url: parsed.data.imageUrl,
    })
    .eq("id", parsedId.data)
    .select()
    .single();

  if (error) {
    logBackendError("admin.hero-slides.update", error, { slideId: parsedId.data });
    return NextResponse.json({ message: "Failed to update hero slide", error: error.message }, { status: 500 });
  }

  await invalidateHeroSlidesCache();

  return NextResponse.json({
    slide: {
      id: slide.id,
      title: slide.title,
      imageUrl: slide.image_url,
      createdAt: slide.created_at,
    },
  });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const authError = requireAdminAccess(request);
  if (authError) {
    return authError;
  }

  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ message: "Invalid hero slide id" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("hero_slides").delete().eq("id", parsedId.data);

  if (error) {
    logBackendError("admin.hero-slides.delete", error, { slideId: parsedId.data });
    return NextResponse.json({ message: "Failed to delete hero slide", error: error.message }, { status: 500 });
  }

  await invalidateHeroSlidesCache();

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { logBackendError, parseJsonBody, requireAdminAccess } from "@/lib/api";
import { invalidateHeroSlidesCache } from "@/lib/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

const heroSlideSchema = z.object({
  title: z.string().min(2).optional(),
  imageUrl: z.string().url(),
});

function buildAutoTitle(imageUrl: string, prefix: string) {
  const url = new URL(imageUrl);
  const baseName = url.pathname.split("/").filter(Boolean).pop()?.replace(/\.[^.]+$/, "") ?? "slide";
  const readable = baseName.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim() || "slide";
  const suffix = createHash("sha1").update(imageUrl).digest("hex").slice(0, 6);
  return `${prefix} ${readable} ${suffix}`;
}

export async function GET(request: NextRequest) {
  const authError = requireAdminAccess(request, { enforceOrigin: false });
  if (authError) {
    return authError;
  }

  const { data: slides, error } = await supabaseAdmin
    .from("hero_slides")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: "Failed to fetch hero slides", error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    slides: (slides || []).map((item) => ({
      id: item.id,
      title: item.title,
      imageUrl: item.image_url,
      createdAt: item.created_at,
    })),
  });
}

export async function POST(request: NextRequest) {
  const authError = requireAdminAccess(request);
  if (authError) {
    return authError;
  }

  const json = await parseJsonBody<unknown>(request);
  if (!json) {
    return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = heroSlideSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload", errors: parsed.error.issues }, { status: 400 });
  }

  const title = parsed.data.title?.trim() || buildAutoTitle(parsed.data.imageUrl, "Slide");

  const { data: slide, error } = await supabaseAdmin
    .from("hero_slides")
    .insert([{ title, image_url: parsed.data.imageUrl }])
    .select()
    .single();

  if (error) {
    logBackendError("admin.hero-slides.create", error, { title });
    return NextResponse.json({ message: "Failed to create hero slide", error: error.message }, { status: 500 });
  }

  await invalidateHeroSlidesCache();

  return NextResponse.json(
    {
      slide: {
        id: slide.id,
        title: slide.title,
        imageUrl: slide.image_url,
        createdAt: slide.created_at,
      },
    },
    { status: 201 },
  );
}

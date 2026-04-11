import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Params = {
  params: Promise<{ id: string }>;
};

const heroSlideSchema = z.object({
  title: z.string().min(2),
  imageUrl: z.string().url(),
});

const idSchema = z.string().uuid();

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ message: "Invalid hero slide id" }, { status: 400 });
  }
  const json = await request.json();
  const parsed = heroSlideSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload", errors: parsed.error.issues }, { status: 400 });
  }

  const { data: slide, error } = await supabaseAdmin
    .from("hero_slides")
    .update({ title: parsed.data.title, image_url: parsed.data.imageUrl })
    .eq("id", parsedId.data)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: "Failed to update hero slide", error: error.message }, { status: 500 });
  }

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
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ message: "Invalid hero slide id" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("hero_slides").delete().eq("id", parsedId.data);

  if (error) {
    return NextResponse.json({ message: "Failed to delete hero slide", error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

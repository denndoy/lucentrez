import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

const productSchema = z.object({
  name: z.string().min(2),
  price: z.number().int().positive(),
  description: z.string().min(10),
  images: z.array(z.string().url()).min(1),
  shopeeUrl: z.string().url(),
  category: z.string().min(2).optional(),
});

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const json = await request.json();
  const parsed = productSchema.safeParse({
    ...json,
    price: Number(json.price),
  });

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload", errors: parsed.error.issues }, { status: 400 });
  }

  const { data: product, error } = await supabaseAdmin
    .from("products")
    .update({
      name: parsed.data.name,
      price: parsed.data.price,
      description: parsed.data.description,
      images: parsed.data.images,
      shopeeUrl: parsed.data.shopeeUrl,
      category: parsed.data.category ?? "Tops",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: "Failed to update product", error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ message: "Failed to delete product", error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

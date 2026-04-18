import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logBackendError, parseJsonBody, requireAdminAccess } from "@/lib/api";
import { invalidateProductsCache } from "@/lib/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

const productSchema = z.object({
  name: z.string().min(2),
  price: z.number().int().positive(),
  description: z.string().min(10),
  images: z.array(z.string().url()).min(1),
  hoverImage: z.string().url().nullable().optional(),
  shopeeUrl: z.string().url(),
  category: z.string().min(2).optional(),
  soldOut: z.boolean().optional(),
});

const idSchema = z.string().uuid();

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: Params) {
  const authError = requireAdminAccess(request);
  if (authError) {
    return authError;
  }

  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
  }
  const json = await parseJsonBody<Record<string, unknown>>(request);
  if (!json) {
    return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

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
      hover_image: parsed.data.hoverImage ?? null,
      shopeeurl: parsed.data.shopeeUrl,
      category: parsed.data.category ?? "Tops",
      sold_out: parsed.data.soldOut ?? false,
    })
    .eq("id", parsedId.data)
    .select()
    .single();

  if (error) {
    logBackendError("admin.products.update", error, { productId: parsedId.data });
    return NextResponse.json({ message: "Failed to update product", error: error.message }, { status: 500 });
  }

  await invalidateProductsCache();

  return NextResponse.json({ product });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const authError = requireAdminAccess(request);
  if (authError) {
    return authError;
  }

  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("products").delete().eq("id", parsedId.data);

  if (error) {
    logBackendError("admin.products.delete", error, { productId: parsedId.data });
    return NextResponse.json({ message: "Failed to delete product", error: error.message }, { status: 500 });
  }

  await invalidateProductsCache();

  return NextResponse.json({ ok: true });
}

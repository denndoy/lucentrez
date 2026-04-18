import slugify from "slugify";
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

export async function GET(request: NextRequest) {
  const authError = requireAdminAccess(request, { enforceOrigin: false });
  if (authError) {
    return authError;
  }

  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: "Failed to fetch products", error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    products: (products || []).map((product) => ({
      ...product,
      images: Array.isArray(product.images) ? product.images : [],
      hoverImage: product.hover_image ?? null,
      shopeeUrl: product.shopeeurl,
      inStock: !Boolean(product.sold_out ?? false),
    })),
  });
}

export async function POST(request: NextRequest) {
  const authError = requireAdminAccess(request);
  if (authError) {
    return authError;
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

  const slugBase = slugify(parsed.data.name, { lower: true, strict: true });
  const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;

  const { data: product, error } = await supabaseAdmin
    .from("products")
    .insert([
      {
        name: parsed.data.name,
        slug,
        price: parsed.data.price,
        description: parsed.data.description,
        images: parsed.data.images,
        hover_image: parsed.data.hoverImage ?? null,
        shopeeurl: parsed.data.shopeeUrl,
        category: parsed.data.category ?? "Tops",
        sold_out: parsed.data.soldOut ?? false,
      },
    ])
    .select()
    .single();

  if (error) {
    logBackendError("admin.products.create", error, { slug });
    return NextResponse.json({ message: "Failed to create product", error: error.message }, { status: 500 });
  }

  await invalidateProductsCache();

  return NextResponse.json({ product }, { status: 201 });
}

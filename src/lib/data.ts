import { supabase } from "@/lib/supabase";
import { fallbackGallery, fallbackProducts } from "@/lib/mock-data";
import { formatRupiah } from "@/lib/format";
import { GalleryItem, ProductView } from "@/lib/types";

function toProductView(product: {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  images: unknown;
  shopeeUrl: string;
  category: string;
  created_at: string;
}): ProductView {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    description: product.description,
    images: Array.isArray(product.images)
      ? product.images.filter((item): item is string => typeof item === "string")
      : [],
    shopeeUrl: product.shopeeUrl,
    category: product.category,
    createdAt: new Date(product.created_at),
  };
}

export async function getAllProducts(): Promise<ProductView[]> {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!products || products.length === 0) {
      return fallbackProducts;
    }

    const remoteProducts = products.map(toProductView);

    // Keep Supabase products first, then fill with fallback items when data is sparse.
    const mergedProducts = [...remoteProducts, ...fallbackProducts].filter(
      (product, index, list) => list.findIndex((item) => item.slug === product.slug) === index,
    );

    return mergedProducts;
  } catch {
    return fallbackProducts;
  }
}

export async function getFeaturedProducts(): Promise<ProductView[]> {
  const products = await getAllProducts();
  return products.slice(0, 4);
}

export async function getProductBySlug(slug: string): Promise<ProductView | null> {
  try {
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    if (!product) {
      return fallbackProducts.find((item) => item.slug === slug) ?? null;
    }
    return toProductView(product);
  } catch {
    return fallbackProducts.find((item) => item.slug === slug) ?? null;
  }
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const { data: gallery, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!gallery || gallery.length === 0) {
      return fallbackGallery;
    }
    return gallery.map((item) => ({
      id: item.id,
      title: item.title,
      imageUrl: item.image_url,
      createdAt: new Date(item.created_at),
    }));
  } catch {
    return fallbackGallery;
  }
}

export { formatRupiah };

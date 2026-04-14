import { supabase } from "@/lib/supabase";
import { unstable_noStore as noStore } from "next/cache";
import { fallbackGallery } from "@/lib/mock-data";
import { formatRupiah } from "@/lib/format";
import { GalleryItem, HeroSlide, ProductView } from "@/lib/types";

function normalizeGalleryImageUrl(imageUrl: unknown, title: unknown, index: number): string {
  const fallbackByTitle = new Map(
    fallbackGallery.map((item) => [item.title.toLowerCase(), item.imageUrl]),
  );

  const safeUrl = typeof imageUrl === "string" ? imageUrl.trim() : "";
  if (safeUrl && !safeUrl.startsWith("/gallery/")) {
    return safeUrl;
  }

  const safeTitle = typeof title === "string" ? title.trim().toLowerCase() : "";
  const byTitle = safeTitle ? fallbackByTitle.get(safeTitle) : undefined;
  if (byTitle) {
    return byTitle;
  }

  return fallbackGallery[index % fallbackGallery.length]?.imageUrl ?? "";
}

function toProductView(product: {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  images: unknown;
  hover_image?: string | null;
  hoverImage?: string | null;
  shopeeurl?: string;
  shopeeUrl?: string;
  category: string;
  sold_out?: boolean;
  soldOut?: boolean;
  created_at: string;
}): ProductView {
  const soldOut = Boolean(product.sold_out ?? product.soldOut ?? false);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    description: product.description,
    images: Array.isArray(product.images)
      ? product.images.filter((item): item is string => typeof item === "string")
      : [],
    hoverImage: product.hover_image ?? product.hoverImage ?? null,
    shopeeUrl: product.shopeeurl ?? product.shopeeUrl ?? "https://shopee.co.id/",
    category: product.category,
    inStock: !soldOut,
    createdAt: new Date(product.created_at),
  };
}

export async function getAllProducts(): Promise<ProductView[]> {
  noStore();
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!products || products.length === 0) {
      return [];
    }

    return products.map(toProductView);
  } catch {
    return [];
  }
}

export async function getFeaturedProducts(): Promise<ProductView[]> {
  const products = await getAllProducts();
  return products.slice(0, 4);
}

export async function getProductBySlug(slug: string): Promise<ProductView | null> {
  noStore();
  try {
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    if (!product) {
      return null;
    }
    return toProductView(product);
  } catch {
    return null;
  }
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  noStore();
  try {
    const { data: gallery, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!gallery || gallery.length === 0) {
      return [];
    }
    return gallery.map((item, index) => ({
      id: item.id,
      title: item.title,
      imageUrl: normalizeGalleryImageUrl(item.image_url, item.title, index),
      createdAt: new Date(item.created_at),
    }));
  } catch {
    return [];
  }
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  noStore();
  try {
    const { data: slides, error } = await supabase
      .from("hero_slides")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!slides || slides.length === 0) {
      return [];
    }

    return slides.map((item) => ({
      id: item.id,
      title: item.title,
      imageUrl: item.image_url,
      createdAt: new Date(item.created_at),
    }));
  } catch {
    return [];
  }
}

export type ContactSettings = {
  whatsappNumber: string;
  instagramUrl: string;
};

export async function getContactSettings(): Promise<ContactSettings> {
  noStore();
  try {
    const { data, error } = await supabase
      .from("contact_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) throw error;
    if (!data) {
      return {
        whatsappNumber: "6281234567890",
        instagramUrl: "https://instagram.com",
      };
    }

    return {
      whatsappNumber: data.whatsapp_number,
      instagramUrl: data.instagram_url,
    };
  } catch {
    return {
      whatsappNumber: "6281234567890",
      instagramUrl: "https://instagram.com",
    };
  }
}

export { formatRupiah };

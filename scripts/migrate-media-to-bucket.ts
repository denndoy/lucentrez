import "dotenv/config";
import { createHash } from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";

type ProductRow = {
  id: string;
  images: unknown;
};

type GalleryRow = {
  id: string;
  image_url: string;
};

type HeroRow = {
  id: string;
  image_url: string;
};

type SourceAsset = {
  bytes: ArrayBuffer;
  contentType: string;
  ext: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "media";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const bucketMarker = `/storage/v1/object/public/${bucket}/`;
const sourceToBucketUrl = new Map<string, string>();

function isBucketUrl(url: string): boolean {
  return url.includes(bucketMarker);
}

function getExtFromContentType(contentType: string): string {
  const lowered = contentType.toLowerCase();
  if (lowered.includes("image/jpeg") || lowered.includes("image/jpg")) return "jpg";
  if (lowered.includes("image/png")) return "png";
  if (lowered.includes("image/webp")) return "webp";
  if (lowered.includes("image/gif")) return "gif";
  if (lowered.includes("image/svg+xml")) return "svg";
  return "bin";
}

function getExtFromPath(urlOrPath: string): string {
  const clean = urlOrPath.split("?")[0].split("#")[0];
  const ext = path.extname(clean).replace(".", "").toLowerCase();
  return ext || "bin";
}

function detectContentTypeFromExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

function hashSource(value: string): string {
  return createHash("sha1").update(value).digest("hex").slice(0, 16);
}

async function readSourceAsset(sourceUrl: string): Promise<SourceAsset> {
  if (sourceUrl.startsWith("http://") || sourceUrl.startsWith("https://")) {
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to download '${sourceUrl}' (${response.status})`);
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const bytes = await response.arrayBuffer();
    const ext = getExtFromContentType(contentType) || getExtFromPath(sourceUrl);

    return { bytes, contentType, ext };
  }

  if (sourceUrl.startsWith("/")) {
    const relativePath = sourceUrl.replace(/^\/+/, "");
    const diskPath = path.join(process.cwd(), "public", relativePath);
    const buffer = await readFile(diskPath);
    const ext = getExtFromPath(sourceUrl);
    const contentType = detectContentTypeFromExt(ext);
    return { bytes: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength), contentType, ext };
  }

  throw new Error(`Unsupported source URL '${sourceUrl}'`);
}

async function uploadFromSource(sourceUrl: string, tableFolder: string, rowId: string): Promise<string> {
  const cached = sourceToBucketUrl.get(sourceUrl);
  if (cached) {
    return cached;
  }

  const source = await readSourceAsset(sourceUrl);
  const sourceHash = hashSource(sourceUrl);
  const objectPath = `${tableFolder}/${rowId}/${sourceHash}.${source.ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(objectPath, source.bytes, {
      contentType: source.contentType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Upload failed for '${sourceUrl}': ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  sourceToBucketUrl.set(sourceUrl, data.publicUrl);
  return data.publicUrl;
}

async function migrateProducts() {
  const { data, error } = await supabase.from("products").select("id,images");
  if (error) throw new Error(`Failed reading products: ${error.message}`);

  let changed = 0;
  let migratedUrls = 0;

  for (const row of (data || []) as ProductRow[]) {
    const images = Array.isArray(row.images) ? row.images.filter((value): value is string => typeof value === "string") : [];
    if (images.length === 0) continue;

    const nextImages: string[] = [];
    let rowChanged = false;

    for (const imageUrl of images) {
      if (isBucketUrl(imageUrl)) {
        nextImages.push(imageUrl);
        continue;
      }

      const uploaded = await uploadFromSource(imageUrl, "products", row.id);
      nextImages.push(uploaded);
      rowChanged = true;
      migratedUrls += 1;
    }

    if (!rowChanged) continue;

    const { error: updateError } = await supabase
      .from("products")
      .update({ images: nextImages })
      .eq("id", row.id);

    if (updateError) {
      throw new Error(`Failed updating product '${row.id}': ${updateError.message}`);
    }

    changed += 1;
  }

  return { rowsChanged: changed, urlsMigrated: migratedUrls };
}

async function migrateSimpleTable(
  table: "gallery_images" | "hero_slides",
  folder: "gallery" | "hero-slides",
) {
  const { data, error } = await supabase.from(table).select("id,image_url");
  if (error) throw new Error(`Failed reading ${table}: ${error.message}`);

  let changed = 0;
  let migratedUrls = 0;

  for (const row of (data || []) as Array<GalleryRow | HeroRow>) {
    const currentUrl = row.image_url;
    if (!currentUrl || isBucketUrl(currentUrl)) continue;

    const uploaded = await uploadFromSource(currentUrl, folder, row.id);
    const { error: updateError } = await supabase
      .from(table)
      .update({ image_url: uploaded })
      .eq("id", row.id);

    if (updateError) {
      throw new Error(`Failed updating ${table} row '${row.id}': ${updateError.message}`);
    }

    changed += 1;
    migratedUrls += 1;
  }

  return { rowsChanged: changed, urlsMigrated: migratedUrls };
}

async function verifyAllMediaInBucket() {
  const { data: products, error: pErr } = await supabase.from("products").select("images");
  const { data: gallery, error: gErr } = await supabase.from("gallery_images").select("image_url");
  const { data: slides, error: hErr } = await supabase.from("hero_slides").select("image_url");

  if (pErr || gErr || hErr) {
    throw new Error(`Verification query failed: ${pErr?.message || gErr?.message || hErr?.message}`);
  }

  const productUrls = (products || [])
    .flatMap((row: { images: unknown }) => (Array.isArray(row.images) ? row.images : []))
    .filter((value): value is string => typeof value === "string");

  const galleryUrls = (gallery || [])
    .map((row: { image_url: string }) => row.image_url)
    .filter((value): value is string => typeof value === "string" && Boolean(value));

  const slideUrls = (slides || [])
    .map((row: { image_url: string }) => row.image_url)
    .filter((value): value is string => typeof value === "string" && Boolean(value));

  const externalProducts = productUrls.filter((url) => !isBucketUrl(url));
  const externalGallery = galleryUrls.filter((url) => !isBucketUrl(url));
  const externalSlides = slideUrls.filter((url) => !isBucketUrl(url));

  return {
    products: { total: productUrls.length, bucket: productUrls.length - externalProducts.length, external: externalProducts },
    gallery: { total: galleryUrls.length, bucket: galleryUrls.length - externalGallery.length, external: externalGallery },
    heroSlides: { total: slideUrls.length, bucket: slideUrls.length - externalSlides.length, external: externalSlides },
  };
}

async function main() {
  console.log("Starting media migration to Supabase bucket:", bucket);

  const products = await migrateProducts();
  const gallery = await migrateSimpleTable("gallery_images", "gallery");
  const hero = await migrateSimpleTable("hero_slides", "hero-slides");

  const verification = await verifyAllMediaInBucket();

  console.log("\nMigration summary");
  console.log("products:", products);
  console.log("gallery_images:", gallery);
  console.log("hero_slides:", hero);

  console.log("\nVerification summary");
  console.log("products", verification.products);
  console.log("gallery", verification.gallery);
  console.log("heroSlides", verification.heroSlides);

  const hasExternal =
    verification.products.external.length > 0 ||
    verification.gallery.external.length > 0 ||
    verification.heroSlides.external.length > 0;

  if (hasExternal) {
    console.error("\nMigration incomplete: some URLs are still outside bucket.");
    process.exit(1);
  }

  console.log("\nSuccess: 100% media URLs are now in Supabase bucket.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "media";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function ensureBucket() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    throw new Error(`Failed to list buckets: ${listError.message}`);
  }

  const exists = (buckets || []).some((b) => b.name === bucketName || b.id === bucketName);

  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
    });

    if (createError) {
      throw new Error(`Failed to create bucket '${bucketName}': ${createError.message}`);
    }

    console.log(`Created bucket '${bucketName}'`);
  } else {
    const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
    });

    if (updateError) {
      throw new Error(`Bucket '${bucketName}' exists but failed to update settings: ${updateError.message}`);
    }

    console.log(`Bucket '${bucketName}' already existed, settings updated`);
  }

  const { data: finalBuckets, error: verifyError } = await supabase.storage.listBuckets();
  if (verifyError) {
    throw new Error(`Failed to verify bucket list: ${verifyError.message}`);
  }

  const target = (finalBuckets || []).find((b) => b.name === bucketName || b.id === bucketName);
  if (!target) {
    throw new Error(`Verification failed: bucket '${bucketName}' not found after operation`);
  }

  console.log("Bucket verification OK:", {
    name: target.name,
    public: target.public,
    fileSizeLimit: target.file_size_limit,
    allowedMimeTypes: target.allowed_mime_types,
  });
}

ensureBucket().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

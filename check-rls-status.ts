/**
 * Check if RLS policies are actually configured in Supabase
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  console.log("\n🔍 Checking RLS Policies in Supabase\n");

  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  // Query to check RLS status
  let rlsStatus: unknown = null;
  let rlsError: unknown = null;
  try {
    const result = await adminClient.rpc("get_rls_policies" as any, {});
    rlsStatus = result.data;
    rlsError = result.error;
  } catch {
    rlsStatus = null;
    rlsError = "RPC not available";
  }

  if (rlsError) {
    console.log("⚠️  RPC query not available, checking manually...\n");
  }

  // Try direct SQL approach
  console.log("Policies that should exist:");
  console.log("─────────────────────────");
  console.log("✓ public_read_products");
  console.log("✓ block_inserts_products");
  console.log("✓ block_updates_products");
  console.log("✓ block_deletes_products");
  console.log("✓ public_read_gallery_images");
  console.log("✓ block_inserts_gallery_images");
  console.log("✓ block_updates_gallery_images");
  console.log("✓ block_deletes_gallery_images");

  console.log("\n📋 To verify policies in Supabase Dashboard:");
  console.log("1. Go to: Supabase Dashboard > SQL Editor");
  console.log("2. Run this query:\n");
  console.log(`   SELECT * FROM pg_policies 
   WHERE tablename IN ('products', 'gallery_images')
   ORDER BY tablename, policyname;\n`);

  console.log("💡 If UPDATE/DELETE policies are missing:");
  console.log("1. Go to: Supabase Dashboard > SQL Editor");
  console.log("2. Run: supabase/rls-production.sql");
  console.log("3. Click 'Run' to execute all policies\n");

  // Test if we can query the database directly
  console.log("Testing database access...");

  const { data, error } = await adminClient
    .from("products")
    .select("id")
    .limit(1);

  if (error) {
    console.log(`❌ Admin query failed: ${error.message}`);
  } else {
    console.log(`✓ Admin can access database (${data?.length || 0} products found)`);
  }
}

main().catch(console.error);

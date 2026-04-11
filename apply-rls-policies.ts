/**
 * Apply RLS Policies Programmatically
 * This script applies the RLS policies using the admin client
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const RLS_POLICIES = `
-- Drop existing policies if they exist (safe to run multiple times)
drop policy if exists "public_read_products" on public.products;
drop policy if exists "prevent_public_insert_products" on public.products;
drop policy if exists "prevent_public_update_products" on public.products;
drop policy if exists "prevent_public_delete_products" on public.products;

drop policy if exists "public_read_gallery_images" on public.gallery_images;
drop policy if exists "prevent_public_insert_gallery_images" on public.gallery_images;
drop policy if exists "prevent_public_update_gallery_images" on public.gallery_images;
drop policy if exists "prevent_public_delete_gallery_images" on public.gallery_images;

-- Enable RLS
alter table public.products enable row level security;
alter table public.gallery_images enable row level security;

-- ============================================================================
-- PRODUCTS TABLE RLS
-- ============================================================================

-- ✓ Public Read Access
create policy "public_read_products" on public.products
  for select
  using (true);

-- ❌ Block Public Inserts
create policy "prevent_public_insert_products" on public.products
  for insert
  with check (false);

-- ❌ Block Public Updates
create policy "prevent_public_update_products" on public.products
  for update
  using (false)
  with check (false);

-- ❌ Block Public Deletes
create policy "prevent_public_delete_products" on public.products
  for delete
  using (false);

-- ============================================================================
-- GALLERY IMAGES TABLE RLS
-- ============================================================================

-- ✓ Public Read Access
create policy "public_read_gallery_images" on public.gallery_images
  for select
  using (true);

-- ❌ Block Public Inserts
create policy "prevent_public_insert_gallery_images" on public.gallery_images
  for insert
  with check (false);

-- ❌ Block Public Updates
create policy "prevent_public_update_gallery_images" on public.gallery_images
  for update
  using (false)
  with check (false);

-- ❌ Block Public Deletes
create policy "prevent_public_delete_gallery_images" on public.gallery_images
  for delete
  using (false);
`;

async function main() {
  console.log("\n🔐 Applying RLS Policies to Supabase\n");

  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log("Executing RLS policies...\n");

    const { data, error } = await adminClient.rpc("exec", {
      sql: RLS_POLICIES,
    } as any);

    if (error) {
      console.log("⚠️  RPC exec not available, using alternative method...\n");
      console.log("Please manually apply the policies:");
      console.log("1. Go to Supabase Dashboard > SQL Editor");
      console.log("2. Open file: supabase/rls-production.sql");
      console.log("3. Click Run\n");
      return;
    }

    console.log("✓ RLS policies applied successfully!\n");
    console.log("Next: Run 'npm run test:supabase' to verify all protections");
  } catch (err) {
    console.error("Error:", err);
    console.log("\n⚠️  Could not apply policies programmatically");
    console.log("Please apply manually:\n");
    console.log("1. Go to Supabase Dashboard > SQL Editor");
    console.log("2. Open file: supabase/rls-production.sql");
    console.log("3. Click Run\n");
  }
}

main();

-- Enhanced RLS Policies for Lucentrezn
-- This file contains comprehensive Row Level Security policies for production

-- ============================================================================
-- PRODUCTS TABLE RLS
-- ============================================================================

-- Enable RLS (if not already enabled)
alter table public.products enable row level security;

-- Drop existing policies if they exist (safe to run multiple times)
drop policy if exists "public_read_products" on public.products;
drop policy if exists "prevent_public_insert_products" on public.products;
drop policy if exists "prevent_public_update_products" on public.products;
drop policy if exists "prevent_public_delete_products" on public.products;
drop policy if exists "block_inserts_products" on public.products;
drop policy if exists "block_updates_products" on public.products;
drop policy if exists "block_deletes_products" on public.products;

-- ✓ Public Read Access (allow anyone to view published products)
create policy "public_read_products" on public.products
  for select
  using (true);

-- ❌ Block Public Inserts (only admin should insert)
create policy "block_inserts_products" on public.products
  for insert
  with check (false);

-- ❌ Block Public Updates (only admin should update)
create policy "block_updates_products" on public.products
  for update
  using (false)
  with check (false);

-- ❌ Block Public Deletes (only admin should delete)
create policy "block_deletes_products" on public.products
  for delete
  using (false);

-- ============================================================================
-- GALLERY IMAGES TABLE RLS
-- ============================================================================

-- Enable RLS
alter table public.gallery_images enable row level security;

-- Drop existing policies if they exist (safe to run multiple times)
drop policy if exists "public_read_gallery_images" on public.gallery_images;
drop policy if exists "prevent_public_insert_gallery_images" on public.gallery_images;
drop policy if exists "prevent_public_update_gallery_images" on public.gallery_images;
drop policy if exists "prevent_public_delete_gallery_images" on public.gallery_images;
drop policy if exists "block_inserts_gallery_images" on public.gallery_images;
drop policy if exists "block_updates_gallery_images" on public.gallery_images;
drop policy if exists "block_deletes_gallery_images" on public.gallery_images;

-- ✓ Public Read Access (allow anyone to view gallery)
create policy "public_read_gallery_images" on public.gallery_images
  for select
  using (true);

-- ❌ Block Public Inserts
create policy "block_inserts_gallery_images" on public.gallery_images
  for insert
  with check (false);

-- ❌ Block Public Updates
create policy "block_updates_gallery_images" on public.gallery_images
  for update
  using (false)
  with check (false);

-- ❌ Block Public Deletes
create policy "block_deletes_gallery_images" on public.gallery_images
  for delete
  using (false);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify RLS is working:

-- Check if RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- List all policies:
-- SELECT * FROM pg_policies WHERE tablename IN ('products', 'gallery_images');

-- Test public read (should work):
-- SELECT * FROM products;

-- Test public insert (should fail with anon key):
-- INSERT INTO products (name, slug, price, description, images, shopeeUrl, category)
-- VALUES ('Test', 'test', 100, 'Testing RLS', '[]', 'https://shopee.com', 'test');

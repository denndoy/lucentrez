-- Enable RLS and allow public read-only access for catalog data.

alter table public.products enable row level security;
create policy "public_read_products" on public.products
  for select
  using (true);

alter table public.gallery_images enable row level security;
create policy "public_read_gallery_images" on public.gallery_images
  for select
  using (true);

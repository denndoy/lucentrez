-- Add hero slider table for landing page carousel
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  image_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists hero_slides_created_at_idx on public.hero_slides (created_at desc);

-- Schema for Lucentrezn (Supabase)
-- Note: RLS is left disabled for these tables to match current anon-key usage.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  price integer not null,
  description text not null,
  images jsonb not null default '[]'::jsonb,
  shopeeUrl text not null,
  category text not null,
  created_at timestamptz not null default now()
);

create index if not exists products_created_at_idx on public.products (created_at desc);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  image_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists gallery_images_created_at_idx on public.gallery_images (created_at desc);

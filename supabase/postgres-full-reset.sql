-- Lucentrez PostgreSQL clean reset + full seed
-- WARNING: This will delete existing data in the tables below.

begin;

set search_path to public;

create extension if not exists pgcrypto;

-- Clean reset
-- Drop dependent tables first, then helper function.
drop table if exists public.contact_settings cascade;
drop table if exists public.hero_slides cascade;
drop table if exists public.gallery_images cascade;
drop table if exists public.products cascade;
drop function if exists public.set_updated_at() cascade;

-- Helper function
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Tables
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  price integer not null,
  description text not null,
  images jsonb not null default '[]'::jsonb,
  hover_image text,
  shopeeurl text not null,
  category text not null,
  sold_out boolean not null default false,
  created_at timestamptz not null default now()
);

create index products_created_at_idx on public.products (created_at desc);
create index products_slug_idx on public.products (slug);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  image_url text not null,
  created_at timestamptz not null default now()
);

create index gallery_images_created_at_idx on public.gallery_images (created_at desc);

create table public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  image_url text not null,
  created_at timestamptz not null default now()
);

create index hero_slides_created_at_idx on public.hero_slides (created_at desc);

create table public.contact_settings (
  id integer primary key default 1,
  whatsapp_number text not null default '6281234567890',
  instagram_url text not null default 'https://instagram.com',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_settings_single_row check (id = 1)
);

create trigger contact_settings_set_updated_at
before update on public.contact_settings
for each row
execute function public.set_updated_at();

-- Seed: products
insert into public.products (
  id,
  name,
  slug,
  price,
  description,
  images,
  hover_image,
  shopeeurl,
  category,
  sold_out,
  created_at
)
values
  (
    '180cb9f8-f8e0-4fb6-bd7a-cf545ba9fed0',
    'Lucentrez Melancolush',
    'lucentrez-melancolush-8690',
    185000,
    'Step up your style with Lucentrez Melancolush, a perfect mix of comfort and statement. Featuring a relaxed boxy fit and made from soft bio wash 20s fabric, it feels as good as it looks. The clean neutral white color with a 3 cm ribbed neckline adds timeless appeal, while the puff ink print on the front and water-based print on the back give it a unique, textured vibe.',
    '["https://ucuztihrzlpfqribvfnk.supabase.co/storage/v1/object/public/media/products/1775921618887-produk-1-webp.webp", "https://ucuztihrzlpfqribvfnk.supabase.co/storage/v1/object/public/media/products/1776164225407-1775921628664-produk-2-webp.webp"]'::jsonb,
    'https://ucuztihrzlpfqribvfnk.supabase.co/storage/v1/object/public/media/products/1776097308220-1775921628664-produk-2-webp.webp',
    'https://shopee.co.id/asdsadwadsa',
    'Tops',
    false,
    '2026-04-11T15:35:41.210558+00:00'
  );

-- Seed: gallery
insert into public.gallery_images (id, title, image_url, created_at)
values
  ('e755a7d2-1cce-497d-b4fb-114c10e6232b', 'Gallery hasil konversi 1 3785', 'https://ucuztihrzlpfqribvfnk.supabase.co/storage/v1/object/public/media/gallery/1775922023084-hasil_konversi_1.webp', '2026-04-11T15:40:27.905054+00:00'),
  ('4e72a423-3811-4479-9423-7d3d0215e47c', 'Gallery hasil konversi 2 6721', 'https://ucuztihrzlpfqribvfnk.supabase.co/storage/v1/object/public/media/gallery/1775922034918-hasil_konversi_2.webp', '2026-04-11T15:40:39.639067+00:00'),
  ('690aff24-9a79-402c-92b1-db6bffc09a07', 'Gallery hasil konversi 4 1719', 'https://ucuztihrzlpfqribvfnk.supabase.co/storage/v1/object/public/media/gallery/1775922051231-hasil_konversi_4.webp', '2026-04-11T15:40:55.027590+00:00'),
  ('d67eeab5-e8d2-46c0-ad13-9a7357820823', 'Gallery hasil konversi 5 0301', 'https://ucuztihrzlpfqribvfnk.supabase.co/storage/v1/object/public/media/gallery/1775922059407-hasil_konversi_5.webp', '2026-04-11T15:41:03.135730+00:00'),
  ('4ab76f28-501b-44e1-b555-6a399f032b54', 'Gallery hasil konversi 6 3661', 'https://ucuztihrzlpfqribvfnk.supabase.co/storage/v1/object/public/media/gallery/1775922072949-hasil_konversi_6.webp', '2026-04-11T15:41:16.857140+00:00'),
  ('dcb9dc0c-f3e4-4bae-b028-1717a01f4ead', 'Gallery hasil konversi 8 5766', 'https://ucuztihrzlpfqribvfnk.supabase.co/storage/v1/object/public/media/gallery/1775922085126-hasil_konversi_8.webp', '2026-04-11T15:41:28.739439+00:00');

-- Seed: hero slides
insert into public.hero_slides (id, title, image_url, created_at)
values
  ('cfc61bb4-5458-405b-852a-fd6b17b429a9', 'Slide hasil konversi 1 0054', 'https://ucuztihrzlpfqribvfnk.supabase.co/storage/v1/object/public/media/hero/1775917479522-hasil_konversi_1.webp', '2026-04-11T14:24:44.209234+00:00'),
  ('7764a6e6-febe-4079-bfe5-fdcd05a5843d', 'Slide hasil konversi 2 8946', 'https://ucuztihrzlpfqribvfnk.supabase.co/storage/v1/object/public/media/hero/1775917498321-hasil_konversi_2.webp', '2026-04-11T14:25:05.342055+00:00'),
  ('5ba01017-8092-4210-afd1-953c94701166', 'Slide hasil konversi 4 9715', 'https://ucuztihrzlpfqribvfnk.supabase.co/storage/v1/object/public/media/hero/1775917878785-hasil_konversi_4.webp', '2026-04-11T14:31:23.891085+00:00'),
  ('751b780c-0226-4245-ab06-213f7bb1d8f4', 'Slide hasil konversi 5 4925', 'https://ucuztihrzlpfqribvfnk.supabase.co/storage/v1/object/public/media/hero/1775918303345-hasil_konversi_5.webp', '2026-04-11T14:38:29.975010+00:00'),
  ('1e8addf8-085c-4f95-b06f-6c8b6c23ac16', 'Slide hasil konversi 3 6730', 'https://ucuztihrzlpfqribvfnk.supabase.co/storage/v1/object/public/media/hero/1775918326148-hasil_konversi_3.webp', '2026-04-11T14:38:49.987592+00:00'),
  ('d22db9cd-6fa9-48db-98c4-df0b366715fb', 'Slide hasil konversi 6 1626', 'https://ucuztihrzlpfqribvfnk.supabase.co/storage/v1/object/public/media/hero/1775918341185-hasil_konversi_6.webp', '2026-04-11T14:39:04.974168+00:00'),
  ('5e56e78b-e746-41dd-8c97-fd974c3d1873', 'Slide hasil konversi 8 7478', 'https://ucuztihrzlpfqribvfnk.supabase.co/storage/v1/object/public/media/hero/1775918376589-hasil_konversi_8.webp', '2026-04-11T14:39:40.556589+00:00');

-- Seed: contact settings
insert into public.contact_settings (
  id,
  whatsapp_number,
  instagram_url,
  created_at,
  updated_at
)
values
  (
    1,
    '6288991891146',
    'https://www.instagram.com/lucentrez/',
    '2026-04-14T13:14:02.917498+00:00',
    '2026-04-14T13:57:50.086+00:00'
  );

commit;

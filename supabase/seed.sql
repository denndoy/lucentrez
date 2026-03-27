-- Seed data for Lucentrezn (Supabase)

insert into public.products (name, slug, price, description, images, shopeeUrl, category)
values
  (
    'Neon Drift Oversized Tee',
    'neon-drift-oversized-tee',
    289000,
    'Heavyweight cotton tee with oversized silhouette and fluorescent back graphic for a loud midnight-street statement.',
    '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1503341733017-1901578f9f1e?auto=format&fit=crop&w=1200&q=80"]',
    'https://shopee.co.id/',
    'Tops'
  ),
  (
    'Shadow Cargo Pants',
    'shadow-cargo-pants',
    429000,
    'Relaxed tapered cargo pants with utility pockets, reinforced seams, and technical fabric built for all-day movement.',
    '["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=1200&q=80"]',
    'https://shopee.co.id/',
    'Bottoms'
  ),
  (
    'Voltage Coach Jacket',
    'voltage-coach-jacket',
    559000,
    'Water-resistant coach jacket with contrast piping and reflective logo hits that pop under city lights.',
    '["https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=80"]',
    'https://shopee.co.id/',
    'Outerwear'
  ),
  (
    'Signal Snapback',
    'signal-snapback',
    199000,
    'Structured six-panel snapback with embroidered Lucentrezn mark and neon underbrim accent.',
    '["https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=80"]',
    'https://shopee.co.id/',
    'Accessories'
  ),
  (
    'Mono Layer Hoodie',
    'mono-layer-hoodie',
    489000,
    'Midweight brushed hoodie with dropped shoulders and clean tonal graphics, made for daily rotation.',
    '["https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80"]',
    'https://shopee.co.id/',
    'Tops'
  ),
  (
    'Transit Wide Denim',
    'transit-wide-denim',
    519000,
    'Wide-leg denim with structured drape and subtle whisker detailing for a clean, modern street fit.',
    '["https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&w=1200&q=80"]',
    'https://shopee.co.id/',
    'Bottoms'
  ),
  (
    'Afterlight Bomber',
    'afterlight-bomber',
    629000,
    'Lightly padded bomber jacket with matte finish and ribbed trims, balancing warmth and mobility.',
    '["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=1200&q=80"]',
    'https://shopee.co.id/',
    'Outerwear'
  ),
  (
    'Core Sling Bag',
    'core-sling-bag',
    239000,
    'Compact sling bag with dual-zip compartments and adjustable strap for hands-free daily carry.',
    '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80"]',
    'https://shopee.co.id/',
    'Accessories'
  )
on conflict (slug) do nothing;

insert into public.gallery_images (title, image_url)
values
  ('Night Alley Drop', '/gallery/look-01.svg'),
  ('Concrete Pulse', '/gallery/look-02.svg'),
  ('Subway Frequency', '/gallery/look-03.svg'),
  ('Signal Tower Fit', '/gallery/look-04.svg'),
  ('After Hours Kit', '/gallery/look-05.svg'),
  ('Neon Market Walk', '/gallery/look-06.svg')
on conflict (title) do nothing;

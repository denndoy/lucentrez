-- Add hover_image column to products table
-- This column stores the image URL that will be shown when hovering over a product in the catalog

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS hover_image text;

COMMENT ON COLUMN public.products.hover_image IS 'Image URL shown on hover in catalog (e.g., back view of product)';

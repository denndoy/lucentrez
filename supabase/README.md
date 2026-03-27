Supabase setup

1) Open the Supabase dashboard > SQL Editor.
2) Run supabase/schema.sql to create tables.
3) Run supabase/seed.sql to insert starter data.
4) Run supabase/rls.sql to enable public read policies.

Storage setup
1) Go to Storage > Create bucket.
2) Bucket name: media (or set SUPABASE_STORAGE_BUCKET in your env).
3) Set bucket to Public (for public image access).

Notes
- Public read is enabled via supabase/rls.sql (products + gallery_images).
- Admin API routes use the service role key for write access.

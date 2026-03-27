Supabase setup

1) Open the Supabase dashboard > SQL Editor.
2) Run supabase/schema.sql to create tables.
3) Run supabase/seed.sql to insert starter data.

Notes
- Current app uses anon key for read + admin routes. RLS is not enabled in schema.sql.
- For production, consider enabling RLS and switching admin routes to use the service role key.

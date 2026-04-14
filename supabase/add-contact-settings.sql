-- Add contact_settings table for configurable WhatsApp and Instagram

create table if not exists public.contact_settings (
  id integer primary key default 1,
  whatsapp_number text not null default '6281234567890',
  instagram_url text not null default 'https://instagram.com',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- Insert default row
insert into public.contact_settings (id, whatsapp_number, instagram_url)
values (1, '6281234567890', 'https://instagram.com')
on conflict (id) do nothing;

-- Enable RLS
alter table public.contact_settings enable row level security;

-- RLS Policies
drop policy if exists "public_read_contact_settings" on public.contact_settings;
create policy "public_read_contact_settings" on public.contact_settings
  for select
  using (true);

-- GRANT permissions
revoke all privileges on table public.contact_settings from public, anon, authenticated;
grant select on table public.contact_settings to anon, authenticated;
grant all privileges on table public.contact_settings to service_role;

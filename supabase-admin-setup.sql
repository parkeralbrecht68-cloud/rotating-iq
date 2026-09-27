-- Afterglow admin and owner listings setup
-- Run this once in Supabase SQL Editor, then promote your account below.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

alter table public.admin_users enable row level security;

drop policy if exists "Admins can read their own membership" on public.admin_users;
create policy "Admins can read their own membership"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

grant select on public.admin_users to authenticated;

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  kind text not null default 'restaurant',
  category text not null default '',
  cuisine text not null default '',
  address text not null,
  area text not null,
  ride_address text not null default '',
  hours text not null default '',
  phone text not null default '',
  website text not null default '',
  image_url text not null default '',
  description text not null default '',
  specials text not null default '',
  event_text text not null default '',
  cover text not null default '',
  featured boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists venues_public_order_idx
on public.venues (active, featured desc, sort_order asc, name asc);

alter table public.venues enable row level security;

drop policy if exists "Anyone can read active venues" on public.venues;
create policy "Anyone can read active venues"
on public.venues
for select
to anon, authenticated
using (active or public.is_admin());

drop policy if exists "Admins can create venues" on public.venues;
create policy "Admins can create venues"
on public.venues
for insert
to authenticated
with check (public.is_admin() and owner_id = auth.uid());

drop policy if exists "Admins can update venues" on public.venues;
create policy "Admins can update venues"
on public.venues
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete venues" on public.venues;
create policy "Admins can delete venues"
on public.venues
for delete
to authenticated
using (public.is_admin());

grant select on public.venues to anon, authenticated;
grant insert, update, delete on public.venues to authenticated;

-- After creating your account in the app, run this with that account's UUID:
-- insert into public.admin_users (user_id) values ('f1259b8d-dca0-4fc4-a66f-8f46a36fdff1');

-- Cloud synced POS quick buttons.
-- Run this in Supabase SQL Editor after products exist.

create extension if not exists pgcrypto;

create table if not exists public.pos_quick_buttons (
  id uuid primary key default gen_random_uuid(),
  sku_code text not null unique,
  label text,
  price numeric(12, 2) not null default 0,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pos_quick_buttons
  drop constraint if exists pos_quick_buttons_sku_code_fkey;

create index if not exists pos_quick_buttons_active_idx
  on public.pos_quick_buttons (is_active, sort_order, sku_code);

alter table public.pos_quick_buttons enable row level security;

drop policy if exists "Allow quick button download" on public.pos_quick_buttons;
create policy "Allow quick button download"
  on public.pos_quick_buttons for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow quick button create" on public.pos_quick_buttons;
create policy "Allow quick button create"
  on public.pos_quick_buttons for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow quick button update" on public.pos_quick_buttons;
create policy "Allow quick button update"
  on public.pos_quick_buttons for update
  to anon, authenticated
  using (true)
  with check (true);

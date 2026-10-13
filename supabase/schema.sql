-- ChamsApp Supabase setup
-- Run this once in Supabase Dashboard > SQL Editor.
-- This creates the first cloud tables for product sync and POS sales upload.

create extension if not exists pgcrypto;

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  branch_code text unique,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku_code text not null unique,
  barcode text unique,
  description text not null,
  price numeric(12, 2) not null default 0,
  cost numeric(12, 2),
  stock_qty numeric(12, 3),
  supplier_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  sku_code text not null,
  old_price numeric(12, 2),
  new_price numeric(12, 2) not null,
  changed_by text,
  changed_at timestamptz not null default now()
);

create table if not exists public.sales_transactions (
  id uuid primary key default gen_random_uuid(),
  device_sale_id text not null unique,
  branch_id uuid references public.branches(id),
  branch_name text,
  crew_username text not null,
  shift_started_at timestamptz,
  sold_at timestamptz not null,
  payment_method text not null check (payment_method in ('cash', 'gcash')),
  total numeric(12, 2) not null default 0,
  amount_tendered numeric(12, 2) not null default 0,
  change_amount numeric(12, 2) not null default 0,
  gcash_reference text,
  raw_payload jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.sales_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales_transactions(id) on delete cascade,
  sku_code text not null,
  barcode text,
  description text not null,
  qty numeric(12, 3) not null default 0,
  price numeric(12, 2) not null default 0,
  line_total numeric(12, 2) not null default 0,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.sync_logs (
  id uuid primary key default gen_random_uuid(),
  device_id text,
  branch_name text,
  sync_type text not null check (sync_type in ('download_products', 'upload_sales')),
  status text not null check (status in ('success', 'failed')),
  message text,
  created_at timestamptz not null default now()
);

create table if not exists public.pos_quick_buttons (
  id uuid primary key default gen_random_uuid(),
  sku_code text not null unique references public.products(sku_code) on update cascade,
  label text,
  price numeric(12, 2) not null default 0,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_barcode_idx on public.products (barcode);
create index if not exists products_updated_at_idx on public.products (updated_at);
create index if not exists sales_transactions_sold_at_idx on public.sales_transactions (sold_at);
create index if not exists sales_transactions_branch_name_idx on public.sales_transactions (branch_name);
create index if not exists sales_items_sale_id_idx on public.sales_items (sale_id);
create index if not exists pos_quick_buttons_active_idx on public.pos_quick_buttons (is_active, sort_order, sku_code);

alter table public.branches enable row level security;
alter table public.products enable row level security;
alter table public.price_history enable row level security;
alter table public.sales_transactions enable row level security;
alter table public.sales_items enable row level security;
alter table public.sync_logs enable row level security;
alter table public.pos_quick_buttons enable row level security;

-- MVP policies for the phone app.
-- The anon key is public, so keep admin actions inside the Supabase dashboard for now.
create policy "Allow product download"
  on public.products for select
  to anon, authenticated
  using (is_active = true);

create policy "Allow branch lookup"
  on public.branches for select
  to anon, authenticated
  using (is_active = true);

create policy "Allow price history lookup"
  on public.price_history for select
  to anon, authenticated
  using (true);

create policy "Allow sales upload"
  on public.sales_transactions for insert
  to anon, authenticated
  with check (true);

create policy "Allow sales item upload"
  on public.sales_items for insert
  to anon, authenticated
  with check (true);

create policy "Allow sales review"
  on public.sales_transactions for select
  to anon, authenticated
  using (true);

create policy "Allow sales item review"
  on public.sales_items for select
  to anon, authenticated
  using (true);

create policy "Allow sync log write"
  on public.sync_logs for insert
  to anon, authenticated
  with check (true);

create policy "Allow sync log review"
  on public.sync_logs for select
  to anon, authenticated
  using (true);

create policy "Allow quick button download"
  on public.pos_quick_buttons for select
  to anon, authenticated
  using (true);

create policy "Allow quick button create"
  on public.pos_quick_buttons for insert
  to anon, authenticated
  with check (true);

create policy "Allow quick button update"
  on public.pos_quick_buttons for update
  to anon, authenticated
  using (true)
  with check (true);

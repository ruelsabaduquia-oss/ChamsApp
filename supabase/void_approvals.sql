-- ChamsApp remote void approval setup
-- Run this in Supabase Dashboard > SQL Editor after user_auth.sql.

create extension if not exists pgcrypto;

create table if not exists public.void_approval_requests (
  id uuid primary key default gen_random_uuid(),
  device_request_id text not null unique,
  transaction_id text not null,
  branch_name text,
  crew_username text not null,
  crew_name text,
  item_code text not null,
  barcode text,
  description text not null,
  qty numeric(12, 3) not null default 0,
  price numeric(12, 2) not null default 0,
  line_total numeric(12, 2) not null default 0,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'applied', 'cancelled')),
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by text,
  decision_note text,
  applied_at timestamptz,
  raw_payload jsonb not null default '{}'::jsonb
);

create index if not exists void_approval_requests_status_idx on public.void_approval_requests (status);
create index if not exists void_approval_requests_transaction_idx on public.void_approval_requests (transaction_id);
create index if not exists void_approval_requests_branch_idx on public.void_approval_requests (branch_name);

alter table public.void_approval_requests enable row level security;

drop policy if exists "Allow void request create" on public.void_approval_requests;
create policy "Allow void request create"
  on public.void_approval_requests for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow void request read" on public.void_approval_requests;
create policy "Allow void request read"
  on public.void_approval_requests for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow void request update" on public.void_approval_requests;
create policy "Allow void request update"
  on public.void_approval_requests for update
  to anon, authenticated
  using (true)
  with check (true);

-- Optional product supplier support for POS manual lookup.
-- Run this after the main schema if your products table already exists.

alter table public.products
  add column if not exists supplier_name text;

-- ChamsApp product stock quantity update
-- Run this in Supabase Dashboard > SQL Editor to support POS inventory warnings.

alter table public.products
  add column if not exists stock_qty numeric(12, 3);

-- Run this once in Supabase SQL Editor if quick buttons created on one device
-- do not appear on another device because the SKU is not yet in cloud products.

alter table public.pos_quick_buttons
  drop constraint if exists pos_quick_buttons_sku_code_fkey;

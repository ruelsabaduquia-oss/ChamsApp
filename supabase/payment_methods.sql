-- ChamsApp payment method update
-- Run this in Supabase Dashboard > SQL Editor before uploading Credit/Debit Card sales.

alter table public.sales_transactions
  drop constraint if exists sales_transactions_payment_method_check;

alter table public.sales_transactions
  add constraint sales_transactions_payment_method_check
  check (payment_method in ('cash', 'gcash', 'card'));

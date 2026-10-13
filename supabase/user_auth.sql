-- ChamsApp user login setup
-- Run this in Supabase Dashboard > SQL Editor after schema.sql.
-- Passwords are stored as pgcrypto hashes, not plain text.

create extension if not exists pgcrypto;

create table if not exists public.staff_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  display_name text not null,
  role text not null check (role in ('admin', 'manager', 'branch_head', 'crew', 'auditor')),
  branch_name text,
  password_hash text not null,
  can_login_app boolean not null default true,
  can_use_pos boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.staff_users
  drop constraint if exists staff_users_role_check;

alter table public.staff_users
  add constraint staff_users_role_check check (role in ('admin', 'manager', 'branch_head', 'crew', 'auditor'));

alter table public.staff_users
  add column if not exists branch_name text;

alter table public.staff_users enable row level security;

drop policy if exists "No direct staff user read" on public.staff_users;
create policy "No direct staff user read"
  on public.staff_users for select
  to anon, authenticated
  using (false);

drop function if exists public.verify_app_user(text, text, text);

create or replace function public.verify_app_user(
  input_username text,
  input_password text,
  required_area text default 'app'
)
returns table (
  username text,
  display_name text,
  role text,
  branch_name text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    u.username,
    u.display_name,
    u.role,
    u.branch_name
  from public.staff_users u
  where lower(u.username) = lower(trim(input_username))
    and u.password_hash = crypt(input_password, u.password_hash)
    and u.is_active = true
    and (
      required_area = 'app' and u.can_login_app = true
      or required_area = 'pos' and u.can_use_pos = true
    )
  limit 1;
end;
$$;

grant execute on function public.verify_app_user(text, text, text) to anon, authenticated;

-- Starter users. Change these passwords after testing.
insert into public.staff_users (
  username,
  display_name,
  role,
  branch_name,
  password_hash,
  can_login_app,
  can_use_pos
)
values
  ('admin', 'Admin', 'admin', null, crypt('Admin@12345', gen_salt('bf')), true, true),
  ('manager1', 'Manager 1', 'manager', null, crypt('Manager@12345', gen_salt('bf')), true, true),
  ('branchhead1', 'Branch Head 1', 'branch_head', null, crypt('Branch@12345', gen_salt('bf')), true, true),
  ('crew1', 'Crew 1', 'crew', null, crypt('Crew@12345', gen_salt('bf')), true, true)
on conflict (username) do nothing;

-- Crew can log in once to the app shell, but the app UI limits crew to POS.
update public.staff_users
set can_login_app = true,
    can_use_pos = true,
    updated_at = now()
where role = 'crew';

-- To add another cashier later, run this and change the values:
-- insert into public.staff_users (username, display_name, role, branch_name, password_hash, can_login_app, can_use_pos)
-- values ('cashier2', 'Cashier 2', 'crew', 'Branch Name', crypt('NewPasswordHere', gen_salt('bf')), false, true);

-- To change a password later:
-- update public.staff_users
-- set password_hash = crypt('NewPasswordHere', gen_salt('bf')), updated_at = now()
-- where username = 'crew1';

-- 00_all_in_one.sql — Phase A bootstrap for RAI OS instance #1.
-- Paste this whole file into Studio → SQL Editor → Run. Safe to re-run (idempotent).
-- Order: schemas → IAM/RBAC → auth-token hook → RLS.

-- =====================================================================
-- 01 — module schemas
-- =====================================================================
do $$
declare s text;
begin
  foreach s in array array[
    'iam','cms','ai','shared','apps','mcp','marketplace','code',
    'enterprise','pricing','platform','portfolio','home'
  ] loop
    execute format('create schema if not exists %I authorization postgres', s);
    execute format('grant usage on schema %I to anon, authenticated, service_role', s);
    execute format('alter default privileges in schema %I grant all on tables to service_role', s);
    execute format('alter default privileges in schema %I grant all on sequences to service_role', s);
    execute format('alter default privileges in schema %I grant select, insert, update, delete on tables to authenticated', s);
    execute format('alter default privileges in schema %I grant select on tables to anon', s);
  end loop;
end $$;

-- =====================================================================
-- 02 — IAM: organizations, memberships, roles, permissions
-- =====================================================================
create table if not exists iam.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists iam.roles (
  key text primary key,
  label text not null
);

create table if not exists iam.permissions (
  key text primary key,
  label text not null
);

create table if not exists iam.role_permissions (
  role_key text not null references iam.roles(key) on delete cascade,
  permission_key text not null references iam.permissions(key) on delete cascade,
  primary key (role_key, permission_key)
);

create table if not exists iam.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid not null references iam.organizations(id) on delete cascade,
  role_key text not null references iam.roles(key),
  created_at timestamptz not null default now(),
  unique (user_id, org_id)
);
create index if not exists idx_memberships_user on iam.memberships(user_id);

insert into iam.roles(key,label) values
  ('owner','Owner'),('admin','Admin'),('editor','Editor'),('viewer','Viewer')
on conflict (key) do nothing;

insert into iam.permissions(key,label) values
  ('iam.users.read','Read users'),('iam.users.write','Manage users'),
  ('iam.roles.write','Manage roles'),
  ('cms.pages.read','Read pages'),('cms.pages.write','Edit pages'),('cms.pages.publish','Publish pages'),
  ('cms.suggestions.review','Review suggestions queue'),
  ('cms.metrics.write','Manage metrics'),
  ('ops.audit.read','Read audit log'),('ops.ai_ledger.read','Read AI ledger')
on conflict (key) do nothing;

insert into iam.role_permissions(role_key, permission_key)
  select r.key, p.key from iam.roles r cross join iam.permissions p
  where r.key in ('owner','admin')
on conflict do nothing;
insert into iam.role_permissions(role_key, permission_key) values
  ('editor','cms.pages.read'),('editor','cms.pages.write'),('editor','cms.pages.publish'),
  ('editor','cms.suggestions.review'),('editor','cms.metrics.write'),
  ('viewer','cms.pages.read'),('viewer','iam.users.read'),('viewer','ops.audit.read')
on conflict do nothing;

create or replace function iam.current_org() returns uuid
  language sql stable as $$ select nullif(auth.jwt()->>'org_id','')::uuid $$;

create or replace function iam.current_role() returns text
  language sql stable as $$ select coalesce(auth.jwt()->>'user_role','') $$;

create or replace function iam.has_permission(perm text) returns boolean
  language sql stable as $$
    select exists (
      select 1 from iam.role_permissions rp
      where rp.role_key = iam.current_role() and rp.permission_key = perm
    );
  $$;

-- =====================================================================
-- 03 — GoTrue custom access token hook (adds user_role + org_id claims)
--   Enable in GoTrue env:
--     GOTRUE_HOOK_CUSTOM_ACCESS_TOKEN_ENABLED=true
--     GOTRUE_HOOK_CUSTOM_ACCESS_TOKEN_URI=pg-functions://postgres/public/custom_access_token_hook
-- =====================================================================
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  uid uuid;
  m record;
begin
  uid := (event->>'user_id')::uuid;
  claims := coalesce(event->'claims', '{}'::jsonb);

  select role_key, org_id into m
  from iam.memberships
  where user_id = uid
  order by created_at asc
  limit 1;

  if m.role_key is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(m.role_key));
    claims := jsonb_set(claims, '{org_id}', to_jsonb(m.org_id::text));
  else
    claims := jsonb_set(claims, '{user_role}', to_jsonb('viewer'::text));
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;
grant usage on schema iam to supabase_auth_admin;
grant select on iam.memberships to supabase_auth_admin;

-- =====================================================================
-- 04 — Row Level Security on IAM tables
-- =====================================================================
alter table iam.organizations    enable row level security;
alter table iam.memberships      enable row level security;
alter table iam.roles            enable row level security;
alter table iam.permissions      enable row level security;
alter table iam.role_permissions enable row level security;

drop policy if exists roles_read      on iam.roles;
drop policy if exists perms_read      on iam.permissions;
drop policy if exists roleperms_read  on iam.role_permissions;
drop policy if exists roleperms_write on iam.role_permissions;
drop policy if exists org_read        on iam.organizations;
drop policy if exists org_write       on iam.organizations;
drop policy if exists mem_read        on iam.memberships;
drop policy if exists mem_write       on iam.memberships;

create policy roles_read       on iam.roles            for select to authenticated using (true);
create policy perms_read       on iam.permissions      for select to authenticated using (true);
create policy roleperms_read   on iam.role_permissions for select to authenticated using (true);
create policy roleperms_write  on iam.role_permissions for all to authenticated
  using (iam.has_permission('iam.roles.write')) with check (iam.has_permission('iam.roles.write'));

create policy org_read on iam.organizations for select to authenticated
  using (id = iam.current_org());
create policy org_write on iam.organizations for all to authenticated
  using (id = iam.current_org() and iam.has_permission('iam.users.write'))
  with check (id = iam.current_org() and iam.has_permission('iam.users.write'));

create policy mem_read on iam.memberships for select to authenticated
  using (org_id = iam.current_org());
create policy mem_write on iam.memberships for all to authenticated
  using (org_id = iam.current_org() and iam.has_permission('iam.users.write'))
  with check (org_id = iam.current_org() and iam.has_permission('iam.users.write'));

-- 02_iam_rbac.sql — IAM: organizations, memberships, roles, permissions (module.resource.action).

create table if not exists iam.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists iam.roles (
  key text primary key,            -- owner | admin | editor | viewer
  label text not null
);

create table if not exists iam.permissions (
  key text primary key,            -- 'module.resource.action', e.g. 'cms.pages.publish'
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

-- ---- seed roles ----
insert into iam.roles(key,label) values
  ('owner','Owner'),('admin','Admin'),('editor','Editor'),('viewer','Viewer')
on conflict (key) do nothing;

-- ---- seed a starter permission set (extend per module) ----
insert into iam.permissions(key,label) values
  ('iam.users.read','Read users'),('iam.users.write','Manage users'),
  ('iam.roles.write','Manage roles'),
  ('cms.pages.read','Read pages'),('cms.pages.write','Edit pages'),('cms.pages.publish','Publish pages'),
  ('cms.suggestions.review','Review suggestions queue'),
  ('cms.metrics.write','Manage metrics'),
  ('ops.audit.read','Read audit log'),('ops.ai_ledger.read','Read AI ledger')
on conflict (key) do nothing;

-- owner+admin get everything; editor gets content; viewer read-only.
insert into iam.role_permissions(role_key, permission_key)
  select r.key, p.key from iam.roles r cross join iam.permissions p
  where r.key in ('owner','admin')
on conflict do nothing;
insert into iam.role_permissions(role_key, permission_key) values
  ('editor','cms.pages.read'),('editor','cms.pages.write'),('editor','cms.pages.publish'),
  ('editor','cms.suggestions.review'),('editor','cms.metrics.write'),
  ('viewer','cms.pages.read'),('viewer','iam.users.read'),('viewer','ops.audit.read')
on conflict do nothing;

-- ---- helpers (read claims set by the auth hook) ----
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

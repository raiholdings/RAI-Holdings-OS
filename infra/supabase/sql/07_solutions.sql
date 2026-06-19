-- 07_solutions.sql — persist the Solutions modules (Marketplace, Code, Apps, MCP)
-- in real Postgres so the admin can govern them. Rich/nested fields live in a
-- jsonb `data` column; a few scalars are promoted for listing/filtering.
-- Schemas (marketplace, code, apps, mcp) already exist from 01_schemas.sql.
-- After running: ensure PGRST_DB_SCHEMAS includes marketplace,code,apps,mcp.

-- ── marketplace.listings ────────────────────────────────────────────────────
create table if not exists marketplace.listings (
  id text primary key,
  slug text, name text, type text, status text default 'approved',
  featured boolean default false, publisher_id text,
  rating numeric default 0, install_count int default 0,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ── code.repos ──────────────────────────────────────────────────────────────
create table if not exists code.repos (
  id text primary key,
  owner text, name text, slug text, license_spdx text, deploy_status text,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ── apps.apps ───────────────────────────────────────────────────────────────
create table if not exists apps.apps (
  id text primary key,
  name text, category text, developer text, community boolean default false,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ── mcp.servers ─────────────────────────────────────────────────────────────
create table if not exists mcp.servers (
  id text primary key,
  name text, namespace text, status text, source text,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- grants + admin-only RLS (relies on public.is_rai_admin() from 06)
do $$ declare s text; t text; tbls text[];
begin
  foreach s in array array['marketplace','code','apps','mcp'] loop
    tbls := case s
      when 'marketplace' then array['listings']
      when 'code' then array['repos']
      when 'apps' then array['apps']
      else array['servers'] end;
    execute format('grant usage on schema %I to authenticated', s);
    foreach t in array tbls loop
      execute format('grant select, insert, update, delete on %I.%I to authenticated', s, t);
      execute format('alter table %I.%I enable row level security', s, t);
      execute format('drop policy if exists admin_all on %I.%I', s, t);
      execute format('create policy admin_all on %I.%I for all to authenticated using (public.is_rai_admin()) with check (public.is_rai_admin())', s, t);
    end loop;
  end loop;
end $$;

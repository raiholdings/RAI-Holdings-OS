-- 01_schemas.sql — one Postgres DB, many module schemas (SPEC_CORE / A6).
-- Run as the postgres superuser via: docker compose exec -T db psql -U postgres -d postgres -f - < 01_schemas.sql

do $$
declare s text;
begin
  foreach s in array array[
    'iam','cms','ai','shared','apps','mcp','marketplace','code',
    'enterprise','pricing','platform','portfolio','home'
  ] loop
    execute format('create schema if not exists %I authorization postgres', s);
    -- Supabase API roles (created by GoTrue/PostgREST) get USAGE; table access is RLS-gated.
    execute format('grant usage on schema %I to anon, authenticated, service_role', s);
    -- service_role (server-side, bypasses RLS) gets full default privileges.
    execute format('alter default privileges in schema %I grant all on tables to service_role', s);
    execute format('alter default privileges in schema %I grant all on sequences to service_role', s);
    -- authenticated/anon get table-level rights; rows are still filtered by RLS policies.
    execute format('alter default privileges in schema %I grant select, insert, update, delete on tables to authenticated', s);
    execute format('alter default privileges in schema %I grant select on tables to anon', s);
  end loop;
end $$;

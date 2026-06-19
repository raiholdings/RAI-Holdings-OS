-- 13_mcp.sql — MCP registry full DB migration (read+write). mcp.servers already
-- exists (07_solutions); it now stores the canonical RegistryEntry in `data`.
-- This adds the sync moderation queue. mcp schema already exposed to PostgREST.

create table if not exists mcp.pending_imports (
  name               text primary key,
  data               jsonb not null,
  upstream_updated_at timestamptz,
  created_at         timestamptz not null default now()
);
create index if not exists mcp_pending_time on mcp.pending_imports(created_at desc);

grant select on mcp.pending_imports to authenticated;
grant select, insert, delete on mcp.pending_imports to service_role;
alter table mcp.pending_imports enable row level security;
drop policy if exists admin_read on mcp.pending_imports;
create policy admin_read on mcp.pending_imports for select to authenticated using (public.is_rai_admin());

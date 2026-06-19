-- 11_ops.sql — operations: backup history the admin can view. Proposal phase F.
-- The nightly backup.sh inserts a row (runs as postgres → bypasses RLS).
-- After running: add `ops` to PGRST_DB_SCHEMAS.

create schema if not exists ops;
grant usage on schema ops to authenticated, service_role;

create table if not exists ops.backups (
  id          uuid primary key default gen_random_uuid(),
  filename    text not null,
  size_bytes  bigint not null default 0,
  ok          boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists ops_backups_time on ops.backups(created_at desc);

grant select on ops.backups to authenticated;
grant select, insert on ops.backups to service_role;
alter table ops.backups enable row level security;
drop policy if exists admin_read on ops.backups;
create policy admin_read on ops.backups for select to authenticated using (public.is_rai_admin());

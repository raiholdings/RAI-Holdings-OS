-- 09_audit.sql — audit trail for every write action (UI or AI), proposal phase B.
-- The Worker writes via service_role (bypasses RLS); admins read via authenticated.
-- After running: add `audit` to PGRST_DB_SCHEMAS.

create schema if not exists audit;
grant usage on schema audit to authenticated, service_role;

create table if not exists audit.events (
  id           uuid primary key default gen_random_uuid(),
  actor_user_id text,
  actor_role    text,
  action        text not null,         -- tool / operation name
  target_table  text,
  target_id     text,
  before_json   jsonb,
  after_json    jsonb,
  source        text not null default 'ai',  -- 'ui' | 'ai'
  prompt        text,
  created_at    timestamptz not null default now()
);
create index if not exists audit_events_time on audit.events(created_at desc);

grant select on audit.events to authenticated;
grant select, insert on audit.events to service_role;

alter table audit.events enable row level security;
drop policy if exists admin_read on audit.events;
create policy admin_read on audit.events for select to authenticated using (public.is_rai_admin());

-- 12_observability.sql — agent run telemetry for the /observability admin page
-- (fills the proposal §6 gap). The workspace run route inserts a row per engine
-- call (via service_role → bypasses RLS); admins read.
-- workspace + analytics schemas are already exposed to PostgREST.

create table if not exists workspace.agent_runs (
  id          uuid primary key default gen_random_uuid(),
  org_id      text,
  engine      text,
  product     text not null default 'venture',
  model       text,
  source      text,            -- 'gateway' | 'anthropic' | 'mock'
  ok          boolean not null default true,
  latency_ms  int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists agent_runs_time on workspace.agent_runs(created_at desc);

grant select on workspace.agent_runs to authenticated;
grant select, insert on workspace.agent_runs to service_role;
alter table workspace.agent_runs enable row level security;
drop policy if exists admin_all on workspace.agent_runs;
create policy admin_all on workspace.agent_runs for all to authenticated using (public.is_rai_admin()) with check (public.is_rai_admin());

-- success/latency per engine
create or replace view analytics.agent_success as
  select engine,
    count(*)::int as total,
    count(*) filter (where ok)::int as done,
    count(*) filter (where not ok)::int as failed,
    round(avg(latency_ms))::int as avg_latency_ms
  from workspace.agent_runs group by engine order by total desc;

-- runs per day + by source
create or replace view analytics.agent_daily as
  select date_trunc('day', created_at)::date as date, source, count(*)::int as runs
  from workspace.agent_runs group by 1, 2 order by 1;

grant select on analytics.agent_success, analytics.agent_daily to authenticated, service_role;

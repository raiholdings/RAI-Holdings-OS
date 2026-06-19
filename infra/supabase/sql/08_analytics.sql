-- 08_analytics.sql — aggregate views powering the Dashboard 2.0 charts/KPIs.
-- Plain views owned by postgres → run security-definer, so they read across the
-- RLS-protected workspace tables and expose only aggregates. Granted to
-- authenticated (only admins log in to GoTrue). Add `analytics` to PGRST_DB_SCHEMAS.

create schema if not exists analytics;
grant usage on schema analytics to authenticated, service_role;

-- headline KPIs (single row)
create or replace view analytics.summary as
select
  (select count(*) from workspace.ventures)::int as ventures,
  (select count(*) from workspace.ventures where created_at > date_trunc('month', now()))::int as ventures_month,
  (select count(*) from workspace.ventures where status = 'live')::int as ventures_live,
  (select count(*) from workspace.orgs)::int as orgs,
  (select count(distinct org_id) from workspace.usage_events where created_at > now() - interval '7 days')::int as active_orgs_7d,
  (select count(*) from workspace.org_members)::int as members,
  (select coalesce(sum(balance_vnd), 0) from workspace.orgs)::bigint as total_credit,
  (select coalesce(sum(amount_vnd), 0) from workspace.wallet_txns where kind = 'topup' and created_at > date_trunc('month', now()))::bigint as topup_month,
  (select coalesce(sum(cost_vnd), 0) from workspace.usage_events where created_at > date_trunc('month', now()))::bigint as ai_cost_month,
  (select count(*) from workspace.usage_events)::int as usage_events;

-- new ventures per day by status (area/stacked)
create or replace view analytics.daily_ventures as
  select date_trunc('day', created_at)::date as date, status, count(*)::int as count
  from workspace.ventures group by 1, 2 order by 1;

-- credit in/out per day (combo + running balance computed client-side)
create or replace view analytics.daily_cashflow as
  select date_trunc('day', created_at)::date as date,
         sum(case when amount_vnd > 0 then amount_vnd else 0 end)::bigint as topup_vnd,
         sum(case when amount_vnd < 0 then -amount_vnd else 0 end)::bigint as debit_vnd
  from workspace.wallet_txns group by 1 order by 1;

-- AI cost split by model (donut)
create or replace view analytics.cost_by_model as
  select coalesce(nullif(model, ''), '(unknown)') as model,
         sum(units)::bigint as tokens, sum(cost_vnd)::bigint as cost_vnd, count(*)::int as events
  from workspace.usage_events group by 1 order by 3 desc;

-- per-org usage + burn (bar ranking + wallet health)
create or replace view analytics.org_usage as
  select o.id as org_id, o.name, o.balance_vnd,
         coalesce((select sum(cost_vnd) from workspace.usage_events u
                   where u.org_id = o.id and u.created_at > now() - interval '30 days'), 0)::bigint as spent_30d
  from workspace.orgs o order by spent_30d desc;

grant select on all tables in schema analytics to authenticated;
alter default privileges in schema analytics grant select on tables to authenticated;

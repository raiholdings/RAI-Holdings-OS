-- 10_billing.sql — platform economics views (proposal phase C). Added to schema
-- `analytics` (already exposed). Grant authenticated + service_role.

-- 30-day revenue (credit top-ups) vs AI provider cost, per day
create or replace view analytics.daily_revenue as
  select d::date as date,
    coalesce((select sum(amount_vnd) from workspace.wallet_txns w where w.kind = 'topup' and w.created_at::date = d::date), 0)::bigint as revenue_vnd,
    coalesce((select sum(cost_vnd) from workspace.usage_events u where u.created_at::date = d::date), 0)::bigint as ai_cost_vnd
  from generate_series((now() - interval '29 days')::date, now()::date, interval '1 day') d;

-- per-org wallet health: balance, 30d spend, burn/day, days to empty
create or replace view analytics.org_wallet_health as
  with b as (
    select o.id as org_id, o.name, o.balance_vnd,
      coalesce(sum(case when u.created_at > now() - interval '30 days' then u.cost_vnd else 0 end), 0)::numeric as spent_30d
    from workspace.orgs o left join workspace.usage_events u on u.org_id = o.id
    group by o.id, o.name, o.balance_vnd
  )
  select org_id, name, balance_vnd, spent_30d::bigint as spent_30d,
    round(spent_30d / 30.0)::bigint as burn_per_day,
    case when spent_30d <= 0 then null else floor(balance_vnd / (spent_30d / 30.0))::int end as days_to_empty
  from b order by spent_30d desc;

grant select on analytics.daily_revenue, analytics.org_wallet_health to authenticated, service_role;

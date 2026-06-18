-- 05_workspace.sql — RAI OS Workspace persistence (orgs, members, ventures).
-- Phase 1 (L2→L3): moves the localStorage workspace store onto Postgres.
--
-- Run after 01_schemas.sql:
--   docker compose exec -T db psql -U postgres -d postgres -f - < 05_workspace.sql
--
-- IMPORTANT: expose the schema to PostgREST so the app can reach it over REST:
--   add `workspace` to PGRST_DB_SCHEMAS (e.g. "public,storage,graphql_public,workspace")
--   then restart the `rest` container. The app reads/writes via service_role only
--   (server-side) and scopes every query by RAI Social user → org membership.

create schema if not exists workspace authorization postgres;
grant usage on schema workspace to anon, authenticated, service_role;
alter default privileges in schema workspace grant all on tables to service_role;
alter default privileges in schema workspace grant all on sequences to service_role;

-- ── orgs ──────────────────────────────────────────────────────────────────
create table if not exists workspace.orgs (
  id          text primary key,
  name        text not null,
  balance_vnd bigint not null default 0,
  created_at  timestamptz not null default now()
);

-- ── members: RAI Social user (text id) ↔ org, with a role ───────────────────
create table if not exists workspace.org_members (
  org_id      text not null references workspace.orgs(id) on delete cascade,
  rai_user_id text not null,
  role        text not null default 'owner' check (role in ('owner','admin','member')),
  -- denormalized RAI Social snapshot so the members list needs no extra lookup
  name        text,
  username    text,
  avatar      text,
  created_at  timestamptz not null default now(),
  primary key (org_id, rai_user_id)
);
create index if not exists org_members_user_idx on workspace.org_members(rai_user_id);

-- ── ventures: rich nested object kept as jsonb + a few indexed scalars ───────
create table if not exists workspace.ventures (
  id          text primary key,
  org_id      text not null references workspace.orgs(id) on delete cascade,
  name        text,
  sector      text,
  region      text,
  status      text not null default 'draft',
  confidence  int  not null default 0,
  idea_prompt text,
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists ventures_org_idx on workspace.ventures(org_id, created_at desc);

-- ── wallet ledger: every credit/debit, with the resulting balance ──────────
create table if not exists workspace.wallet_txns (
  id            text primary key,
  org_id        text not null references workspace.orgs(id) on delete cascade,
  kind          text not null check (kind in ('topup','debit','adjust','refund')),
  amount_vnd    bigint not null,         -- signed: +credit / -debit
  balance_after bigint not null,
  note          text,
  created_by    text,
  created_at    timestamptz not null default now()
);
create index if not exists wallet_txns_org_idx on workspace.wallet_txns(org_id, created_at desc);

-- ── usage events: metered consumption (LLMs / engines / Big Data) ───────────
create table if not exists workspace.usage_events (
  id          text primary key,
  org_id      text not null references workspace.orgs(id) on delete cascade,
  rai_user_id text,
  product     text not null,            -- 'llms' | 'venture' | 'bigdata' | ...
  model       text,
  units       int not null default 1,
  cost_vnd    bigint not null default 0,
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists usage_events_org_idx on workspace.usage_events(org_id, created_at desc);

-- Atomic balance change + ledger row. Returns the new balance.
-- Called over PostgREST RPC: POST /rest/v1/rpc/wallet_apply (Content-Profile: workspace).
create or replace function workspace.wallet_apply(
  p_org text, p_amount bigint, p_kind text, p_note text, p_by text
) returns bigint language plpgsql as $$
declare new_balance bigint;
begin
  update workspace.orgs set balance_vnd = balance_vnd + p_amount
    where id = p_org returning balance_vnd into new_balance;
  if new_balance is null then raise exception 'org_not_found'; end if;
  insert into workspace.wallet_txns(id, org_id, kind, amount_vnd, balance_after, note, created_by)
    values (gen_random_uuid()::text, p_org, p_kind, p_amount, new_balance, p_note, p_by);
  return new_balance;
end $$;
grant execute on function workspace.wallet_apply(text, bigint, text, text, text) to service_role;

-- RLS on: the app uses service_role (bypasses RLS) and enforces org scoping in
-- code. No anon/authenticated policies → those roles are denied by default.
alter table workspace.orgs         enable row level security;
alter table workspace.org_members  enable row level security;
alter table workspace.ventures     enable row level security;
alter table workspace.wallet_txns  enable row level security;
alter table workspace.usage_events enable row level security;

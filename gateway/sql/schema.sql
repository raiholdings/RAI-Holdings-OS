-- RAI LLMs Gateway — PostgreSQL schema (spec §6)
-- Idempotent: safe to run multiple times. Run via `npm run migrate`.
-- Credits/balances are stored in VND (see FX_USD_VND in .env).

create extension if not exists pgcrypto;  -- gen_random_uuid()

-- =====================================================================
-- Users & wallets
-- =====================================================================
create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  name        text,
  kyc_status  text not null default 'none',  -- none|pending|verified|rejected
  created_at  timestamptz not null default now()
);

create table if not exists wallets (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete cascade,
  balance_credits  numeric(18,4) not null default 0,  -- VND
  currency         text not null default 'VND',
  updated_at       timestamptz not null default now()
);
create index if not exists idx_wallets_user_id on wallets(user_id);

create table if not exists transactions (
  id          uuid primary key default gen_random_uuid(),
  wallet_id   uuid not null references wallets(id) on delete cascade,
  type        text not null check (type in ('topup','debit','refund')),
  amount      numeric(18,4) not null,   -- credits delta (VND)
  vnd_amount  numeric(18,2),            -- actual VND moved (for topups via payment gateway)
  ref         text,                     -- external ref (VNPay/MoMo txn id, gen_id, etc.)
  created_at  timestamptz not null default now()
);
create index if not exists idx_transactions_wallet_id on transactions(wallet_id);
create index if not exists idx_transactions_created_at on transactions(created_at);

-- =====================================================================
-- API keys (per-key budget + rate limit)
-- =====================================================================
create table if not exists api_keys (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references users(id) on delete cascade,
  hash           text unique not null,          -- sha-256 of the raw key; raw shown once
  label          text,
  limit_credits  numeric(18,4),                 -- null = unlimited; budget cap (VND)
  used_credits   numeric(18,4) not null default 0,
  rpm_limit      integer,                       -- requests per minute; null = no per-key limit
  disabled       boolean not null default false,
  created_at     timestamptz not null default now()
);
create index if not exists idx_api_keys_hash on api_keys(hash);
create index if not exists idx_api_keys_user_id on api_keys(user_id);

-- =====================================================================
-- Providers & upstream credentials
-- =====================================================================
create table if not exists providers (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,        -- openai|anthropic|google|deepseek|...
  name         text not null,
  base_url     text,
  data_policy  text,                        -- e.g. 'logs'|'no-log'|'zdr'
  status       text not null default 'active'  -- active|degraded|disabled
);

create table if not exists provider_credentials (
  id                uuid primary key default gen_random_uuid(),
  provider_id       uuid not null references providers(id) on delete cascade,
  upstream_key_enc  text not null,          -- AES-256-GCM encrypted (ENCRYPTION_KEY)
  active            boolean not null default true,
  created_at        timestamptz not null default now()
);
create index if not exists idx_provider_credentials_provider_id on provider_credentials(provider_id);

-- =====================================================================
-- Models & endpoints
-- =====================================================================
create table if not exists models (
  id                          uuid primary key default gen_random_uuid(),
  slug                        text unique not null,   -- "author/slug" e.g. anthropic/claude-sonnet-4.6
  author                      text not null,
  name                        text not null,
  context_length              integer,
  modality                    text,                   -- "text->text", "text+image->text"
  supported_parameters_json   jsonb not null default '[]'::jsonb,
  enabled                     boolean not null default true,
  created_at                  timestamptz not null default now()
);
create index if not exists idx_models_author on models(author);

create table if not exists model_endpoints (
  id                     uuid primary key default gen_random_uuid(),
  model_id               uuid not null references models(id) on delete cascade,
  provider_id            uuid not null references providers(id) on delete cascade,
  price_prompt           numeric(20,12) not null default 0,  -- per token (upstream base)
  price_completion       numeric(20,12) not null default 0,  -- per token (upstream base)
  max_completion_tokens  integer,
  throughput             numeric(12,2),     -- tokens/sec
  uptime_24h             numeric(5,2),      -- percent 0..100
  status                 text not null default 'active',  -- active|degraded|down
  created_at             timestamptz not null default now(),
  unique (model_id, provider_id)
);
create index if not exists idx_model_endpoints_model_id on model_endpoints(model_id);
create index if not exists idx_model_endpoints_provider_id on model_endpoints(provider_id);

-- =====================================================================
-- Markups (platform margin on upstream price)
-- =====================================================================
create table if not exists markups (
  id       uuid primary key default gen_random_uuid(),
  scope    text not null check (scope in ('global','model','provider')),
  target   text,                       -- model slug or provider slug; null for global
  percent  numeric(6,2) not null,      -- e.g. 20.00 = +20%
  created_at timestamptz not null default now()
);
create unique index if not exists uniq_markups_scope_target
  on markups (scope, coalesce(target, ''));

-- =====================================================================
-- Request logs (usage / activity / audit)
-- =====================================================================
create table if not exists requests_log (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references users(id) on delete set null,
  api_key_id         uuid references api_keys(id) on delete set null,
  gen_id             text unique,                -- "gen-xxxx" returned to client
  model_slug         text,
  provider_slug      text,
  prompt_tokens      integer not null default 0,
  completion_tokens  integer not null default 0,
  cost               numeric(18,6) not null default 0,  -- charged credits (VND)
  latency_ms         integer,
  finish_reason      text,            -- normalized: tool_calls|stop|length|content_filter|error
  status             text,            -- ok|error|timeout|...
  created_at         timestamptz not null default now()
);
create index if not exists idx_requests_log_created_at on requests_log(created_at);
create index if not exists idx_requests_log_api_key_id on requests_log(api_key_id);
create index if not exists idx_requests_log_user_id on requests_log(user_id);
create index if not exists idx_requests_log_gen_id on requests_log(gen_id);

-- =====================================================================
-- Presets (saved model + params + system prompt)
-- =====================================================================
create table if not exists presets (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references users(id) on delete cascade,
  name           text not null,
  model          text,
  params_json    jsonb not null default '{}'::jsonb,
  system_prompt  text,
  created_at     timestamptz not null default now()
);
create index if not exists idx_presets_user_id on presets(user_id);

-- =====================================================================
-- BYOK — user-supplied upstream keys
-- =====================================================================
create table if not exists byok_keys (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  provider_id  uuid not null references providers(id) on delete cascade,
  key_enc      text not null,          -- AES-256-GCM encrypted (ENCRYPTION_KEY)
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  unique (user_id, provider_id)
);
create index if not exists idx_byok_keys_user_id on byok_keys(user_id);

-- =====================================================================
-- SEED DATA (idempotent)
-- =====================================================================
insert into providers (slug, name, base_url, data_policy, status) values
  ('openai',    'OpenAI',    'https://api.openai.com/v1',          'logs',  'active'),
  ('anthropic', 'Anthropic', 'https://api.anthropic.com/v1',       'no-log','active'),
  ('google',    'Google',    'https://generativelanguage.googleapis.com/v1beta', 'logs', 'active'),
  ('deepseek',  'DeepSeek',  'https://api.deepseek.com/v1',        'logs',  'active')
on conflict (slug) do nothing;

-- Default global markup (+20%); override per model/provider in Admin.
insert into markups (scope, target, percent) values
  ('global', null, 20.00)
on conflict (scope, coalesce(target, '')) do nothing;

-- =====================================================================
-- Payments (VND top-ups via VNPay/MoMo) + VAT invoices
-- =====================================================================
create table if not exists payment_intents (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  wallet_id    uuid references wallets(id) on delete set null,
  method       text not null,                       -- vnpay|momo
  amount_vnd   numeric(18,2) not null,
  status       text not null default 'pending',     -- pending|paid|failed
  ref          text unique not null,                -- our order ref (vnp_TxnRef / orderId)
  provider_ref text,                                -- gateway transaction id
  created_at   timestamptz not null default now(),
  paid_at      timestamptz
);
create index if not exists idx_payment_intents_user on payment_intents(user_id);

create table if not exists invoices (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references users(id) on delete cascade,
  payment_intent_id  uuid references payment_intents(id) on delete set null,
  number             text unique,                   -- invoice serial
  amount_vnd         numeric(18,2) not null,        -- gross (incl VAT)
  vat_percent        numeric(5,2) not null default 10,
  status             text not null default 'issued',-- issued|sent|void
  created_at         timestamptz not null default now()
);
create index if not exists idx_invoices_user on invoices(user_id);

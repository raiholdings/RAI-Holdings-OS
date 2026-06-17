-- 03_auth_hook.sql — GoTrue custom access token hook: inject user_role + org_id claims.
-- Enabled via .env: GOTRUE_HOOK_CUSTOM_ACCESS_TOKEN_ENABLED=true
--                   GOTRUE_HOOK_CUSTOM_ACCESS_TOKEN_URI=pg-functions://postgres/public/custom_access_token_hook
--
-- IMPORTANT: we add `user_role` and `org_id` — NOT the top-level `role` claim,
-- which PostgREST uses to pick the database role (authenticated/anon). Don't clobber it.

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  uid uuid;
  m record;
begin
  uid := (event->>'user_id')::uuid;
  claims := coalesce(event->'claims', '{}'::jsonb);

  select role_key, org_id into m
  from iam.memberships
  where user_id = uid
  order by created_at asc
  limit 1;

  if m.role_key is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(m.role_key));
    claims := jsonb_set(claims, '{org_id}', to_jsonb(m.org_id::text));
  else
    claims := jsonb_set(claims, '{user_role}', to_jsonb('viewer'::text));
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- The hook runs as supabase_auth_admin; grant it what it needs and lock others out.
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;

grant usage on schema iam to supabase_auth_admin;
grant select on iam.memberships to supabase_auth_admin;

-- 06_admin_rls.sql — let the Refine admin (logged-in owner/admin) govern all
-- live platform data over PostgREST. The app's own server (Worker) uses the
-- service_role and bypasses RLS; this is only for the browser admin console.
--
-- Requires: the GoTrue custom-access-token hook (03) injecting `user_role`.
-- After running: add `workspace,iam` to PGRST_DB_SCHEMAS and restart `rest`.

-- helper: current JWT is an owner/admin
create or replace function public.is_rai_admin() returns boolean
  language sql stable as $$ select coalesce(auth.jwt()->>'user_role','') in ('owner','admin') $$;
grant execute on function public.is_rai_admin() to authenticated, anon;

-- ── workspace schema: grant table rights + admin-only RLS policy ─────────────
grant usage on schema workspace to authenticated;
grant select, insert, update, delete on all tables in schema workspace to authenticated;
alter default privileges in schema workspace grant select, insert, update, delete on tables to authenticated;

do $$ declare t text;
begin
  foreach t in array array['orgs','org_members','ventures','wallet_txns','usage_events'] loop
    execute format('alter table workspace.%I enable row level security', t);
    execute format('drop policy if exists admin_all on workspace.%I', t);
    execute format('create policy admin_all on workspace.%I for all to authenticated using (public.is_rai_admin()) with check (public.is_rai_admin())', t);
  end loop;
end $$;

-- ── iam schema: admin full access (org-isolation policies from 04 still apply
--    to non-admins; admins get a blanket policy) ──────────────────────────────
do $$ declare t text;
begin
  foreach t in array array['organizations','roles','permissions','role_permissions','memberships'] loop
    execute format('alter table iam.%I enable row level security', t);
    execute format('drop policy if exists admin_all on iam.%I', t);
    execute format('create policy admin_all on iam.%I for all to authenticated using (public.is_rai_admin()) with check (public.is_rai_admin())', t);
  end loop;
end $$;

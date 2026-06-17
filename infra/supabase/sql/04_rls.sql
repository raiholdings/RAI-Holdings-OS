-- 04_rls.sql — Row Level Security: enable on IAM tables + the reusable org/permission pattern.
-- service_role bypasses RLS (server-side Core). Policies below govern `authenticated` clients.

alter table iam.organizations  enable row level security;
alter table iam.memberships    enable row level security;
alter table iam.roles          enable row level security;
alter table iam.permissions    enable row level security;
alter table iam.role_permissions enable row level security;

-- Everyone authenticated may read the role/permission catalog (for the admin UI).
create policy roles_read       on iam.roles            for select to authenticated using (true);
create policy perms_read       on iam.permissions      for select to authenticated using (true);
create policy roleperms_read   on iam.role_permissions for select to authenticated using (true);
create policy roleperms_write  on iam.role_permissions for all to authenticated
  using (iam.has_permission('iam.roles.write')) with check (iam.has_permission('iam.roles.write'));

-- Organizations: a user can see the org they belong to; only admins manage.
create policy org_read on iam.organizations for select to authenticated
  using (id = iam.current_org());
create policy org_write on iam.organizations for all to authenticated
  using (id = iam.current_org() and iam.has_permission('iam.users.write'))
  with check (id = iam.current_org() and iam.has_permission('iam.users.write'));

-- Memberships: see your org's members; admins manage them.
create policy mem_read on iam.memberships for select to authenticated
  using (org_id = iam.current_org());
create policy mem_write on iam.memberships for all to authenticated
  using (org_id = iam.current_org() and iam.has_permission('iam.users.write'))
  with check (org_id = iam.current_org() and iam.has_permission('iam.users.write'));

-- =====================================================================
-- REUSABLE TEMPLATE for every business table (cms.pages, portfolio.entries, …):
-- each table has an `org_id uuid` column; copy this block per table in later phases.
--
--   alter table <schema>.<table> enable row level security;
--   create policy <t>_read  on <schema>.<table> for select to authenticated
--     using (org_id = iam.current_org());
--   create policy <t>_write on <schema>.<table> for all to authenticated
--     using (org_id = iam.current_org() and iam.has_permission('<module>.<resource>.write'))
--     with check (org_id = iam.current_org() and iam.has_permission('<module>.<resource>.write'));
--
-- Public-facing read (published rows visible to anon) where needed:
--   create policy <t>_public on <schema>.<table> for select to anon
--     using (status = 'published');
-- =====================================================================

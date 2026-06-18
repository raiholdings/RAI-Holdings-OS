#!/usr/bin/env bash
# Apply the RAI SQL migrations (schemas + workspace) into the running Supabase
# Postgres. Run ON THE VM from the supabase/docker directory, after the stack is up.
#
#   bash apply-workspace-sql.sh [path-to-sql-dir]   # default: ./rai-sql
#
# Idempotent: every file uses `create … if not exists` / `create or replace`.
set -euo pipefail

SQL_DIR="${1:-./rai-sql}"
[ -d "$SQL_DIR" ] || { echo "ERROR: SQL dir '$SQL_DIR' not found (copy infra/supabase/sql here)"; exit 1; }

# Apply in filename order: 01_schemas → … → 05_workspace
for f in $(ls "$SQL_DIR"/*.sql | sort); do
  echo "==> applying $(basename "$f")"
  docker compose exec -T db psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f - < "$f"
done

echo
echo "Done. Reminder: add 'workspace' to PGRST_DB_SCHEMAS in .env, then:"
echo "  docker compose restart rest"

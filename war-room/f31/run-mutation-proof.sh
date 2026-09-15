#!/usr/bin/env bash
set -euo pipefail

PGURL="postgresql://postgres@127.0.0.1:54322/postgres"
PROBE="war-room/f31/f31-mutation-probe.test.sql"
OUT="${1:-/tmp/f31}"
mkdir -p "$OUT"

count_not_ok() { awk '/^[[:space:]]*not ok /{n++} END{print n+0}' "$1"; }
count_ok() { awk '/^[[:space:]]*ok [0-9]+ - /{n++} END{print n+0}' "$1"; }
run_probe() {
  local label="$1"
  psql "$PGURL" -v ON_ERROR_STOP=1 -f "$PROBE" | tee "$OUT/${label}.tap"
}
assert_green() {
  local f="$1"
  test "$(count_ok "$f")" -eq 8
  test "$(count_not_ok "$f")" -eq 0
  grep -Eq '^[[:space:]]*1\.\.8[[:space:]]*$' "$f"
}
assert_red() {
  local f="$1"
  test "$(count_not_ok "$f")" -ge 1
}
run_case() {
  local label="$1" mutation="$2"
  echo "===== F31 $label ====="
  supabase db reset --local --no-seed
  run_probe "${label}-baseline"
  assert_green "$OUT/${label}-baseline.tap"
  psql "$PGURL" -v ON_ERROR_STOP=1 -c "$mutation"
  run_probe "${label}-mutated"
  assert_red "$OUT/${label}-mutated.tap"
  supabase db reset --local --no-seed
  run_probe "${label}-restored"
  assert_green "$OUT/${label}-restored.tap"
}

supabase start
run_case inventory "alter table public.products disable row level security;"
run_case finance "alter table public.cash_accounts disable row level security;"
run_case orders "alter table public.orders disable row level security;"
run_case tenant "do \$\$ declare p record; begin for p in select policyname from pg_policies where schemaname='public' and tablename='products' loop execute format('drop policy %I on public.products', p.policyname); end loop; if exists(select 1 from pg_policies where schemaname='public' and tablename='products') then raise exception 'product policy mutation incomplete'; end if; end \$\$;"
run_case storage "do \$\$ declare p record; begin for p in select policyname from pg_policies where schemaname='storage' and tablename='objects' loop execute format('drop policy %I on storage.objects', p.policyname); end loop; if exists(select 1 from pg_policies where schemaname='storage' and tablename='objects') then raise exception 'storage policy mutation incomplete'; end if; end \$\$;"
run_case rbac "create function public.f31_forbidden_rpc() returns integer language sql as \$\$select 1\$\$; grant execute on function public.f31_forbidden_rpc() to anon;"
run_case idempotency "do \$\$ declare c text; begin select c.conname into c from pg_constraint c join pg_class r on r.oid=c.conrelid join pg_namespace n on n.oid=r.relnamespace where n.nspname='public' and r.relname='orders' and c.contype='u' and pg_get_constraintdef(c.oid) like '%(organization_id, idempotency_key)%' limit 1; if c is null then raise exception 'idempotency constraint not found'; end if; execute format('alter table public.orders drop constraint %I', c); end \$\$;"
run_case outbox "drop function public.claim_outbox_events(integer);"

MUTATED_PROBE="${OUT}/f04-contract-mutated.test.sql"
ORIGINAL_PROBE="${OUT}/f04-contract-original.test.sql"
cp "$PROBE" "$ORIGINAL_PROBE"
cp "$PROBE" "$MUTATED_PROBE"
python - "$MUTATED_PROBE" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
s = p.read_text()
needle = "2::bigint,'valid transfer');"
replacement = "999::bigint,'valid transfer');"
if needle not in s:
    raise SystemExit('F04 mutation target not found: expected result literal is absent')
p.write_text(s.replace(needle, replacement, 1))
PY

echo '===== F31 F04 contract mutation ====='
supabase db reset --local --no-seed
run_probe "f04-contract-baseline"
assert_green "$OUT/f04-contract-baseline.tap"
cp "$MUTATED_PROBE" "$PROBE"
set +e
run_probe "f04-contract-mutated"
set -e
cp "$ORIGINAL_PROBE" "$PROBE"
assert_red "$OUT/f04-contract-mutated.tap"
supabase db reset --local --no-seed
run_probe "f04-contract-restored"
assert_green "$OUT/f04-contract-restored.tap"
rm -f "$ORIGINAL_PROBE" "$MUTATED_PROBE"

supabase stop --no-backup

echo 'F31 mutation proof PASS: eight security/domain boundaries plus a real F04 contract mutation detected failure and returned green after clean reset.'

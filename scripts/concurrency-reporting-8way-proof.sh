#!/usr/bin/env bash
set -euo pipefail

PSQL=(psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -X -q -t -A)
ORG='e8000000-0000-4000-8000-000000000001'
ADMIN='e8000000-0000-4000-8000-000000000002'
KEY='cm-report-8way-20260918'
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

"${PSQL[@]}" <<SQL
begin;
create extension if not exists pgcrypto;
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at)
values ('$ADMIN',(select id from auth.instances limit 1),'authenticated','authenticated','cm-report-8way@test.local','x',now(),now(),now())
on conflict (id) do nothing;
insert into public.organizations(id,name,is_active)
values ('$ORG','Concurrency Reporting 8-Way',true)
on conflict (id) do nothing;
insert into public.profiles(id,organization_id,role)
values ('$ADMIN','$ORG','admin')
on conflict (id) do nothing;
delete from public.reporting_exports where organization_id='$ORG' and idempotency_key='$KEY';
commit;
SQL

run_request() {
  local output="$1";
  ("${PSQL[@]}" >"$output" 2>&1 <<SQL
begin;
set local role authenticated;
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub','$ADMIN',true);
select id::text || '|' || dataset_id || '|' || processing_status
from public.request_reporting_export('orders','2026.09','1.0','$KEY');
commit;
SQL
  ) & echo $!
}

last_line() {
  awk 'NF { v=$0 } END { print v }' "$1"
}

run_phase() {
  local phase="$1";
  local pids=();
  for i in $(seq 1 8); do
    run_request "$TMPDIR/${phase}-${i}" >"$TMPDIR/${phase}-pid-${i}"
    pids+=("$(cat "$TMPDIR/${phase}-pid-${i}")")
  done
  local failed=0;
  for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
  [ "$failed" -eq 0 ] || { echo "FAIL $phase: non-zero request"; cat "$TMPDIR/${phase}-"*; exit 1; }

  local canonical="";
  for i in $(seq 1 8); do
    local row="$(last_line "$TMPDIR/${phase}-${i}")";
    [ -n "$row" ] || { echo "FAIL $phase: request $i returned empty output"; cat "$TMPDIR/${phase}-${i}"; exit 1; }
    if [ -z "$canonical" ]; then
      canonical="$row"
    else
      [ "$row" = "$canonical" ] || { echo "FAIL $phase: request $i non-canonical: $row vs $canonical"; exit 1; }
    fi
  done
  echo "PASS $phase: 8/8 identical canonical results = $canonical"
}

run_phase initial
run_phase replay

ROWS=$("${PSQL[@]}" -c "select count(*) from public.reporting_exports where organization_id='$ORG' and idempotency_key='$KEY';")
[ "$ROWS" = "1" ] || { echo "FAIL final row count=$ROWS"; exit 1; }
CANONICAL_ROW="$(last_line "$TMPDIR/initial-1")"
CANONICAL_ID="${CANONICAL_ROW%%|*}"
CANONICAL_DATASET="$(printf '%s\n' "$CANONICAL_ROW" | cut -d'|' -f2)"
FINAL_ID=$("${PSQL[@]}" -c "select id::text from public.reporting_exports where organization_id='$ORG' and idempotency_key='$KEY';")
FINAL_DATASET=$("${PSQL[@]}" -c "select dataset_id from public.reporting_exports where organization_id='$ORG' and idempotency_key='$KEY';")
[ "$FINAL_ID" = "$CANONICAL_ID" ] || { echo "FAIL canonical id mismatch final=$FINAL_ID initial=$CANONICAL_ID"; exit 1; }
[ "$FINAL_DATASET" = "$CANONICAL_DATASET" ] || { echo "FAIL canonical dataset mismatch final=$FINAL_DATASET initial=$CANONICAL_DATASET"; exit 1; }

printf '%s\n' \
  'PASS: reporting 8-way concurrency proof' \
  'INITIAL CONCURRENT REQUESTS: 8' \
  'CONCURRENT REPLAY REQUESTS: 8' \
  'FINAL UNIQUE REPORTING ROWS: 1' \
  'CANONICAL RESULT: stable across all 16 requests'

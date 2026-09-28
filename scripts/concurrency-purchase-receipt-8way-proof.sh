#!/usr/bin/env bash
set -euo pipefail

PSQL=(psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -X -q -t -A)
ORG='f9000000-0000-4000-8000-000000000001'
USER='f9000000-0000-4000-8000-000000000002'
CUSTOMER='f9000000-0000-4000-8000-000000000003'
BRANCH='f9000000-0000-4000-8000-000000000004'
WAREHOUSE='f9000000-0000-4000-8000-000000000005'
SUPPLIER='f9000000-0000-4000-8000-000000000006'
PRODUCT='f9000000-0000-4000-8000-000000000007'
PURCHASE_KEY='purchase-8way-20260928'
RECEIPT_KEY='receipt-8way-20260928'
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

"${PSQL[@]}" <<SQL
begin;
create extension if not exists pgcrypto;
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at)
values ('$USER',(select id from auth.instances limit 1),'authenticated','authenticated','purchase-8way@test.local','x',now(),now(),now());
insert into public.organizations(id,name,is_active) values ('$ORG','Purchase Receipt 8-Way Proof',true);
insert into public.customers(id,organization_id,name,tier,is_active) values ('$CUSTOMER','$ORG','Purchase Receipt 8-Way Customer','retail',true);
insert into public.profiles(id,organization_id,customer_id,role) values ('$USER','$ORG','$CUSTOMER','admin');
insert into public.branches(id,organization_id,name,is_active) values ('$BRANCH','$ORG','Purchase Receipt Branch',true);
insert into public.warehouses(id,organization_id,branch_id,name,is_active) values ('$WAREHOUSE','$ORG','$BRANCH','Purchase Receipt Warehouse',true);
insert into public.suppliers(id,organization_id,name,is_active) values ('$SUPPLIER','$ORG','Purchase Receipt Supplier',true);
insert into public.products(id,organization_id,sku,name,unit,status) values ('$PRODUCT','$ORG','PUR-8WAY','Purchase Receipt Product','unit','active');
insert into public.inventory_balances(organization_id,warehouse_id,product_id,quantity) values ('$ORG','$WAREHOUSE','$PRODUCT',10);
commit;
SQL

run_purchase() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select purchase_order_id::text from public.create_purchase_order(
  '$SUPPLIER'::uuid,
  '$WAREHOUSE'::uuid,
  '$PURCHASE_KEY',
  jsonb_build_array(jsonb_build_object('product_id','$PRODUCT'::uuid,'quantity',2,'unit_cost',50))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_purchase "$TMPDIR/purchase-$i" >"$TMPDIR/purchase-pid-$i"; pids+=("$(cat "$TMPDIR/purchase-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/purchase-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL purchase 8-way"
  echo "::error title=Purchase 8-way root cause::$details"
  exit 1
fi

canonical="$(grep -E '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}
[ -n "$canonical" ] || { echo "FAIL missing purchase id"; exit 1; }
for i in $(seq 1 8); do
  value="$(grep -E '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | grep -E '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(grep -E '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(grep -E '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-1" | head -n1)"
[ -n "$canonical" ] || { echo "FAIL missing purchase id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/purchase-$i")"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-$i" | head -n1)"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-1" | head -n1)"
[ -n "$canonical" ] || { echo "FAIL missing purchase id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/purchase-$i")"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 | head -n1)"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-1" | head -n1)"
[ -n "$canonical" ] || { echo "FAIL missing purchase id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/purchase-$i")"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-$i" | head -n1)"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-1" | head -n1)"
[ -n "$canonical" ] || { echo "FAIL missing purchase id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/purchase-$i")"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/receipt-1" | head -n1)"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-1" | head -n1)"
[ -n "$canonical" ] || { echo "FAIL missing purchase id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/purchase-$i")"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-$i" | head -n1)"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-1" | head -n1)"
[ -n "$canonical" ] || { echo "FAIL missing purchase id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/purchase-$i")"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 | head -n1)"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-1" | head -n1)"
[ -n "$canonical" ] || { echo "FAIL missing purchase id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/purchase-$i")"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-$i" | head -n1)"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-1" | head -n1)"
[ -n "$canonical" ] || { echo "FAIL missing purchase id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/purchase-$i")"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/receipt-$i" | head -n1)"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-1" | head -n1)"
[ -n "$canonical" ] || { echo "FAIL missing purchase id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/purchase-$i")"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-$i" | head -n1)"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-1" | head -n1)"
[ -n "$canonical" ] || { echo "FAIL missing purchase id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/purchase-$i")"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 | head -n1)"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-1" | head -n1)"
[ -n "$canonical" ] || { echo "FAIL missing purchase id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/purchase-$i")"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-$i" | head -n1)"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-1" | head -n1)"
[ -n "$canonical" ] || { echo "FAIL missing purchase id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/purchase-$i")"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/receipt-1" | head -n1)"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-1" | head -n1)"
[ -n "$canonical" ] || { echo "FAIL missing purchase id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/purchase-$i")"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-$i" | head -n1)"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-1" | head -n1)"
[ -n "$canonical" ] || { echo "FAIL missing purchase id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/purchase-$i")"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 | head -n1)"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-1" | head -n1)"
[ -n "$canonical" ] || { echo "FAIL missing purchase id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/purchase-$i")"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-$i" | head -n1)"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"
 "$TMPDIR/purchase-1" | head -n1)"
[ -n "$canonical" ] || { echo "FAIL missing purchase id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/purchase-$i")"
  [ "$value" = "$canonical" ] || { echo "FAIL purchase result mismatch request=$i"; exit 1; }
done

purchase_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG' and idempotency_key='$PURCHASE_KEY';")"
purchase_items="$("${PSQL[@]}" -c "select count(*) from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid;")"
[ "$purchase_count" = "1" ] || { echo "FAIL purchase rows=$purchase_count"; exit 1; }
[ "$purchase_items" = "1" ] || { echo "FAIL purchase items=$purchase_items"; exit 1; }

ITEM="$("${PSQL[@]}" -c "select id from public.purchase_order_items where organization_id='$ORG' and purchase_order_id='$canonical'::uuid limit 1;")"
ITEM="$(printf '%s\n' "$ITEM" | awk 'NF {print $1; exit}')"
"${PSQL[@]}" -c "update public.purchase_orders set status='approved'::public.purchase_order_status where organization_id='$ORG' and id='$canonical'::uuid;" >/dev/null

run_receipt() {
  local out="$1"
  ( "${PSQL[@]}" >"$out" 2>&1 <<SQL
begin;
set local role authenticated;
do $
begin
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','$USER',true);
end $;
select receipt_id::text from public.receive_purchase_order(
  '$canonical'::uuid,
  '$RECEIPT_KEY',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id','$ITEM'::uuid,'product_id','$PRODUCT'::uuid,'quantity',2))
);
commit;
SQL
  ) & echo $!
}

pids=()
for i in $(seq 1 8); do run_receipt "$TMPDIR/receipt-$i" >"$TMPDIR/receipt-pid-$i"; pids+=("$(cat "$TMPDIR/receipt-pid-$i")"); done
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [ "$failed" -ne 0 ]; then
  details="$(cat "$TMPDIR"/receipt-* 2>/dev/null | tr '\n' ' ' | cut -c1-1200)"
  echo "FAIL receipt 8-way"
  echo "::error title=Receipt 8-way root cause::$details"
  exit 1
fi

receipt_canonical="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-1")"
[ -n "$receipt_canonical" ] || { echo "FAIL missing receipt id"; exit 1; }
for i in $(seq 1 8); do
  value="$(awk 'NF {print $1; exit}' "$TMPDIR/receipt-$i")"
  [ "$value" = "$receipt_canonical" ] || { echo "FAIL receipt result mismatch request=$i"; exit 1; }
done

receipt_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG' and idempotency_key='$RECEIPT_KEY';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")"
movements="$("${PSQL[@]}" -c "select count(*) from public.inventory_movements where organization_id='$ORG' and source_type='purchase_receipt' and source_id='$receipt_canonical'::uuid;")"
outbox="$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='purchase.received' and payload->>'receipt_id'='$receipt_canonical';")"

[ "$receipt_count" = "1" ] || { echo "FAIL receipt rows=$receipt_count"; exit 1; }
[ "$stock" = "12" ] || { echo "FAIL inventory stock=$stock expected=12"; exit 1; }
[ "$movements" = "1" ] || { echo "FAIL inventory movements=$movements"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL purchase.received outbox=$outbox"; exit 1; }

echo "PURCHASE_RECEIPT_8WAY_PASS purchase_requests=8 purchase_orders=1 purchase_items=1 receipt_requests=8 receipts=1 stock=12 inventory_movements=1 purchase_received_outbox=1"

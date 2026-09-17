#!/usr/bin/env bash
set -euo pipefail

PSQL=(psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -X -q -t -A)
ORG='d8000000-0000-4000-8000-000000000001'
USER='d8000000-0000-4000-8000-000000000002'
CUSTOMER='d8000000-0000-4000-8000-000000000003'
BRANCH='d8000000-0000-4000-8000-000000000004'
WAREHOUSE='d8000000-0000-4000-8000-000000000005'
PRODUCT='d8000000-0000-4000-8000-000000000006'
KEY='order-8way-idempotency-20260918'

"${PSQL[@]}" <<SQL
begin;
create extension if not exists pgcrypto;
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at)
values ('$USER',(select id from auth.instances limit 1),'authenticated','authenticated','order-8way@test.local','x',now(),now(),now());
insert into public.organizations(id,name,is_active) values ('$ORG','Order 8-Way Proof',true);
insert into public.customers(id,organization_id,name,tier,is_active) values ('$CUSTOMER','$ORG','Order 8-Way Customer','retail',true);
insert into public.profiles(id,organization_id,customer_id,role) values ('$USER','$ORG','$CUSTOMER','viewer');
insert into public.branches(id,organization_id,name,is_active) values ('$BRANCH','$ORG','Order 8-Way Branch',true);
insert into public.warehouses(id,organization_id,branch_id,name,is_active) values ('$WAREHOUSE','$ORG','$BRANCH','Order 8-Way Warehouse',true);
insert into public.products(id,organization_id,sku,name,unit,status) values ('$PRODUCT','$ORG','ORDER-8WAY','Order 8-Way Product','unit','active');
insert into public.price_lists(organization_id,tier,name,currency,is_active) values ('$ORG','retail','Order 8-Way Retail','YER',true);
insert into public.product_prices(organization_id,price_list_id,product_id,amount,valid_from)
select '$ORG',id,'$PRODUCT',25,now() from public.price_lists where organization_id='$ORG';
insert into public.inventory_balances(organization_id,warehouse_id,product_id,quantity) values ('$ORG','$WAREHOUSE','$PRODUCT',20);
commit;
SQL

tmpdir=$(mktemp -d)
trap 'rm -rf "$tmpdir"' EXIT
last_line() { awk 'NF { v=$0 } END { print v }' "$1"; }

pids=()
for i in $(seq 1 8); do
  ("${PSQL[@]}" >"$tmpdir/initial-$i" 2>&1 <<SQL
begin;
set local role authenticated;
set local request.jwt.claim.role='authenticated';
set local request.jwt.claim.sub='$USER';
select * from public.create_order('$KEY','$WAREHOUSE'::uuid,jsonb_build_array(jsonb_build_object('product_id','$PRODUCT'::uuid,'quantity',2)));
commit;
SQL
  ) & pids+=("$!")
done
rc=0
for pid in "${pids[@]}"; do wait "$pid" || rc=1; done
if [ "$rc" -ne 0 ]; then
  echo 'FAIL order 8-way initial race: one or more requests failed'
  cat "$tmpdir"/initial-* || true
  exit 1
fi

canonical=''
for i in $(seq 1 8); do
  value=$(last_line "$tmpdir/initial-$i")
  [ -n "$value" ] || { echo "FAIL missing canonical output for initial request $i"; exit 1; }
  if [ -z "$canonical" ]; then canonical="$value"; else [ "$value" = "$canonical" ] || { echo "FAIL inconsistent initial result request=$i value=$value canonical=$canonical"; exit 1; }; fi
done

orders=$("${PSQL[@]}" -c "select count(*) from public.orders where organization_id='$ORG' and idempotency_key='$KEY';")
items=$("${PSQL[@]}" -c "select count(*) from public.order_items oi join public.orders o on o.id=oi.order_id where o.organization_id='$ORG' and o.idempotency_key='$KEY';")
outbox=$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='order.created' and payload->>'order_id'=(split_part('$canonical','|',1));")
stock=$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")
[ "$orders" = "1" ] || { echo "FAIL initial duplicate orders: $orders"; exit 1; }
[ "$items" = "1" ] || { echo "FAIL initial duplicate order items: $items"; exit 1; }
[ "$outbox" = "1" ] || { echo "FAIL initial duplicate outbox: $outbox"; exit 1; }
[ "$stock" = "18" ] || { echo "FAIL initial stock effect expected 18 got $stock"; exit 1; }

pids=()
for i in $(seq 1 8); do
  ("${PSQL[@]}" >"$tmpdir/replay-$i" 2>&1 <<SQL
begin;
set local role authenticated;
set local request.jwt.claim.role='authenticated';
set local request.jwt.claim.sub='$USER';
select * from public.create_order('$KEY','$WAREHOUSE'::uuid,jsonb_build_array(jsonb_build_object('product_id','$PRODUCT'::uuid,'quantity',2)));
commit;
SQL
  ) & pids+=("$!")
done
rc=0
for pid in "${pids[@]}"; do wait "$pid" || rc=1; done
if [ "$rc" -ne 0 ]; then
  echo 'FAIL order 8-way replay race: one or more requests failed'
  cat "$tmpdir"/replay-* || true
  exit 1
fi
for i in $(seq 1 8); do
  value=$(last_line "$tmpdir/replay-$i")
  [ "$value" = "$canonical" ] || { echo "FAIL inconsistent replay result request=$i value=$value canonical=$canonical"; exit 1; }
done

orders2=$("${PSQL[@]}" -c "select count(*) from public.orders where organization_id='$ORG' and idempotency_key='$KEY';")
outbox2=$("${PSQL[@]}" -c "select count(*) from public.outbox_events where organization_id='$ORG' and event_type='order.created' and payload->>'order_id'=(split_part('$canonical','|',1));")
stock2=$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")
[ "$orders2" = "1" ] || { echo "FAIL replay duplicate orders: $orders2"; exit 1; }
[ "$outbox2" = "1" ] || { echo "FAIL replay duplicate outbox: $outbox2"; exit 1; }
[ "$stock2" = "18" ] || { echo "FAIL replay changed stock: $stock2"; exit 1; }

echo "ORDER_8WAY_PASS canonical=$canonical initial=8 replay=8 orders=1 items=1 outbox=1 stock=18"

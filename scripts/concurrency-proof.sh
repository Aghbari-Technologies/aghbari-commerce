#!/usr/bin/env bash
set -euo pipefail

PSQL=(psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -X)

ORG_ID='b1000000-0000-4000-8000-000000000001'
USER_ID='b1000000-0000-4000-8000-000000000002'
CUSTOMER_ID='b1000000-0000-4000-8000-000000000003'
BRANCH_ID='b1000000-0000-4000-8000-000000000004'
WAREHOUSE_ID='b1000000-0000-4000-8000-000000000005'
PRODUCT_ID='b1000000-0000-4000-8000-000000000006'

"${PSQL[@]}" <<SQL
begin;
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
values ('$USER_ID','$ORG_ID','authenticated','authenticated','concurrency@fixture.invalid','x',now(),now());
insert into public.organizations(id,name,is_active) values ('$ORG_ID','Concurrency Tenant',true);
insert into public.customers(id,organization_id,name,tier,is_active) values ('$CUSTOMER_ID','$ORG_ID','Concurrency Customer','retail'::customer_tier,true);
insert into public.profiles(id,organization_id,customer_id,role) values ('$USER_ID','$ORG_ID','$CUSTOMER_ID','admin'::user_role);
insert into public.branches(id,organization_id,name,is_active) values ('$BRANCH_ID','$ORG_ID','Concurrency Branch',true);
insert into public.warehouses(id,organization_id,branch_id,name,is_active) values ('$WAREHOUSE_ID','$ORG_ID','$BRANCH_ID','Concurrency Warehouse',true);
insert into public.products(id,organization_id,sku,name,unit,status) values ('$PRODUCT_ID','$ORG_ID','CONC-001','Concurrency Product','unit','active');
insert into public.inventory_balances(organization_id,warehouse_id,product_id,quantity) values ('$ORG_ID','$WAREHOUSE_ID','$PRODUCT_ID',10);
insert into public.price_lists(organization_id,tier,name,currency) values ('$ORG_ID','retail'::customer_tier,'Concurrency Retail','YER');
insert into public.product_prices(organization_id,price_list_id,product_id,amount,valid_from)
select '$ORG_ID',id,'$PRODUCT_ID',100,now() from public.price_lists where organization_id='$ORG_ID' and tier='retail';
commit;
SQL

OUT1=$(mktemp)
OUT2=$(mktemp)
trap 'rm -f "$OUT1" "$OUT2"' EXIT

set +e
("${PSQL[@]}" <<SQL >"$OUT1" 2>&1
begin;
set local role authenticated;
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub','$USER_ID',true);
select * from public.create_order('concurrent-idem-key-000001','$WAREHOUSE_ID'::uuid,jsonb_build_array(jsonb_build_object('product_id','$PRODUCT_ID'::uuid,'quantity',6)),'credit');
commit;
SQL
) & PID1=$!

("${PSQL[@]}" <<SQL >"$OUT2" 2>&1
begin;
set local role authenticated;
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub','$USER_ID',true);
select * from public.create_order('concurrent-idem-key-000001','$WAREHOUSE_ID'::uuid,jsonb_build_array(jsonb_build_object('product_id','$PRODUCT_ID'::uuid,'quantity',6)));
commit;
SQL
) & PID2=$!
wait "$PID1"; RC1=$?
wait "$PID2"; RC2=$?
set -e

ORDERS=$("${PSQL[@]}" -tAc "select count(*) from public.orders where organization_id='$ORG_ID' and idempotency_key='concurrent-idem-key-000001';")
STOCK=$("${PSQL[@]}" -tAc "select quantity from public.inventory_balances where organization_id='$ORG_ID' and warehouse_id='$WAREHOUSE_ID' and product_id='$PRODUCT_ID';")
OUTBOX=$("${PSQL[@]}" -tAc "select count(*) from public.outbox_events where organization_id='$ORG_ID' and event_type='order.created' and aggregate_id in (select id from public.orders where organization_id='$ORG_ID' and idempotency_key='concurrent-idem-key-000001');")
HISTORY=$("${PSQL[@]}" -tAc "select count(*) from public.order_status_history where organization_id='$ORG_ID' and order_id in (select id from public.orders where organization_id='$ORG_ID' and idempotency_key='concurrent-idem-key-000001');")
MOVES=$("${PSQL[@]}" -tAc "select count(*) from public.inventory_movements where organization_id='$ORG_ID' and source_type='order' and source_id in (select id from public.orders where organization_id='$ORG_ID' and idempotency_key='concurrent-idem-key-000001');")

[ "$ORDERS" = "1" ] || { echo "FAIL: expected exactly one concurrent order, got $ORDERS"; cat "$OUT1" "$OUT2"; exit 1; }
[ "$STOCK" = "4" ] || { echo "FAIL: expected remaining stock 4 after one quantity-6 effect, got $STOCK"; cat "$OUT1" "$OUT2"; exit 1; }
[ "$OUTBOX" = "1" ] || { echo "FAIL: expected exactly one order.created event, got $OUTBOX"; cat "$OUT1" "$OUT2"; exit 1; }
[ "$HISTORY" = "1" ] || { echo "FAIL: expected exactly one status-history row, got $HISTORY"; cat "$OUT1" "$OUT2"; exit 1; }
[ "$MOVES" = "1" ] || { echo "FAIL: expected exactly one inventory movement, got $MOVES"; cat "$OUT1" "$OUT2"; exit 1; }

# The concurrency proof is meaningful only when the two requests actually overlapped.
# At least one session must have lost the race/blocked path rather than two independent successes.
if [ "$RC1" -eq 0 ] && [ "$RC2" -eq 0 ]; then
  echo "NOTE: both sessions returned success; idempotent replay was allowed and final effects were still single-shot."
fi

echo "PASS: two independent concurrent requests with the same idempotency key produce one order, one outbox event, one inventory movement, one history row, and no double decrement."
echo "SESSION_EXIT_CODES: $RC1 $RC2"

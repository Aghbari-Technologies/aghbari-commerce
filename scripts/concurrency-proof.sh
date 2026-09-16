#!/usr/bin/env bash
set -euo pipefail

PSQL=(psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -X)

"${PSQL[@]}" <<'SQL'
begin;
create temp table concurrency_fixture as
select gen_random_uuid() org_id, gen_random_uuid() user_id, gen_random_uuid() customer_id,
       gen_random_uuid() branch_id, gen_random_uuid() warehouse_id, gen_random_uuid() product_id;
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
select user_id,'00000000-0000-0000-0000-000000000000'::uuid,'authenticated','authenticated','concurrency@fixture.invalid','x',now(),now() from concurrency_fixture;
insert into public.organizations(id,name,is_active) select org_id,'Concurrency Tenant',true from concurrency_fixture;
insert into public.customers(id,organization_id,name,tier,is_active) select customer_id,org_id,'Concurrency Customer','retail'::customer_tier,true from concurrency_fixture;
insert into public.profiles(id,organization_id,customer_id,role) select user_id,org_id,customer_id,'admin'::user_role from concurrency_fixture;
insert into public.branches(id,organization_id,name,is_active) select branch_id,org_id,'Concurrency Branch',true from concurrency_fixture;
insert into public.warehouses(id,organization_id,branch_id,name,is_active) select warehouse_id,org_id,branch_id,'Concurrency Warehouse',true from concurrency_fixture;
insert into public.products(id,organization_id,sku,name,unit,status) select product_id,org_id,'CONC-001','Concurrency Product','unit','active' from concurrency_fixture;
insert into public.inventory_balances(organization_id,warehouse_id,product_id,quantity) select org_id,warehouse_id,product_id,10 from concurrency_fixture;
insert into public.price_lists(organization_id,tier,name,currency) select org_id,'retail'::customer_tier,'Concurrency Retail','YER' from concurrency_fixture;
insert into public.product_prices(organization_id,price_list_id,product_id,amount,valid_from)
select f.org_id,pl.id,f.product_id,100,now() from concurrency_fixture f join public.price_lists pl on pl.organization_id=f.org_id;
commit;
SQL

OUT1=$(mktemp)
OUT2=$(mktemp)
trap 'rm -f "$OUT1" "$OUT2"' EXIT

set +e
("${PSQL[@]}" <<'SQL' >"$OUT1" 2>&1
set local role authenticated;
select set_config('request.jwt.claim.role','authenticated',false);
select set_config('request.jwt.claim.sub',(select user_id::text from concurrency_fixture),false);
select * from public.create_order('concurrent-idem-key-000001',(select warehouse_id from concurrency_fixture),jsonb_build_array(jsonb_build_object('product_id',(select product_id from concurrency_fixture),'quantity',6)));
SQL
) & PID1=$!

("${PSQL[@]}" <<'SQL' >"$OUT2" 2>&1
set local role authenticated;
select set_config('request.jwt.claim.role','authenticated',false);
select set_config('request.jwt.claim.sub',(select user_id::text from concurrency_fixture),false);
select * from public.create_order('concurrent-idem-key-000001',(select warehouse_id from concurrency_fixture),jsonb_build_array(jsonb_build_object('product_id',(select product_id from concurrency_fixture),'quantity',6)));
SQL
) & PID2=$!
wait "$PID1"; RC1=$?
wait "$PID2"; RC2=$?
set -e

# Both sessions may succeed by receiving the same idempotent result, or one may
# lose the race and fail before the winner commits. What is forbidden is two orders.
"${PSQL[@]}" <<'SQL'
select count(*) as orders_for_key,
       coalesce(sum((select quantity from public.order_items oi where oi.order_id=o.id)),0) as ordered_units,
       (select quantity from public.inventory_balances where warehouse_id=(select warehouse_id from concurrency_fixture) and product_id=(select product_id from concurrency_fixture)) as remaining_stock,
       (select count(*) from public.outbox_events where aggregate_type='order' and event_type='order.created' and aggregate_id in (select id from public.orders where idempotency_key='concurrent-idem-key-000001')) as outbox_events
from public.orders o where o.idempotency_key='concurrent-idem-key-000001';
SQL

ORDERS=$("${PSQL[@]}" -tAc "select count(*) from public.orders where idempotency_key='concurrent-idem-key-000001';")
STOCK=$("${PSQL[@]}" -tAc "select quantity from public.inventory_balances where warehouse_id=(select warehouse_id from concurrency_fixture) and product_id=(select product_id from concurrency_fixture);")
OUTBOX=$("${PSQL[@]}" -tAc "select count(*) from public.outbox_events where event_type='order.created' and aggregate_id in (select id from public.orders where idempotency_key='concurrent-idem-key-000001');")

[ "$ORDERS" = "1" ] || { echo "FAIL: expected exactly one concurrent order, got $ORDERS"; cat "$OUT1" "$OUT2"; exit 1; }
[ "$STOCK" = "4" ] || { echo "FAIL: expected stock 4 after one quantity-6 effect, got $STOCK"; cat "$OUT1" "$OUT2"; exit 1; }
[ "$OUTBOX" = "1" ] || { echo "FAIL: expected exactly one order.created event, got $OUTBOX"; cat "$OUT1" "$OUT2"; exit 1; }

echo "PASS: concurrent duplicate order produces one business effect, one outbox event, and no double decrement."
echo "SESSION_EXIT_CODES: $RC1 $RC2"

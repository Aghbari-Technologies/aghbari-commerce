#!/usr/bin/env bash
set -euo pipefail

: "${PGHOST:=127.0.0.1}"
: "${PGPORT:=54322}"
: "${PGUSER:=postgres}"
: "${PGPASSWORD:=postgres}"
: "${PGDATABASE:=postgres}"
export PGHOST PGPORT PGUSER PGPASSWORD PGDATABASE

psql_cmd=(psql -v ON_ERROR_STOP=1 -X)

echo 'Preparing isolated concurrency fixture...'
"${psql_cmd[@]}" <<'SQL'
begin;
insert into auth.users (id,email)
values ('4a4d5d91-bb5c-4c8b-ae9a-100000000001','concurrency-a@test.local'),
       ('4a4d5d91-bb5c-4c8b-ae9a-100000000002','concurrency-b@test.local');
insert into public.organizations(id,name) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Concurrency Tenant')
  on conflict do nothing;
insert into public.branches(id,organization_id,name) values
  ('c0000000-0000-4000-8000-000000000001','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Concurrency Branch')
  on conflict do nothing;
insert into public.warehouses(id,organization_id,branch_id,name) values
  ('c0000000-0000-4000-8000-000000000011','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','c0000000-0000-4000-8000-000000000001','Concurrency Warehouse')
  on conflict do nothing;
insert into public.customers(id,organization_id,name,tier) values
  ('a0000000-0000-4000-8000-000000000111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Concurrency Customer A','wholesale')
  on conflict do nothing;
insert into public.customers(id,organization_id,name,tier) values
  ('a0000000-0000-4000-8000-000000000112','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Concurrency Customer B','wholesale')
  on conflict do nothing;
insert into public.profiles(id,organization_id,customer_id,role) values
  ('4a4d5d91-bb5c-4c8b-ae9a-100000000001','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','a0000000-0000-4000-8000-000000000111','viewer'),
  ('4a4d5d91-bb5c-4c8b-ae9a-100000000002','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','a0000000-0000-4000-8000-000000000112','viewer')
  on conflict (id) do nothing;
insert into public.products(id,organization_id,sku,name,unit,status) values
  ('a0000000-0000-4000-8000-000000010011','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','CONC-001','Concurrency Product','كرتون','active')
  on conflict do nothing;
insert into public.price_lists(id,organization_id,tier,name,currency,is_active) values
  ('c0000000-0000-4000-8000-000000000101','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','wholesale','Concurrency Wholesale','YER',true)
  on conflict do nothing;
insert into public.product_prices(organization_id,price_list_id,product_id,amount)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','c0000000-0000-4000-8000-000000000101','a0000000-0000-4000-8000-000000010011',1000)
on conflict do nothing;
insert into public.inventory_balances(organization_id,warehouse_id,product_id,quantity)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','c0000000-0000-4000-8000-000000000011','a0000000-0000-4000-8000-000000010011',10)
on conflict (warehouse_id,product_id) do update set quantity=10,updated_at=now();
commit;
SQL

run_order() {
  local user_id="$1"
  local key="$2"
  local quantity="$3"
  local output="$4"
  PGPASSWORD="$PGPASSWORD" PGOPTIONS="-c request.jwt.claims=$(printf '{\"sub\":\"%s\"}' "$user_id")" \
    "${psql_cmd[@]}" -tA -c "select * from public.create_order('${key}','c0000000-0000-4000-8000-000000000011','[{\"product_id\":\"a0000000-0000-4000-8000-000000010011\",\"quantity\":${quantity}}]'::jsonb);" >"$output" 2>&1 || true
}

rm -f /tmp/aghbari-concurrency-a /tmp/aghbari-concurrency-b
run_order '4a4d5d91-bb5c-4c8b-ae9a-100000000001' 'CONCURRENCY-PROOF-A-20260911' 8 /tmp/aghbari-concurrency-a &
pid_a=$!
run_order '4a4d5d91-bb5c-4c8b-ae9a-100000000002' 'CONCURRENCY-PROOF-B-20260911' 8 /tmp/aghbari-concurrency-b &
pid_b=$!
wait "$pid_a" "$pid_b"

echo '--- Session A ---'
cat /tmp/aghbari-concurrency-a
echo '--- Session B ---'
cat /tmp/aghbari-concurrency-b

successes=$(grep -l 'pending' /tmp/aghbari-concurrency-a /tmp/aghbari-concurrency-b | wc -l | tr -d ' ')
if [[ "$successes" -ne 1 ]]; then
  echo "EXPECTED exactly one successful 8-unit order, observed $successes"
  exit 1
fi

remaining=$(psql -v ON_ERROR_STOP=1 -X -tA -c "select quantity from public.inventory_balances where warehouse_id='c0000000-0000-4000-8000-000000000011' and product_id='a0000000-0000-4000-8000-000000010011';")
echo "FINAL STOCK AFTER RACE: $remaining"
test "$remaining" = '2'

echo '--- Idempotency ---'
psql -v ON_ERROR_STOP=1 -X -c "update public.inventory_balances set quantity=10, updated_at=now() where warehouse_id='c0000000-0000-4000-8000-000000000011' and product_id='a0000000-0000-4000-8000-000000010011';"
rm -f /tmp/aghbari-idempotency-1 /tmp/aghbari-idempotency-2
run_order '4a4d5d91-bb5c-4c8b-ae9a-100000000001' 'CONCURRENCY-IDEMPOTENCY-20260911' 1 /tmp/aghbari-idempotency-1
run_order '4a4d5d91-bb5c-4c8b-ae9a-100000000001' 'CONCURRENCY-IDEMPOTENCY-20260911' 1 /tmp/aghbari-idempotency-2
cat /tmp/aghbari-idempotency-1
cat /tmp/aghbari-idempotency-2
idempotent_orders=$(psql -v ON_ERROR_STOP=1 -X -tA -c "select count(*) from public.orders where idempotency_key='CONCURRENCY-IDEMPOTENCY-20260911';" | tr -d ' ')
idempotent_stock=$(psql -v ON_ERROR_STOP=1 -X -tA -c "select quantity from public.inventory_balances where warehouse_id='c0000000-0000-4000-8000-000000000011' and product_id='a0000000-0000-4000-8000-000000010011';" | tr -d ' ')
echo "IDEMPOTENCY ORDER COUNT: $idempotent_orders"
echo "IDEMPOTENCY FINAL STOCK: $idempotent_stock"
test "$idempotent_orders" = '1'
test "$idempotent_stock" = '9'

echo 'CONCURRENCY PROOF: PASS — one request committed 8 units, the competing request was rejected, final DB stock=2.'
echo 'IDEMPOTENCY PROOF: PASS — duplicate submission reused one order and consumed one unit, final DB stock=9.'

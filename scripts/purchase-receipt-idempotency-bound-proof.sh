#!/usr/bin/env bash
set -euo pipefail

PSQL=(psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -X -q -t -A)

ORG_ID='c1000000-0000-4000-8000-000000000001'
USER_ID='c1000000-0000-4000-8000-000000000002'
SUPPLIER_ID='c1000000-0000-4000-8000-000000000003'
BRANCH_ID='c1000000-0000-4000-8000-000000000004'
WAREHOUSE_ID='c1000000-0000-4000-8000-000000000005'
PRODUCT_ID='c1000000-0000-4000-8000-000000000006'
PO_ID='c1000000-0000-4000-8000-000000000007'
KEY128=$(printf 'p%.0s' {1..128})
KEY129=$(printf 'q%.0s' {1..129})
RECEIPT128=$(printf 'r%.0s' {1..128})
RECEIPT129=$(printf 's%.0s' {1..129})

"${PSQL[@]}" <<SQL
begin;
create extension if not exists pgcrypto;
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at)
values ('$USER_ID',(select id from auth.instances limit 1),'authenticated','authenticated','purchase-boundary@test.local','x',now(),now(),now());
insert into public.organizations(id,name,is_active) values ('$ORG_ID','Purchase Boundary Tenant',true);
insert into public.customers(id,organization_id,name,tier,is_active) values ('$USER_ID','$ORG_ID','Purchase Boundary Customer','retail'::customer_tier,true);
insert into public.profiles(id,organization_id,customer_id,role) values ('$USER_ID','$ORG_ID',null,'admin'::user_role);
insert into public.branches(id,organization_id,name,is_active) values ('$BRANCH_ID','$ORG_ID','Purchase Boundary Branch',true);
insert into public.warehouses(id,organization_id,branch_id,name,is_active) values ('$WAREHOUSE_ID','$ORG_ID','$BRANCH_ID','Purchase Boundary Warehouse',true);
insert into public.suppliers(id,organization_id,name,is_active) values ('$SUPPLIER_ID','$ORG_ID','Purchase Boundary Supplier',true);
insert into public.products(id,organization_id,sku,name,unit,status) values ('$PRODUCT_ID','$ORG_ID','PB-001','Purchase Boundary Product','unit','active');
insert into public.purchase_orders(id,organization_id,supplier_id,warehouse_id,status,currency,subtotal,total,idempotency_key,created_by)
values ('$PO_ID','$ORG_ID','$SUPPLIER_ID','$WAREHOUSE_ID','approved'::purchase_order_status,'YER',100,100,'seed-receipt-order-key','$USER_ID');
insert into public.purchase_order_items(organization_id,purchase_order_id,product_id,quantity_ordered,quantity_received,unit_cost)
values ('$ORG_ID','$PO_ID','$PRODUCT_ID',1,0,100);
commit;
SQL

call_create() {
  local key="$1"
  "${PSQL[@]}" <<SQL
begin;
set local role authenticated;
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub','$USER_ID',true);
select * from public.create_purchase_order(
  '$SUPPLIER_ID'::uuid,
  '$WAREHOUSE_ID'::uuid,
  '$key',
  jsonb_build_array(jsonb_build_object('product_id','$PRODUCT_ID'::uuid,'quantity',1,'unit_cost',100)),
  'YER',
  'boundary proof'
);
commit;
SQL
}

call_receive() {
  local key="$1"
  "${PSQL[@]}" <<SQL
begin;
set local role authenticated;
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub','$USER_ID',true);
select * from public.receive_purchase_order(
  '$PO_ID'::uuid,
  '$key',
  jsonb_build_array(jsonb_build_object('purchase_order_item_id',(select id from public.purchase_order_items where purchase_order_id='$PO_ID' and product_id='$PRODUCT_ID' limit 1),'product_id','$PRODUCT_ID'::uuid,'quantity',1)),
  'boundary receipt'
);
commit;
SQL
}

if ! create_out="$(call_create "$KEY128" 2>&1)"; then
  echo "FAIL create_purchase_order rejected a 128-character idempotency key"
  printf '%s\n' "$create_out"
  exit 1
fi

set +e
create_bad_out="$(call_create "$KEY129" 2>&1)"
create_bad_rc=$?
set -e
[ "$create_bad_rc" -ne 0 ] || {
  echo "FAIL create_purchase_order accepted a 129-character idempotency key"
  printf '%s\n' "$create_bad_out"
  exit 1
}

create_128_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG_ID' and idempotency_key='$KEY128';")"
create_129_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_orders where organization_id='$ORG_ID' and idempotency_key='$KEY129';")"
[ "$create_128_count" = "1" ] || { echo "FAIL expected one 128-key purchase order, got $create_128_count"; exit 1; }
[ "$create_129_count" = "0" ] || { echo "FAIL 129-key purchase order side-effect detected: $create_129_count"; exit 1; }

if ! receive_out="$(call_receive "$RECEIPT128" 2>&1)"; then
  echo "FAIL receive_purchase_order rejected a 128-character idempotency key"
  printf '%s\n' "$receive_out"
  exit 1
fi

set +e
receive_bad_out="$(call_receive "$RECEIPT129" 2>&1)"
receive_bad_rc=$?
set -e
[ "$receive_bad_rc" -ne 0 ] || {
  echo "FAIL receive_purchase_order accepted a 129-character idempotency key"
  printf '%s\n' "$receive_bad_out"
  exit 1
}

receipt_128_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG_ID' and idempotency_key='$RECEIPT128';")"
receipt_129_count="$("${PSQL[@]}" -c "select count(*) from public.purchase_receipts where organization_id='$ORG_ID' and idempotency_key='$RECEIPT129';")"
stock="$("${PSQL[@]}" -c "select quantity from public.inventory_balances where organization_id='$ORG_ID' and warehouse_id='$WAREHOUSE_ID' and product_id='$PRODUCT_ID';")"
[ "$receipt_128_count" = "1" ] || { echo "FAIL expected one 128-key receipt, got $receipt_128_count"; exit 1; }
[ "$receipt_129_count" = "0" ] || { echo "FAIL 129-key receipt side-effect detected: $receipt_129_count"; exit 1; }
[ "$stock" = "1" ] || { echo "FAIL expected inventory effect from accepted receipt = 1, got $stock"; exit 1; }

echo "PURCHASE_RECEIPT_IDEMPOTENCY_BOUNDARY_PASS create_128=accepted create_129=rejected receive_128=accepted receive_129=rejected no_129_side_effects stock=$stock"

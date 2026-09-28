#!/usr/bin/env bash
set -euo pipefail

PSQL=(psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -X)
ORG_A='d1000000-0000-4000-8000-000000000001'
ORG_B='d1000000-0000-4000-8000-000000000002'
ADMIN='d1000000-0000-4000-8000-000000000003'
CUSTOMER='d1000000-0000-4000-8000-000000000004'
CUSTOMER_2='d1000000-0000-4000-8000-000000000005'
BRANCH='d1000000-0000-4000-8000-000000000006'
WAREHOUSE='d1000000-0000-4000-8000-000000000007'
PRODUCT='d1000000-0000-4000-8000-000000000008'
IMPORT_JOB_USER='d1000000-0000-4000-8000-000000000009'
INVITE_USER_A='d1000000-0000-4000-8000-000000000010'
INVITE_USER_B='d1000000-0000-4000-8000-000000000011'
INVITATION='d1000000-0000-4000-8000-000000000012'
OUTBOX_EVENT='d1000000-0000-4000-8000-000000000013'
TOKEN='abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789'

"${PSQL[@]}" <<SQL
begin;
create extension if not exists pgcrypto;
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at)
values
 ('$ADMIN',(select id from auth.instances limit 1),'authenticated','authenticated','conc-admin@test.local','x',now(),now(),now()),
 ('$IMPORT_JOB_USER',(select id from auth.instances limit 1),'authenticated','authenticated','conc-import@test.local','x',now(),now(),now()),
 ('$INVITE_USER_A',(select id from auth.instances limit 1),'authenticated','authenticated','conc-invite-a@test.local','x',now(),now(),now()),
 ('$INVITE_USER_B',(select id from auth.instances limit 1),'authenticated','authenticated','conc-invite-b@test.local','x',now(),now(),now());
insert into public.organizations(id,name,is_active) values
 ('$ORG_A','Concurrency Matrix A',true),('$ORG_B','Concurrency Matrix B',true);
insert into public.customers(id,organization_id,name,tier,is_active) values
 ('$CUSTOMER','$ORG_A','Concurrency Customer','retail',true),('$CUSTOMER_2','$ORG_A','Concurrency Customer 2','retail',true);
insert into public.profiles(id,organization_id,customer_id,role) values
 ('$ADMIN','$ORG_A','$CUSTOMER','admin'),('$IMPORT_JOB_USER','$ORG_A','$CUSTOMER_2','admin');
insert into public.branches(id,organization_id,name,is_active) values ('$BRANCH','$ORG_A','Concurrency Branch',true);
insert into public.warehouses(id,organization_id,branch_id,name,is_active) values ('$WAREHOUSE','$ORG_A','$BRANCH','Concurrency Warehouse',true);
insert into public.products(id,organization_id,sku,name,unit,status) values ('$PRODUCT','$ORG_A','CM-001','Concurrency Matrix Product','unit','active');
insert into public.inventory_balances(organization_id,warehouse_id,product_id,quantity) values ('$ORG_A','$WAREHOUSE','$PRODUCT',30);
insert into public.price_lists(organization_id,tier,name,currency) values ('$ORG_A','retail','Concurrency Matrix Retail','YER');
insert into public.product_prices(organization_id,price_list_id,product_id,amount,valid_from)
select '$ORG_A',id,'$PRODUCT',100,now() from public.price_lists where organization_id='$ORG_A';
insert into public.customer_invitations(id,organization_id,customer_id,recipient_email,token_hash,expires_at,created_by)
values ('$INVITATION','$ORG_A','$CUSTOMER','conc-invite@test.local',encode(digest('$TOKEN','sha256'),'hex'),now()+interval '1 hour','$ADMIN');
insert into public.outbox_events(id,organization_id,aggregate_type,aggregate_id,event_type,payload)
values ('$OUTBOX_EVENT','$ORG_A','test','$PRODUCT','test.concurrent','{}'::jsonb);
commit;
SQL

run_session() {
  local outfile="$1"; shift
  set +e
  ("${PSQL[@]}" >"$outfile" 2>&1 <<SQL
begin;
set local role authenticated;
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub','$ADMIN',true);
$*;
commit;
SQL
  ) & echo $!
}

tmpdir=$(mktemp -d)
trap 'rm -rf "$tmpdir"' EXIT

# 1. cart update x same item
run_session "$tmpdir/cart1" "select public.set_cart_item('$PRODUCT'::uuid,2);" >"$tmpdir/pid1"
run_session "$tmpdir/cart2" "select public.set_cart_item('$PRODUCT'::uuid,5);" >"$tmpdir/pid2"
PID1=$(cat "$tmpdir/pid1"); PID2=$(cat "$tmpdir/pid2"); wait "$PID1"; RC1=$?; wait "$PID2"; RC2=$?; set -e
CART_ROWS=$("${PSQL[@]}" -tAc "select count(*) from public.cart_items ci join public.carts c on c.id=ci.cart_id where c.organization_id='$ORG_A' and ci.product_id='$PRODUCT';")
CART_QTY=$("${PSQL[@]}" -tAc "select coalesce(sum(ci.quantity),0) from public.cart_items ci join public.carts c on c.id=ci.cart_id where c.organization_id='$ORG_A' and ci.product_id='$PRODUCT';")
[ "$RC1" -eq 0 ] && [ "$RC2" -eq 0 ] || { echo "FAIL cart update/update rc=$RC1,$RC2"; cat "$tmpdir/cart1" "$tmpdir/cart2"; exit 1; }
[ "$CART_ROWS" = "1" ] || { echo "FAIL cart duplicate rows: $CART_ROWS"; exit 1; }
[ "$CART_QTY" = "2" ] || [ "$CART_QTY" = "5" ] || { echo "FAIL cart invalid final quantity: $CART_QTY"; exit 1; }

# 2. cart update x remove
set +e
("${PSQL[@]}" >"$tmpdir/cart3" 2>&1 <<SQL
begin; set local role authenticated; select set_config('request.jwt.claim.role','authenticated',true); select set_config('request.jwt.claim.sub','$ADMIN',true); select public.set_cart_item('$PRODUCT'::uuid,9); commit;
SQL
) & P3=$!
("${PSQL[@]}" >"$tmpdir/cart4" 2>&1 <<SQL
begin; set local role authenticated; select set_config('request.jwt.claim.role','authenticated',true); select set_config('request.jwt.claim.sub','$ADMIN',true); select public.remove_cart_item('$PRODUCT'::uuid); commit;
SQL
) & P4=$!
wait "$P3"; RC3=$?; wait "$P4"; RC4=$?; set -e
[ "$RC3" -eq 0 ] && [ "$RC4" -eq 0 ] || { echo "FAIL cart update/remove rc=$RC3,$RC4"; cat "$tmpdir/cart3" "$tmpdir/cart4"; exit 1; }
CART_ROWS2=$("${PSQL[@]}" -tAc "select count(*) from public.cart_items ci join public.carts c on c.id=ci.cart_id where c.organization_id='$ORG_A' and ci.product_id='$PRODUCT';")
[ "$CART_ROWS2" = "0" ] || [ "$CART_ROWS2" = "1" ] || { echo "FAIL cart update/remove invalid row count: $CART_ROWS2"; exit 1; }

# 3. checkout x checkout: one quantity-6 reservation can succeed against stock 10; no oversell
"${PSQL[@]}" -c "update public.inventory_balances set quantity=10 where organization_id='$ORG_A' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT'; delete from public.orders where idempotency_key in ('cm-checkout-a-000001','cm-checkout-b-000001');" >/dev/null
set +e
("${PSQL[@]}" >"$tmpdir/co1" 2>&1 <<SQL
begin; set local role authenticated; select set_config('request.jwt.claim.role','authenticated',true); select set_config('request.jwt.claim.sub','$ADMIN',true); select public.create_order('cm-checkout-a-000001','$WAREHOUSE'::uuid,jsonb_build_array(jsonb_build_object('product_id','$PRODUCT'::uuid,'quantity',6))); commit;
SQL
) & P5=$!
("${PSQL[@]}" >"$tmpdir/co2" 2>&1 <<SQL
begin; set local role authenticated; select set_config('request.jwt.claim.role','authenticated',true); select set_config('request.jwt.claim.sub','$ADMIN',true); select public.create_order('cm-checkout-b-000001','$WAREHOUSE'::uuid,jsonb_build_array(jsonb_build_object('product_id','$PRODUCT'::uuid,'quantity',6))); commit;
SQL
) & P6=$!
wait "$P5"; RC5=$?; wait "$P6"; RC6=$?; set -e
ORDERS_CO=$("${PSQL[@]}" -tAc "select count(*) from public.orders where organization_id='$ORG_A' and idempotency_key in ('cm-checkout-a-000001','cm-checkout-b-000001');")
STOCK_CO=$("${PSQL[@]}" -tAc "select quantity from public.inventory_balances where organization_id='$ORG_A' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")
[ "$ORDERS_CO" = "1" ] || { echo "FAIL checkout oversell/orders=$ORDERS_CO rc=$RC5,$RC6"; cat "$tmpdir/co1" "$tmpdir/co2"; exit 1; }
[ "$STOCK_CO" = "4" ] || { echo "FAIL checkout stock=$STOCK_CO"; exit 1; }

# 4. same idempotency key x concurrent requests
"${PSQL[@]}" -c "delete from public.orders where idempotency_key='cm-same-key-000001'; update public.inventory_balances set quantity=10 where organization_id='$ORG_A' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';" >/dev/null
set +e
("${PSQL[@]}" >"$tmpdir/id1" 2>&1 <<SQL
begin; set local role authenticated; select set_config('request.jwt.claim.role','authenticated',true); select set_config('request.jwt.claim.sub','$ADMIN',true); select public.create_order('cm-same-key-000001','$WAREHOUSE'::uuid,jsonb_build_array(jsonb_build_object('product_id','$PRODUCT'::uuid,'quantity',6))); commit;
SQL
) & P7=$!
("${PSQL[@]}" >"$tmpdir/id2" 2>&1 <<SQL
begin; set local role authenticated; select set_config('request.jwt.claim.role','authenticated',true); select set_config('request.jwt.claim.sub','$ADMIN',true); select public.create_order('cm-same-key-000001','$WAREHOUSE'::uuid,jsonb_build_array(jsonb_build_object('product_id','$PRODUCT'::uuid,'quantity',6))); commit;
SQL
) & P8=$!
wait "$P7"; RC7=$?; wait "$P8"; RC8=$?; set -e
ORDERS_ID=$("${PSQL[@]}" -tAc "select count(*) from public.orders where organization_id='$ORG_A' and idempotency_key='cm-same-key-000001';")
[ "$ORDERS_ID" = "1" ] || { echo "FAIL same-key orders=$ORDERS_ID rc=$RC7,$RC8"; cat "$tmpdir/id1" "$tmpdir/id2"; exit 1; }

# 5. inventory mutation x concurrent requests
"${PSQL[@]}" -c "update public.inventory_balances set quantity=10 where organization_id='$ORG_A' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';" >/dev/null
set +e
("${PSQL[@]}" >"$tmpdir/inv1" 2>&1 <<SQL
begin; set local role authenticated; select set_config('request.jwt.claim.role','authenticated',true); select set_config('request.jwt.claim.sub','$ADMIN',true); select public.adjust_inventory('$WAREHOUSE'::uuid,'$PRODUCT'::uuid,1,'concurrent-matrix-a'); commit;
SQL
) & P9=$!
("${PSQL[@]}" >"$tmpdir/inv2" 2>&1 <<SQL
begin; set local role authenticated; select set_config('request.jwt.claim.role','authenticated',true); select set_config('request.jwt.claim.sub','$ADMIN',true); select public.adjust_inventory('$WAREHOUSE'::uuid,'$PRODUCT'::uuid,1,'concurrent-matrix-b'); commit;
SQL
) & P10=$!
wait "$P9"; RC9=$?; wait "$P10"; RC10=$?; set -e
STOCK_INV=$("${PSQL[@]}" -tAc "select quantity from public.inventory_balances where organization_id='$ORG_A' and warehouse_id='$WAREHOUSE' and product_id='$PRODUCT';")
[ "$RC9" -eq 0 ] && [ "$RC10" -eq 0 ] && [ "$STOCK_INV" = "12" ] || { echo "FAIL inventory concurrency rc=$RC9,$RC10 stock=$STOCK_INV"; cat "$tmpdir/inv1" "$tmpdir/inv2"; exit 1; }

# 6. import x import with same fingerprint
set +e
("${PSQL[@]}" >"$tmpdir/imp1" 2>&1 <<SQL
begin; set local role authenticated; select set_config('request.jwt.claim.role','authenticated',true); select set_config('request.jwt.claim.sub','$IMPORT_JOB_USER',true); select public.stage_product_import('concurrent.xlsx',repeat('e',64),jsonb_build_array(jsonb_build_object('sku','CONC-IMP','name','Concurrent Import','unit','unit','category','Concurrent','quantity',1,'prices',jsonb_build_object('retail',20,'wholesale',18,'distributor',16)))); commit;
SQL
) & P11=$!
("${PSQL[@]}" >"$tmpdir/imp2" 2>&1 <<SQL
begin; set local role authenticated; select set_config('request.jwt.claim.role','authenticated',true); select set_config('request.jwt.claim.sub','$IMPORT_JOB_USER',true); select public.stage_product_import('concurrent.xlsx',repeat('e',64),jsonb_build_array(jsonb_build_object('sku','CONC-IMP','name','Concurrent Import','unit','unit','category','Concurrent','quantity',1,'prices',jsonb_build_object('retail',20,'wholesale',18,'distributor',16)))); commit;
SQL
) & P12=$!
wait "$P11"; RC11=$?; wait "$P12"; RC12=$?; set -e
IMPORTS=$("${PSQL[@]}" -tAc "select count(*) from public.import_jobs where organization_id='$ORG_A' and source_fingerprint=repeat('e',64);")
[ "$IMPORTS" = "1" ] && { [ "$RC11" -eq 0 ] || [ "$RC12" -eq 0 ]; } || { echo "FAIL import concurrency rc=$RC11,$RC12 jobs=$IMPORTS"; cat "$tmpdir/imp1" "$tmpdir/imp2"; exit 1; }

# 7. invitation x invitation
set +e
("${PSQL[@]}" >"$tmpdir/invitation1" 2>&1 <<SQL
begin; set local role service_role; select * from public.consume_customer_invitation('$TOKEN','$INVITE_USER_A'::uuid); commit;
SQL
) & P13=$!
("${PSQL[@]}" >"$tmpdir/invitation2" 2>&1 <<SQL
begin; set local role service_role; select * from public.consume_customer_invitation('$TOKEN','$INVITE_USER_B'::uuid); commit;
SQL
) & P14=$!
wait "$P13"; RC13=$?; wait "$P14"; RC14=$?; set -e
ACCEPTED=$("${PSQL[@]}" -tAc "select count(*) from public.customer_invitations where id='$INVITATION' and accepted_at is not null;")
INV_PROFILES=$("${PSQL[@]}" -tAc "select count(*) from public.profiles where id in ('$INVITE_USER_A','$INVITE_USER_B');")
[ "$ACCEPTED" = "1" ] && [ "$INV_PROFILES" = "1" ] || { echo "FAIL invitation race rc=$RC13,$RC14 accepted=$ACCEPTED profiles=$INV_PROFILES"; cat "$tmpdir/invitation1" "$tmpdir/invitation2"; exit 1; }

# 8. reporting x reporting using the same idempotency key
set +e
("${PSQL[@]}" >"$tmpdir/report1" 2>&1 <<SQL
begin; set local role authenticated; select set_config('request.jwt.claim.role','authenticated',true); select set_config('request.jwt.claim.sub','$ADMIN',true); select public.request_reporting_export('orders','cm-report','1.0','cm-report-race-key'); commit;
SQL
) & P15=$!
("${PSQL[@]}" >"$tmpdir/report2" 2>&1 <<SQL
begin; set local role authenticated; select set_config('request.jwt.claim.role','authenticated',true); select set_config('request.jwt.claim.sub','$ADMIN',true); select public.request_reporting_export('orders','cm-report','1.0','cm-report-race-key'); commit;
SQL
) & P16=$!
wait "$P15"; RC15=$?; wait "$P16"; RC16=$?; set -e
REPORTS=$("${PSQL[@]}" -tAc "select count(*) from public.reporting_exports where organization_id='$ORG_A' and idempotency_key='cm-report-race-key';")
[ "$RC15" -eq 0 ] && [ "$RC16" -eq 0 ] && [ "$REPORTS" = "1" ] || { echo "FAIL reporting race rc=$RC15,$RC16 rows=$REPORTS"; cat "$tmpdir/report1" "$tmpdir/report2"; exit 1; }

# 9. outbox duplicate delivery: one claim wins, duplicate ack is false
set +e
("${PSQL[@]}" >"$tmpdir/ob1" 2>&1 <<SQL
begin; set local role authenticated; select set_config('request.jwt.claim.role','authenticated',true); select set_config('request.jwt.claim.sub','$ADMIN',true); select id from public.claim_outbox_events(1); commit;
SQL
) & P17=$!
("${PSQL[@]}" >"$tmpdir/ob2" 2>&1 <<SQL
begin; set local role authenticated; select set_config('request.jwt.claim.role','authenticated',true); select set_config('request.jwt.claim.sub','$ADMIN',true); select id from public.claim_outbox_events(1); commit;
SQL
) & P18=$!
wait "$P17"; RC17=$?; wait "$P18"; RC18=$?; set -e
CLAIMED=$("${PSQL[@]}" -tAc "select count(*) from public.outbox_events where id='$OUTBOX_EVENT' and status='processing' and attempts=1;")
[ "$RC17" -eq 0 ] && [ "$RC18" -eq 0 ] && [ "$CLAIMED" = "1" ] || { echo "FAIL outbox claim race rc=$RC17,$RC18 claimed=$CLAIMED"; cat "$tmpdir/ob1" "$tmpdir/ob2"; exit 1; }
ACK_RAW=$("${PSQL[@]}" -tAc "set role authenticated; select set_config('request.jwt.claim.role','authenticated',true); select set_config('request.jwt.claim.sub','$ADMIN',true); select public.ack_outbox_event('$OUTBOX_EVENT'::uuid);")
ACK=$(printf '%s\n' "$ACK_RAW" | awk 'NF { v=$0 } END { gsub(/[[:space:]]/,"",v); print v }')
ACK2_RAW=$("${PSQL[@]}" -tAc "set role authenticated; select set_config('request.jwt.claim.role','authenticated',true); select set_config('request.jwt.claim.sub','$ADMIN',true); select public.ack_outbox_event('$OUTBOX_EVENT'::uuid);")
ACK2=$(printf '%s\n' "$ACK2_RAW" | awk 'NF { v=$0 } END { gsub(/[[:space:]]/,"",v); print v }')
[ "$ACK" = "t" ] && [ "$ACK2" = "f" ] || { echo "FAIL outbox duplicate delivery ack=$ACK,$ACK2 raw1=$ACK_RAW raw2=$ACK2_RAW"; exit 1; }

printf '%s\n' \
  'PASS: concurrency matrix' \
  'CASES: 9' \
  'cart update x same item = PASS' \
  'cart update x remove = PASS' \
  'checkout x checkout = PASS' \
  'same idempotency key x concurrent = PASS' \
  'inventory mutation x concurrent = PASS' \
  'import x import = PASS' \
  'invitation x invitation = PASS' \
  'reporting x reporting = PASS' \
  'outbox x duplicate delivery = PASS'

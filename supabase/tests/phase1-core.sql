begin;

-- Test fixture is created by the privileged CI database owner; production fixtures are never inferred from this data.
insert into organizations(id, name) values ('00000000-0000-0000-0000-000000000001', 'Aghbari Test Org');
insert into branches(id, organization_id, name, code) values ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Main Branch', 'MAIN');
insert into warehouses(id, organization_id, branch_id, name, code) values ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'Main Warehouse', 'WH-MAIN');
insert into users(id, organization_id, branch_id, display_name, status) values
  ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'Customer One', 'active'),
  ('00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'Customer Two', 'active');
insert into customer_tiers(id, organization_id, name, rank) values ('00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000001', 'Wholesale', 1);
insert into customers(id, organization_id, account_user_id, tier_id, branch_id, name, status) values
  ('00000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000011', 'Customer One', 'active'),
  ('00000000-0000-0000-0000-000000000052', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000011', 'Customer Two', 'active');
insert into units(id, organization_id, name, code) values ('00000000-0000-0000-0000-000000000061', '00000000-0000-0000-0000-000000000001', 'Piece', 'PCS');
insert into products(id, organization_id, unit_id, sku, name) values ('00000000-0000-0000-0000-000000000071', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000061', 'TEST-001', 'Test Product');
insert into price_lists(id, organization_id, customer_tier_id, name, currency) values ('00000000-0000-0000-0000-000000000081', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000041', 'Wholesale Prices', 'YER');
insert into product_prices(organization_id, price_list_id, product_id, unit_price, effective_from) values ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000081', '00000000-0000-0000-0000-000000000071', 12.50, now() - interval '1 minute');
insert into inventory_balances(warehouse_id, product_id, available, reserved) values ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000071', 5, 0);

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000031', false);

-- Price is resolved server-side and inventory is reserved atomically.
select * from public.create_order(
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000021',
  '[{"product_id":"00000000-0000-0000-0000-000000000071","quantity":2}]'::jsonb,
  'phase1-order-1',
  'phase1-correlation-1'
) \gset order_

select order_id, order_number, total from public.create_order(
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000021',
  '[{"product_id":"00000000-0000-0000-0000-000000000071","quantity":2}]'::jsonb,
  'phase1-order-1',
  'phase1-correlation-replay'
) \gset replay_

select case when :'order_order_id' = :'replay_order_id' and :'order_order_number' = :'replay_order_number' and :'order_total' = :'replay_total' then 'PASS: idempotent replay' else 'FAIL: idempotent replay' end;
select case when available = 3 and reserved = 2 and version = 2 then 'PASS: atomic inventory reservation' else 'FAIL: atomic inventory reservation' end
from inventory_balances where warehouse_id = '00000000-0000-0000-0000-000000000021' and product_id = '00000000-0000-0000-0000-000000000071';
select case when count(*) = 1 then 'PASS: customer sees own order' else 'FAIL: customer sees own order' end from orders where customer_id = '00000000-0000-0000-0000-000000000051';
select case when count(*) = 0 then 'PASS: cross-customer order blocked' else 'FAIL: cross-customer order blocked' end from orders where customer_id = '00000000-0000-0000-0000-000000000052';

-- Reusing the same key with a different payload must fail rather than create a second business mutation.
do $$
begin
  perform public.create_order(
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000021',
    '[{"product_id":"00000000-0000-0000-0000-000000000071","quantity":1}]'::jsonb,
    'phase1-order-1',
    'phase1-correlation-conflict'
  );
  raise exception 'FAIL: idempotency payload conflict was accepted';
exception when unique_violation then
  raise notice 'PASS: idempotency payload conflict blocked';
end $$;

-- Oversell attempt must fail and the failed transaction must not consume stock.
do $$
begin
  perform public.create_order(
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000021',
    '[{"product_id":"00000000-0000-0000-0000-000000000071","quantity":99}]'::jsonb,
    'phase1-order-oversell',
    'phase1-correlation-oversell'
  );
  raise exception 'FAIL: oversell was accepted';
exception when check_violation then
  raise notice 'PASS: oversell blocked';
end $$;

select case when available = 3 and reserved = 2 then 'PASS: oversell rollback preserved stock' else 'FAIL: oversell rollback changed stock' end
from inventory_balances where warehouse_id = '00000000-0000-0000-0000-000000000021' and product_id = '00000000-0000-0000-0000-000000000071';

rollback;

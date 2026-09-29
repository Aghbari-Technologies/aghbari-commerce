begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
values
  ('d3900000-0000-4000-8000-000000000001','d3900000-0000-4000-8000-000000000099','authenticated','authenticated','order-address-a@fixture.invalid','x',now(),now()),
  ('d3900000-0000-4000-8000-000000000002','d3900000-0000-4000-8000-000000000099','authenticated','authenticated','order-address-b@fixture.invalid','x',now(),now());

insert into public.organizations(id,name,is_active)
values ('d3900000-0000-4000-8000-000000000010','Order Address Tenant',true);
insert into public.customers(id,organization_id,name,tier,is_active)
values
  ('d3900000-0000-4000-8000-000000000011','d3900000-0000-4000-8000-000000000010','Address Customer A','retail',true),
  ('d3900000-0000-4000-8000-000000000012','d3900000-0000-4000-8000-000000000010','Address Customer B','retail',true);
insert into public.profiles(id,organization_id,customer_id,role)
values
  ('d3900000-0000-4000-8000-000000000001','d3900000-0000-4000-8000-000000000010','d3900000-0000-4000-8000-000000000011','viewer'),
  ('d3900000-0000-4000-8000-000000000002','d3900000-0000-4000-8000-000000000010','d3900000-0000-4000-8000-000000000012','viewer');
insert into public.branches(id,organization_id,name,is_active)
values ('d3900000-0000-4000-8000-000000000013','d3900000-0000-4000-8000-000000000010','Order Address Branch',true);
insert into public.warehouses(id,organization_id,branch_id,name,is_active)
values ('d3900000-0000-4000-8000-000000000014','d3900000-0000-4000-8000-000000000013','d3900000-0000-4000-8000-000000000013','Order Address Warehouse',true);
insert into public.products(id,organization_id,sku,name,unit,status)
values ('d3900000-0000-4000-8000-000000000015','d3900000-0000-4000-8000-000000000010','ORD-ADDR-001','Order Address Product','unit','active');
insert into public.price_lists(id,organization_id,tier,name,currency,is_active)
values ('d3900000-0000-4000-8000-000000000016','d3900000-0000-4000-8000-000000000010','retail','Retail Address Price','YER',true);
insert into public.product_prices(organization_id,price_list_id,product_id,amount)
values ('d3900000-0000-4000-8000-000000000010','d3900000-0000-4000-8000-000000000016','d3900000-0000-4000-8000-000000000015',100);
insert into public.inventory_balances(organization_id,warehouse_id,product_id,quantity)
values ('d3900000-0000-4000-8000-000000000010','d3900000-0000-4000-8000-000000000014','d3900000-0000-4000-8000-000000000015',20);
insert into public.customer_addresses(
  id,organization_id,customer_id,label,recipient_name,phone,address_line1,address_line2,city,district,notes,is_default
)
values
  ('d3900000-0000-4000-8000-000000000017','d3900000-0000-4000-8000-000000000010','d3900000-0000-4000-8000-000000000011','المكتب','المستلم أ','777000001','شارع الزبيري','مبنى 5','صنعاء','التحرير','استلام صباحي',true),
  ('d3900000-0000-4000-8000-000000000018','d3900000-0000-4000-8000-000000000010','d3900000-0000-4000-8000-000000000012','فرع ب','المستلم ب','777000002','شارع حدة',null,'صنعاء','حدة',null,true);

set local role authenticated;
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub','d3900000-0000-4000-8000-000000000001',true);

select ok(
  (select count(*) = 1 from public.create_order(
    repeat('a',16),
    'd3900000-0000-4000-8000-000000000014'::uuid,
    jsonb_build_array(jsonb_build_object('product_id','d3900000-0000-4000-8000-000000000015'::uuid,'quantity',1)),
    'credit',
    'd3900000-0000-4000-8000-000000000017'::uuid
  )),
  'order with customer-owned delivery address is created'
);

select is(
  (select shipping_address->>'label' from public.orders where idempotency_key=repeat('a',16)),
  'المكتب',
  'order stores the exact delivery snapshot'
);

select is(
  (select shipping_address->>'address_line1' from public.orders where idempotency_key=repeat('a',16)),
  'شارع الزبيري',
  'order snapshot keeps delivery address details'
);

select ok(
  (select count(*) = 1 from public.create_order(
    repeat('a',16),
    'd3900000-0000-4000-8000-000000000014'::uuid,
    jsonb_build_array(jsonb_build_object('product_id','d3900000-0000-4000-8000-000000000015'::uuid,'quantity',1)),
    'credit',
    'd3900000-0000-4000-8000-000000000017'::uuid
  )),
  'same key and same address replays idempotently'
);

do $$
begin
  begin
    perform * from public.create_order(
      repeat('a',16),
      'd3900000-0000-4000-8000-000000000014'::uuid,
      jsonb_build_array(jsonb_build_object('product_id','d3900000-0000-4000-8000-000000000015'::uuid,'quantity',1)),
      'credit',
      'd3900000-0000-4000-8000-000000000018'::uuid
    );
    raise exception 'same-key address payload conflict was accepted';
  exception when sqlstate '40001' then null;
  end;
end $$;
select ok(true,'same key plus different address is rejected as payload conflict');

do $$
begin
  set local role authenticated;
  perform * from public.create_order(
    repeat('b',16),
    'd3900000-0000-4000-8000-000000000014'::uuid,
    jsonb_build_array(jsonb_build_object('product_id','d3900000-0000-4000-8000-000000000015'::uuid,'quantity',1)),
    'credit',
    'd3900000-0000-4000-8000-000000000018'::uuid
  );
  raise exception 'cross-customer delivery address was accepted';
exception when sqlstate '22023' then null;
end $$;
select ok(true,'cross-customer delivery address is rejected');

select * from finish();
rollback;
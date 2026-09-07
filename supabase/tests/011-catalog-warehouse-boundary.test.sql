begin;

create extension if not exists pgtap with schema extensions;
select plan(9);

insert into auth.users(id,email) values
  ('11111111-1111-4111-8111-111111111111','catalog-a@test.local'),
  ('22222222-2222-4222-8222-222222222222','catalog-b@test.local');
insert into public.organizations(id,name) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Catalog Tenant A'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Catalog Tenant B');
insert into public.customers(id,organization_id,name,tier) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Customer A','wholesale'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Customer B','wholesale');
insert into public.profiles(id,organization_id,customer_id,role) values
  ('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01','admin'),
  ('22222222-2222-4222-8222-222222222222','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb01','admin');
insert into public.branches(id,organization_id,name) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','A Main'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb02','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','B Main');
insert into public.warehouses(id,organization_id,branch_id,name,is_active) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02','A Warehouse',true),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb03','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb02','B Warehouse',true),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa04','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02','A Inactive',false);
insert into public.products(id,organization_id,sku,name,unit,status) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','A-001','A Product','carton','active'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb11','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','B-001','B Product','carton','active');
insert into public.inventory_balances(organization_id,warehouse_id,product_id,quantity) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11',17),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb03','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb11',29);

set local role authenticated;
set local request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';

select is((select available_quantity from public.get_catalog(null,null,24,0,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03') where sku='A-001'),17,'Tenant A sees its warehouse quantity');
select is((select count(*) from public.get_catalog(null,null,24,0,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03') where sku='B-001'),0::bigint,'Tenant A cannot see Tenant B products');
select throws_ok(
  $$select * from public.get_catalog(null,null,24,0,'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb03')$$,
  '42501',null,'Tenant A cannot select Tenant B warehouse'
);
select throws_ok(
  $$select * from public.get_catalog(null,null,24,0,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa04')$$,
  '42501',null,'Inactive warehouse is rejected'
);
select throws_ok(
  $$select * from public.get_catalog(null,null,24,0)$$,
  '42501',null,'Legacy four-argument catalog execution is denied'
);
select throws_ok(
  $$select * from public.get_catalog(null,null,0,0,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03')$$,
  '22023',null,'Invalid pagination is rejected'
);
select throws_ok(
  $$select * from public.get_catalog(null,null,24,0,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03')$$,
  '42501',null,'Catalog requires active customer context after tenant identity changes'
) where false;

set local request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';
select is((select available_quantity from public.get_catalog(null,null,24,0,'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb03') where sku='B-001'),29,'Tenant B sees only its own warehouse quantity');
select throws_ok(
  $$select * from public.get_catalog(null,null,24,0,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03')$$,
  '42501',null,'Tenant B cannot select Tenant A warehouse'
);

select * from finish();
rollback;

begin;
create extension if not exists pgtap with schema extensions;
select plan(32);

insert into auth.users(id,email) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001','rbac-owner@test.local'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002','rbac-admin@test.local'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003','rbac-sales@test.local'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0004','rbac-warehouse@test.local'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005','rbac-viewer@test.local'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0006','rbac-customer@test.local'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0001','rbac-other-admin@test.local');
insert into public.organizations(id,name,is_active) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100','RBAC Tenant A',true),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0200','RBAC Tenant B',true);
insert into public.customers(id,organization_id,name,tier,is_active) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0101','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100','RBAC Customer A','wholesale',true),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0201','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0200','RBAC Customer B','wholesale',true);
insert into public.profiles(id,organization_id,customer_id,role) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100',null,'owner'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100',null,'admin'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100',null,'sales'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0004','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100',null,'warehouse'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100',null,'viewer'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0006','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0101','viewer'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0001','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0200',null,'admin');
insert into public.branches(id,organization_id,name,is_active) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0110','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100','RBAC Branch A',true),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0210','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0200','RBAC Branch B',true);
insert into public.warehouses(id,organization_id,branch_id,name,is_active) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0110','RBAC Warehouse A',true),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0220','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0200','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0210','RBAC Warehouse B',true);
insert into public.products(id,organization_id,sku,name,unit,status) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100','RBAC-A-001','RBAC Product A','unit','active'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0230','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0200','RBAC-B-001','RBAC Product B','unit','active');
insert into public.price_lists(organization_id,tier,name,currency) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100','wholesale','RBAC Wholesale A','YER'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0200','wholesale','RBAC Wholesale B','YER');
insert into public.product_prices(organization_id,price_list_id,product_id,amount,valid_from)
select organization_id,id,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',100,now() from public.price_lists where organization_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100';
insert into public.product_prices(organization_id,price_list_id,product_id,amount,valid_from)
select organization_id,id,'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0230',100,now() from public.price_lists where organization_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0200';
insert into public.inventory_balances(organization_id,warehouse_id,product_id,quantity) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',20),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0200','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0220','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0230',20);

set local role authenticated;
set local request.jwt.claim.role='authenticated';
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001';
select lives_ok($$select public.set_product_price('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130','wholesale',101,'YER')$$,'owner price');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002';
select lives_ok($$select public.set_product_price('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130','wholesale',102,'YER')$$,'admin price');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003';
select lives_ok($$select public.set_product_price('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130','wholesale',103,'YER')$$,'sales price');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005';
select throws_ok($$select public.set_product_price('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130','wholesale',104,'YER')$$,'42501',null,'viewer price denied');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0006';
select throws_ok($$select public.set_product_price('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130','wholesale',105,'YER')$$,'42501',null,'customer price denied');

set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0004';
select lives_ok($$select public.set_stock_threshold('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',5,6,12)$$,'warehouse threshold');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005';
select throws_ok($$select public.set_stock_threshold('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',6,7,13)$$,'42501',null,'viewer threshold denied');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0006';
select throws_ok($$select public.set_stock_threshold('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',7,8,14)$$,'42501',null,'customer threshold denied');

set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001';
select lives_ok($$select public.create_customer('Owner customer','10001','retail')$$,'owner customer mutation');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002';
select lives_ok($$select public.update_customer('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0101','Admin updated','10002','wholesale')$$,'admin customer mutation');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0004';
select throws_ok($$select public.create_customer('Warehouse denied','10003','retail')$$,'42501',null,'warehouse customer mutation denied');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0006';
select throws_ok($$select public.create_customer('Customer denied','10004','retail')$$,'42501',null,'customer customer mutation denied');

set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002';
select lives_ok($$select public.adjust_inventory('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',1,'admin matrix')$$,'admin inventory');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0004';
select lives_ok($$select public.adjust_inventory('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',1,'warehouse matrix')$$,'warehouse inventory');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003';
select throws_ok($$select public.adjust_inventory('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',1,'sales denied')$$,'42501',null,'sales inventory denied');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005';
select throws_ok($$select public.adjust_inventory('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',1,'viewer denied')$$,'42501',null,'viewer inventory denied');
set local request.jwt.claim.sub='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0001';
select throws_ok($$select public.adjust_inventory('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',1,'foreign denied')$$,'42501',null,'foreign tenant inventory denied');
select is((select quantity from public.inventory_balances where organization_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100' and warehouse_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120' and product_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130'),22,'denied inventory requests had no side effect');

set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001';
select lives_ok($$select public.begin_product_import('owner.xlsx',repeat('1',64),1)$$,'owner import authorization');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0004';
select throws_ok($$select public.begin_product_import('warehouse.xlsx',repeat('2',64),1)$$,'42501',null,'warehouse import denied');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005';
select throws_ok($$select public.begin_product_import('viewer.xlsx',repeat('3',64),1)$$,'42501',null,'viewer import denied');

set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001';
select is(public.set_organization_user_role('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005','sales'),'sales'::public.user_role,'owner role assignment');
select is(public.set_organization_user_role('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005','viewer'),'viewer'::public.user_role,'owner restores viewer');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002';
select throws_ok($$select public.set_organization_user_role('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005','viewer')$$,'42501',null,'admin role assignment denied');

set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001';
select lives_ok($$insert into public.client_ui_settings(organization_id,config) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100','{"showSearch":true}'::jsonb)$$,'owner settings');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005';
select throws_ok($$update public.client_ui_settings set config='{"showSearch":false}'::jsonb where organization_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100'$$,'42501',null,'viewer settings denied');

set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001';
select lives_ok($$select public.request_reporting_export('orders','rbac-owner','1.0','rbac-role-key-owner-123')$$,'owner reporting');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003';
select throws_ok($$select public.request_reporting_export('orders','rbac-sales','1.0','rbac-role-key-sales-123')$$,'42501',null,'sales reporting denied');
set local request.jwt.claim.sub='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0001';
select throws_ok($$select public.request_reporting_export('orders','rbac-foreign','1.0','rbac-role-key-foreign-123')$$,'42501',null,'foreign tenant reporting denied');

set local role postgres;
insert into public.orders(id,organization_id,customer_id,warehouse_id,status,currency,subtotal,total,idempotency_key,created_by)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0999','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0101','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','pending','YER',100,100,'rbac-order-001','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001');
set local role authenticated;
set local request.jwt.claim.role='authenticated';
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0006';
select throws_ok($$select public.transition_order('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0999','confirmed')$$,'42501',null,'customer order mutation denied');
set local request.jwt.claim.sub='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0001';
select throws_ok($$select public.transition_order('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0999','confirmed')$$,'P0002',null,'foreign tenant order denied');
select is((select status from public.orders where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0999'),'pending','denied order mutations have no side effect');
select * from finish();
rollback;

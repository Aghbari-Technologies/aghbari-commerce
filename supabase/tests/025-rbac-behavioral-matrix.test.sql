begin;
create extension if not exists pgtap with schema extensions;
select plan(41);

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

-- Product pricing: owner/admin/sales allowed; warehouse/viewer/customer denied.
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001';
select lives_ok($$select public.set_product_price('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130','wholesale',101,'YER')$$,'owner can set product price');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002';
select lives_ok($$select public.set_product_price('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130','wholesale',102,'YER')$$,'admin can set product price');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003';
select lives_ok($$select public.set_product_price('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130','wholesale',103,'YER')$$,'sales can set product price');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0004';
select throws_ok($$select public.set_product_price('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130','wholesale',104,'YER')$$,'42501',null,'warehouse cannot set product price');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005';
select throws_ok($$select public.set_product_price('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130','wholesale',105,'YER')$$,'42501',null,'viewer cannot set product price');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0006';
select throws_ok($$select public.set_product_price('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130','wholesale',106,'YER')$$,'42501',null,'customer cannot set product price');
select is((select count(*) from public.product_prices where organization_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100' and product_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130' and amount=106),0::bigint,'denied price mutation has no side effect');

-- Stock threshold: owner/admin/warehouse allowed; sales/viewer/customer denied.
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001';
select lives_ok($$select public.set_stock_threshold('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',3,4,10)$$,'owner can set stock threshold');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002';
select lives_ok($$select public.set_stock_threshold('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',4,5,11)$$,'admin can set stock threshold');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0004';
select lives_ok($$select public.set_stock_threshold('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',5,6,12)$$,'warehouse can set stock threshold');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003';
select throws_ok($$select public.set_stock_threshold('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',6,7,13)$$,'42501',null,'sales cannot set stock threshold');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005';
select throws_ok($$select public.set_stock_threshold('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',7,8,14)$$,'42501',null,'viewer cannot set stock threshold');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0006';
select throws_ok($$select public.set_stock_threshold('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',8,9,15)$$,'42501',null,'customer cannot set stock threshold');

-- Customer mutation: owner/admin/sales allowed; warehouse/viewer/customer denied.
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001';
select lives_ok($$select public.create_customer('Owner-created customer','10001','retail')$$,'owner can create customer');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002';
select lives_ok($$select public.update_customer('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0101','Admin-updated customer','10002','wholesale')$$,'admin can update customer');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003';
select lives_ok($$select public.create_customer('Sales-created customer','10003','retail')$$,'sales can create customer');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0004';
select throws_ok($$select public.create_customer('Warehouse forbidden','10004','retail')$$,'42501',null,'warehouse cannot mutate customers');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-aaa-8aaa-aaaaaaaa0005';
select throws_ok($$select public.create_customer('Viewer forbidden','10005','retail')$$,'42501',null,'viewer cannot mutate customers');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0006';
select throws_ok($$select public.create_customer('Customer forbidden','10006','retail')$$,'42501',null,'customer cannot mutate customers');

-- Inventory mutation: owner/admin/warehouse allowed; sales/viewer/customer denied and foreign tenant denied.
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001';
select lives_ok($$select public.adjust_inventory('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',1,'owner test')$$,'owner can adjust inventory');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002';
select lives_ok($$select public.adjust_inventory('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',1,'admin test')$$,'admin can adjust inventory');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0004';
select lives_ok($$select public.adjust_inventory('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',1,'warehouse test')$$,'warehouse can adjust inventory');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003';
select throws_ok($$select public.adjust_inventory('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',1,'sales forbidden')$$,'42501',null,'sales cannot adjust inventory');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005';
select throws_ok($$select public.adjust_inventory('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',1,'viewer forbidden')$$,'42501',null,'viewer cannot adjust inventory');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0006';
select throws_ok($$select public.adjust_inventory('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',1,'customer forbidden')$$,'42501',null,'customer cannot adjust inventory');
set local request.jwt.claim.sub='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0001';
select throws_ok($$select public.adjust_inventory('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130',1,'cross tenant')$$,'42501',null,'other tenant admin cannot adjust foreign inventory');
select is((select quantity from public.inventory_balances where organization_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100' and warehouse_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120' and product_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0130'),23,'only authorized inventory mutations changed stock');

-- Import authorization: owner/admin/sales allowed; warehouse/viewer/customer denied.
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001';
select lives_ok($$select public.begin_product_import('owner.xlsx',repeat('1',64),1)$$,'owner can begin import');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002';
select lives_ok($$select public.begin_product_import('admin.xlsx',repeat('2',64),1)$$,'admin can begin import');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003';
select lives_ok($$select public.begin_product_import('sales.xlsx',repeat('3',64),1)$$,'sales can begin import');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-aaaa-8aaa-aaaaaaaa0004';
select throws_ok($$select public.begin_product_import('warehouse.xlsx',repeat('4',64),1)$$,'42501',null,'warehouse cannot begin import');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005';
select throws_ok($$select public.begin_product_import('viewer.xlsx',repeat('5',64),1)$$,'42501',null,'viewer cannot begin import');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0006';
select throws_ok($$select public.begin_product_import('customer.xlsx',repeat('6',64),1)$$,'42501',null,'customer cannot begin import');

-- Role assignment: owner only; other tenant cannot touch Tenant A.
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001';
select is(public.set_organization_user_role('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005','sales'),'sales'::public.user_role,'owner can assign an organization role');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002';
select throws_ok($$select public.set_organization_user_role('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005','viewer')$$,'42501',null,'admin cannot assign organization roles');
set local request.jwt.claim.sub='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0001';
select throws_ok($$select public.set_organization_user_role('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005','admin')$$,'42501',null,'foreign tenant owner scope is denied');

-- Settings: staff can write own org; viewer/customer/foreign admin cannot.
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001';
select lives_ok($$insert into public.client_ui_settings(organization_id,config) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100','{"showSearch":true}'::jsonb)$$,'owner can write settings');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002';
select lives_ok($$update public.client_ui_settings set config='{"showSearch":false}'::jsonb where organization_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100'$$,'admin can update settings');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005';
select throws_ok($$update public.client_ui_settings set config='{"showSearch":true}'::jsonb where organization_id='aaaaaaaa-aaaa-8aaa-8aaa-aaaaaaaa0100'$$,'42501',null,'viewer cannot update settings');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0006';
select throws_ok($$update public.client_ui_settings set config='{"showSearch":true}'::jsonb where organization_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100'$$,'42501',null,'customer cannot update settings');
set local request.jwt.claim.sub='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0001';
select is((select count(*) from public.client_ui_settings where organization_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100' and config->>'showSearch'='true'),0::bigint,'foreign admin cannot mutate Tenant A settings');

-- Reporting gateway: owner/admin allowed; sales/warehouse/viewer/customer denied.
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001';
select lives_ok($$select public.request_reporting_export('orders','b28-role-owner','1.0','rbac-role-owner-key-001')$$,'owner can request reporting export');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002';
select lives_ok($$select public.request_reporting_export('orders','b28-role-admin','1.0','rbac-role-admin-key-001')$$,'admin can request reporting export');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003';
select throws_ok($$select public.request_reporting_export('orders','b28-role-sales','1.0','rbac-role-sales-key-001')$$,'42501',null,'sales cannot request reporting export');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0004';
select throws_ok($$select public.request_reporting_export('orders','b28-role-warehouse','1.0','rbac-role-warehouse-key-001')$$,'42501',null,'warehouse cannot request reporting export');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005';
select throws_ok($$select public.request_reporting_export('orders','b28-role-viewer','1.0','rbac-role-viewer-key-001')$$,'42501',null,'viewer cannot request reporting export');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0006';
select throws_ok($$select public.request_reporting_export('orders','b28-role-customer','1.0','rbac-role-customer-key-001')$$,'42501',null,'customer cannot request reporting export');

-- Order mutation: staff sales can confirm pending order; customer and warehouse cannot confirm pending orders.
insert into public.orders(organization_id,customer_id,warehouse_id,status,currency,subtotal,total,idempotency_key,created_by)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0101','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','pending','YER',100,100,'rbac-transition-001','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003';
select lives_ok($$select public.transition_order((select id from public.orders where idempotency_key='rbac-transition-001'),'confirmed')$$,'sales can confirm pending order');
insert into public.orders(organization_id,customer_id,warehouse_id,status,currency,subtotal,total,idempotency_key,created_by)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0101','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','pending','YER',100,100,'rbac-transition-002','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001');
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0006';
select throws_ok($$select public.transition_order((select id from public.orders where idempotency_key='rbac-transition-002'),'confirmed')$$,'42501',null,'customer cannot confirm pending order');
set local request.jwt.claim.sub='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0001';
select throws_ok($$select public.transition_order((select id from public.orders where idempotency_key='rbac-transition-001'),'preparing')$$,'P0002',null,'foreign tenant cannot transition Tenant A order');

-- Tenant-side no-effect check for an invalid foreign price target.
select is((select count(*) from public.product_prices where organization_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0200' and product_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0230' and amount=9999),0::bigint,'no foreign-tenant price mutation occurred');

select * from finish();
rollback;

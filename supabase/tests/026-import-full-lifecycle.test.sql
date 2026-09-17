begin;
create extension if not exists pgtap with schema extensions;
select plan(30);

insert into auth.users(id,email) values
 ('aaaaaaaa-1111-4111-8111-aaaaaaaa0001','import-owner@test.local'),
 ('aaaaaaaa-1111-4111-8111-aaaaaaaa0002','import-sales@test.local'),
 ('bbbbbbbb-2222-4222-8222-bbbbbbbb0001','import-foreign@test.local');
insert into public.organizations(id,name,is_active) values
 ('aaaaaaaa-1111-4111-8111-aaaaaaaa0100','Import Tenant A',true),
 ('bbbbbbbb-2222-4222-8222-bbbbbbbb0200','Import Tenant B',true);
insert into public.profiles(id,organization_id,customer_id,role) values
 ('aaaaaaaa-1111-4111-8111-aaaaaaaa0001','aaaaaaaa-1111-4111-8111-aaaaaaaa0100',null,'owner'),
 ('aaaaaaaa-1111-4111-8111-aaaaaaaa0002','aaaaaaaa-1111-4111-8111-aaaaaaaa0100',null,'sales'),
 ('bbbbbbbb-2222-4222-8222-bbbbbbbb0001','bbbbbbbb-2222-4222-8222-bbbbbbbb0200',null,'admin');
insert into public.branches(id,organization_id,name,is_active) values
 ('aaaaaaaa-1111-4111-8111-aaaaaaaa0110','aaaaaaaa-1111-4111-8111-aaaaaaaa0100','Import Branch A',true),
 ('bbbbbbbb-2222-4222-8222-bbbbbbbb0210','bbbbbbbb-2222-4222-8222-bbbbbbbb0200','Import Branch B',true);
insert into public.warehouses(id,organization_id,branch_id,name,is_active) values
 ('aaaaaaaa-1111-4111-8111-aaaaaaaa0120','aaaaaaaa-1111-4111-8111-aaaaaaaa0100','aaaaaaaa-1111-4111-8111-aaaaaaaa0110','Import Warehouse A',true),
 ('bbbbbbbb-2222-4222-8222-bbbbbbbb0220','bbbbbbbb-2222-4222-8222-bbbbbbbb0200','bbbbbbbb-2222-4222-8222-bbbbbbbb0210','Import Warehouse B',true);
insert into public.products(id,organization_id,sku,name,unit,status)
values ('aaaaaaaa-1111-4111-8111-aaaaaaaa0130','aaaaaaaa-1111-4111-8111-aaaaaaaa0100','PRE-001','Preexisting Product','unit','active');
insert into public.inventory_balances(organization_id,warehouse_id,product_id,quantity)
values ('aaaaaaaa-1111-4111-8111-aaaaaaaa0100','aaaaaaaa-1111-4111-8111-aaaaaaaa0120','aaaaaaaa-1111-4111-8111-aaaaaaaa0130',7);

set local role authenticated;
set local request.jwt.claim.role='authenticated';
set local request.jwt.claim.sub='aaaaaaaa-1111-4111-8111-aaaaaaaa0001';

select lives_ok($$select public.stage_product_import('valid.xlsx',repeat('a',64),jsonb_build_array(
 jsonb_build_object('sku','IMP-001','name','Imported One','unit','unit','category','Imported','quantity',13,'prices',jsonb_build_object('retail',120,'wholesale',110,'distributor',100)),
 jsonb_build_object('sku','IMP-002','name','Imported Two','unit','unit','category','Imported','quantity',4,'prices',jsonb_build_object('retail',90,'wholesale',80,'distributor',70))))$$,'authorized actor can stage valid import');
select is((select count(*) from public.import_jobs where source_fingerprint=repeat('a',64)),1::bigint,'stage creates one import job');
select is((select status from public.import_jobs where source_fingerprint=repeat('a',64)),'preview','valid stage reaches preview');
select is((select total_rows from public.import_jobs where source_fingerprint=repeat('a',64)),2,'stage records total row count');
select is((select valid_rows from public.import_jobs where source_fingerprint=repeat('a',64)),2,'valid stage records two valid rows');
select is((select invalid_rows from public.import_jobs where source_fingerprint=repeat('a',64)),0,'valid stage records zero invalid rows');
select is((select count(*) from public.import_rows where import_job_id=(select id from public.import_jobs where source_fingerprint=repeat('a',64))),2::bigint,'stage persists exactly two rows');
select is((select normalized_data->>'sku' from public.import_rows where import_job_id=(select id from public.import_jobs where source_fingerprint=repeat('a',64)) and row_number=1),'IMP-001','stage normalizes SKU');
select is((select status from public.import_rows where import_job_id=(select id from public.import_jobs where source_fingerprint=repeat('a',64)) and row_number=1),'valid','first staged row is valid');
select is((select count(*) from public.audit_events where action='import.stage' and target_id=(select id from public.import_jobs where source_fingerprint=repeat('a',64))),1::bigint,'stage writes one audit event');
select throws_ok($$select public.stage_product_import('valid.xlsx',repeat('a',64),jsonb_build_array(jsonb_build_object('sku','IMP-001','name','Changed','unit','unit','category','Imported','quantity',13,'prices',jsonb_build_object('retail',120,'wholesale',110,'distributor',100))))$$,'23505',null,'duplicate fingerprint is rejected');
select is((select count(*) from public.import_jobs where source_fingerprint=repeat('a',64)),1::bigint,'duplicate fingerprint creates no second job');
select throws_ok($$select public.commit_product_import((select id from public.import_jobs where source_fingerprint=repeat('a',64)),'bbbbbbbb-2222-4222-8222-bbbbbbbb0220')$$,'42501',null,'foreign warehouse is rejected before mutation');
select is((select status from public.import_jobs where source_fingerprint=repeat('a',64)),'preview','rejected foreign commit leaves preview state');
select is((select imported_rows from public.commit_product_import((select id from public.import_jobs where source_fingerprint=repeat('a',64)),'aaaaaaaa-1111-4111-8111-aaaaaaaa0120')),2,'authorized commit imports exactly two rows');
select is((select (metadata->>'created')::integer from public.audit_events where action='import.commit' and target_id=(select id from public.import_jobs where source_fingerprint=repeat('a',64))),2,'commit audit records two created products');
select is((select count(*) from public.products where organization_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0100' and sku in ('IMP-001','IMP-002')),2::bigint,'successful import creates two products');
select is((select status from public.import_jobs where source_fingerprint=repeat('a',64)),'completed','successful commit completes job');
select is((select count(*) from public.import_rows where import_job_id=(select id from public.import_jobs where source_fingerprint=repeat('a',64)) and status='committed'),2::bigint,'successful commit marks both rows committed');
select is((select quantity from public.inventory_balances where organization_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0100' and warehouse_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0120' and product_id=(select id from public.products where organization_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0100' and sku='IMP-001')),13,'import sets first inventory quantity');
select is((select quantity from public.inventory_balances where organization_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0100' and warehouse_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0120' and product_id=(select id from public.products where organization_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0100' and sku='IMP-002')),4,'import sets second inventory quantity');
select is((select count(*) from public.inventory_movements where organization_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0100' and source_type='import' and source_id=(select id from public.import_jobs where source_fingerprint=repeat('a',64))),2::bigint,'successful import records two inventory movements');
select is((select quantity from public.inventory_balances where organization_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0100' and warehouse_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0120' and product_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0130'),7,'unrelated preexisting inventory remains unchanged');
select is((select count(*) from public.audit_events where organization_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0100' and target_type='import_job' and target_id=(select id from public.import_jobs where source_fingerprint=repeat('a',64)) and action in ('import.stage','import.commit')),2::bigint,'import stage and commit audits are both present');
select throws_ok($$select public.commit_product_import((select id from public.import_jobs where source_fingerprint=repeat('a',64)),'aaaaaaaa-1111-4111-8111-aaaaaaaa0120')$$,'P0001',null,'completed import cannot be committed again');

select lives_ok($$select public.stage_product_import('invalid.xlsx',repeat('b',64),jsonb_build_array(jsonb_build_object('sku','','name','Bad','unit','unit','category','Invalid','quantity',1,'prices',jsonb_build_object('retail',10,'wholesale',9,'distributor',8))))$$,'invalid-row import can be staged');
select is((select invalid_rows from public.import_jobs where source_fingerprint=repeat('b',64)),1,'invalid row is quarantined');
select is((select valid_rows from public.import_jobs where source_fingerprint=repeat('b',64)),0,'invalid import has zero valid rows');
select is((select status from public.import_rows where import_job_id=(select id from public.import_jobs where source_fingerprint=repeat('b',64)) and row_number=1),'invalid','invalid row is explicitly marked invalid');
select throws_ok($$select public.commit_product_import((select id from public.import_jobs where source_fingerprint=repeat('b',64)),'aaaaaaaa-1111-4111-8111-aaaaaaaa0120')$$,'P0001',null,'invalid import cannot commit');

set local request.jwt.claim.sub='bbbbbbbb-2222-4222-8222-bbbbbbbb0001';
select is(public.stage_product_import('foreign.xlsx',repeat('e',64),jsonb_build_array(jsonb_build_object('sku','FOREIGN-001','name','Foreign Attempt','unit','unit','category','Foreign','quantity',1,'prices',jsonb_build_object('retail',10,'wholesale',9,'distributor',8)))),'bbbbbbbb-2222-4222-8222-bbbbbbbb0200'::uuid,'foreign actor is restricted to its own tenant');
select is((select count(*) from public.import_jobs where organization_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0100' and source_fingerprint=repeat('e',64)),0::bigint,'foreign staging creates no Tenant A job');
set local request.jwt.claim.sub='aaaaaaaa-1111-4111-8111-aaaaaaaa0002';
select lives_ok($$select public.stage_product_import('sales.xlsx',repeat('f',64),jsonb_build_array(jsonb_build_object('sku','SALES-001','name','Sales Import','unit','unit','category','Sales','quantity',2,'prices',jsonb_build_object('retail',20,'wholesale',18,'distributor',16))))$$,'authorized sales actor can stage import');
select is((select imported_rows from public.commit_product_import((select id from public.import_jobs where source_fingerprint=repeat('f',64)),'aaaaaaaa-1111-4111-8111-aaaaaaaa0120')),1,'authorized sales actor can commit import');
select is((select count(*) from public.products where organization_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0100' and sku='SALES-001'),1::bigint,'sales import creates one product');
select is((select status from public.import_jobs where source_fingerprint=repeat('f',64)),'completed','sales import completes');

select * from finish();
rollback;
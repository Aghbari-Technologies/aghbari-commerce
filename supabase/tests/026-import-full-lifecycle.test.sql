begin;
create extension if not exists pgtap with schema extensions;
select plan(36);

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

select lives_ok($$select public.begin_product_import('valid.xlsx',repeat('a',64),2)$$,'authorized actor can begin valid import');
select results_eq($$select count(*) from public.import_jobs where source_fingerprint=repeat('a',64)$$,$$values (1::bigint)$$,'begin creates one import job');
select is(public.begin_product_import('valid.xlsx',repeat('a',64),2),(select id from public.import_jobs where source_fingerprint=repeat('a',64)),'same fingerprint and row count replays the same import job');
select throws_ok($$select public.begin_product_import('valid.xlsx',repeat('a',64),3)$$,'22023',null,'same fingerprint with changed row count is rejected');
select is(public.stage_product_import_chunk((select id from public.import_jobs where source_fingerprint=repeat('a',64)),1,jsonb_build_array(jsonb_build_object('sku','IMP-001','name','Imported One','unit','unit','category','Imported','quantity',13,'prices',jsonb_build_object('retail',120,'wholesale',110,'distributor',100)))),1,'first chunk inserts one row');
select is(public.stage_product_import_chunk((select id from public.import_jobs where source_fingerprint=repeat('a',64)),1,jsonb_build_array(jsonb_build_object('sku','IMP-001','name','Imported One','unit','unit','category','Imported','quantity',13,'prices',jsonb_build_object('retail',120,'wholesale',110,'distributor',100)))),1,'same chunk payload replays without duplicate row');
select throws_ok($$select public.stage_product_import_chunk((select id from public.import_jobs where source_fingerprint=repeat('a',64)),1,jsonb_build_array(jsonb_build_object('sku','IMP-001','name','CHANGED','unit','unit','category','Imported','quantity',13,'prices',jsonb_build_object('retail',120,'wholesale',110,'distributor',100))))$$,'40001',null,'same chunk row with changed payload is rejected');
select is((select count(*) from public.import_rows where import_job_id=(select id from public.import_jobs where source_fingerprint=repeat('a',64))),1::bigint,'chunk replay does not duplicate business rows');
select is(public.stage_product_import_chunk((select id from public.import_jobs where source_fingerprint=repeat('a',64)),2,jsonb_build_array(jsonb_build_object('sku','IMP-002','name','Imported Two','unit','unit','category','Imported','quantity',4,'prices',jsonb_build_object('retail',90,'wholesale',80,'distributor',70)))),1,'second chunk inserts one row');
select lives_ok($$select public.finalize_product_import((select id from public.import_jobs where source_fingerprint=repeat('a',64)))$$,'complete two-row import can finalize before warehouse boundary check');
select throws_ok($$select public.commit_product_import((select id from public.import_jobs where source_fingerprint=repeat('a',64)),'bbbbbbbb-2222-4222-8222-bbbbbbbb0220')$$,'42501',null,'foreign tenant warehouse is rejected before business mutation');
select is((select status from public.import_jobs where source_fingerprint=repeat('a',64)),'preview','failed foreign-target commit does not advance import state');
select is((select count(*) from public.products where organization_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0100' and sku in ('IMP-001','IMP-002')),0::bigint,'failed foreign-target commit creates no products');
select is((select quantity from public.inventory_balances where organization_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0100' and warehouse_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0120' and product_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0130'),7,'failed foreign-target commit leaves inventory unchanged');
select is((select count(*) from public.inventory_movements where organization_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0100' and source_type='import' and source_id=(select id from public.import_jobs where source_fingerprint=repeat('a',64))),0::bigint,'failed foreign-target commit creates no inventory movement');
select is((select imported_rows from public.commit_product_import((select id from public.import_jobs where source_fingerprint=repeat('a',64)),'aaaaaaaa-1111-4111-8111-aaaaaaaa0120')),2,'commit imports exactly two rows');
select is((select status from public.import_jobs where source_fingerprint=repeat('a',64)),'completed','successful commit completes import job');
select throws_ok($$select public.commit_product_import((select id from public.import_jobs where source_fingerprint=repeat('a',64)),'aaaaaaaa-1111-4111-8111-aaaaaaaa0120')$$,'P0001',null,'completed import cannot be committed again');
select is((select count(*) from public.products where organization_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0100' and sku in ('IMP-001','IMP-002')),2::bigint,'successful import creates exactly two products');
select is((select quantity from public.inventory_balances where organization_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0100' and warehouse_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0120' and product_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0130'),7,'preexisting product inventory remains unchanged by unrelated imported SKUs');
select is((select count(*) from public.inventory_movements where organization_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0100' and source_type='import' and source_id=(select id from public.import_jobs where source_fingerprint=repeat('a',64))),2::bigint,'successful import records one movement per changed imported SKU');
select is((select count(*) from public.audit_events where organization_id='aaaaaaaa-1111-4111-8111-aaaaaaaa0100' and target_type='import_job' and target_id=(select id from public.import_jobs where source_fingerprint=repeat('a',64)) and action in ('import.stage','import.finalize','import.commit')),2::bigint,'import lifecycle records stage/final audit evidence');

select throws_ok($$select public.stage_product_import('invalid.xlsx',repeat('b',64),'{}'::jsonb)$$,'22023',null,'non-array import payload is rejected');
select lives_ok($$select public.begin_product_import('invalid-row.xlsx',repeat('c',64),1)$$,'invalid-row import can be started');
select is(public.stage_product_import_chunk((select id from public.import_jobs where source_fingerprint=repeat('c',64)),1,jsonb_build_array(jsonb_build_object('sku','','name','Bad','unit','unit','category','Invalid','quantity',1,'prices',jsonb_build_object('retail',10,'wholesale',9,'distributor',8)))),1,'invalid row is staged for diagnostics');
select lives_ok($$select public.finalize_product_import((select id from public.import_jobs where source_fingerprint=repeat('c',64)))$$,'invalid row import can finalize to preview');
select is((select invalid_rows from public.import_jobs where source_fingerprint=repeat('c',64)),1,'invalid row is explicitly quarantined');
select throws_ok($$select public.commit_product_import((select id from public.import_jobs where source_fingerprint=repeat('c',64)),'aaaaaaaa-1111-4111-8111-aaaaaaaa0120')$$,'P0001',null,'invalid import cannot commit');

select lives_ok($$select public.begin_product_import('partial.xlsx',repeat('d',64),2)$$,'partial recovery import can be started');
select is(public.stage_product_import_chunk((select id from public.import_jobs where source_fingerprint=repeat('d',64)),1,jsonb_build_array(jsonb_build_object('sku','PART-001','name','Partial One','unit','unit','category','Partial','quantity',1,'prices',jsonb_build_object('retail',20,'wholesale',19,'distributor',18)))),1,'partial import receives first chunk');
select throws_ok($$select public.commit_product_import((select id from public.import_jobs where source_fingerprint=repeat('d',64)),'aaaaaaaa-1111-4111-8111-aaaaaaaa0120')$$,'P0001',null,'partial import cannot commit before finalization');
select throws_ok($$select public.finalize_product_import((select id from public.import_jobs where source_fingerprint=repeat('d',64)))$$,'P0001',null,'partial import cannot finalize before all rows arrive');
select is((select id from public.import_jobs where source_fingerprint=repeat('d',64))::text,(select id from public.import_jobs where source_fingerprint=repeat('d',64))::text,'partial import id captured before tenant switch');
set local request.jwt.claim.sub='bbbbbbbb-2222-4222-8222-bbbbbbbb0001';
select throws_ok($$select public.stage_product_import_chunk((select '00000000-0000-4000-8000-000000000000'::uuid),2,jsonb_build_array(jsonb_build_object('sku','PART-002','name','Foreign Attempt','unit','unit','category','Partial','quantity',1,'prices',jsonb_build_object('retail',20,'wholesale',19,'distributor',18))))$$,'P0002',null,'foreign tenant cannot stage rows into Tenant A import');
set local request.jwt.claim.sub='aaaaaaaa-1111-4111-8111-aaaaaaaa0002';
select is(public.stage_product_import_chunk((select id from public.import_jobs where source_fingerprint=repeat('d',64)),2,jsonb_build_array(jsonb_build_object('sku','PART-002','name','Partial Two','unit','unit','category','Partial','quantity',1,'prices',jsonb_build_object('retail',20,'wholesale',19,'distributor',18)))),1,'authorized retry completes the missing chunk');
select lives_ok($$select public.finalize_product_import((select id from public.import_jobs where source_fingerprint=repeat('d',64)))$$,'recovered import finalizes after missing chunk arrives');
select is((select imported_rows from public.commit_product_import((select id from public.import_jobs where source_fingerprint=repeat('d',64)),'aaaaaaaa-1111-4111-8111-aaaaaaaa0120')),2,'recovered import commits exactly two rows');
select is((select count(*) from public.import_rows where import_job_id=(select id from public.import_jobs where source_fingerprint=repeat('d',64))),2::bigint,'partial recovery has exactly two staged rows');

select * from finish();
rollback;

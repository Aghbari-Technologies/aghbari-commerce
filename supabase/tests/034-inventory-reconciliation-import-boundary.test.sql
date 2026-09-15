begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

insert into public.organizations (id,name) values
 ('11111111-1111-4111-8111-111111111112','Tenant A'),
 ('22222222-2222-4222-8222-222222222222','Tenant B');
insert into public.branches (id,organization_id,name) values
 ('11111111-1111-4111-8111-111111111113','11111111-1111-4111-8111-111111111112','A Main'),
 ('22222222-2222-4222-8222-222222222223','22222222-2222-4222-8222-222222222222','B Main');
insert into public.warehouses (id,organization_id,branch_id,name) values
 ('11111111-1111-4111-8111-111111111114','11111111-1111-4111-8111-111111111112','11111111-1111-4111-8111-111111111113','A Warehouse'),
 ('22222222-2222-4222-8222-222222222224','22222222-2222-4222-8222-222222222223','B Warehouse');
insert into public.import_jobs (id,organization_id,source_name,source_fingerprint,status)
values ('11111111-1111-4111-8111-111111111115','11111111-1111-4111-8111-111111111112','tenant-a.csv','tenant-a-fp','completed');

select has_table('public','inventory_reconciliations','inventory reconciliation table exists');
select has_column('public','inventory_reconciliations','dataset_id','reconciliation retains a dataset reference');
select results_eq($$select c.confrelid::regclass::text from pg_constraint c where c.conrelid='public.inventory_reconciliations'::regclass and c.conname='inventory_reconciliations_dataset_id_organization_id_fkey'$$,$$values ('public.import_jobs'::text)$$,'dataset boundary points to the commerce import pipeline');
select lives_ok($$insert into public.inventory_reconciliations(id,organization_id,dataset_id,warehouse_id,source_name,source_fingerprint) values ('11111111-1111-4111-8111-111111111116','11111111-1111-4111-8111-111111111112','11111111-1111-4111-8111-111111111115','11111111-1111-4111-8111-111111111114','tenant-a.csv','tenant-a-fp')$$,'same-tenant reconciliation parent pairing is valid');
select throws_ok($$insert into public.inventory_reconciliations(id,organization_id,dataset_id,warehouse_id,source_name,source_fingerprint) values ('22222222-2222-4222-8222-222222222225','22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111115','22222222-2222-4222-8222-222222222224','cross-tenant.csv','cross-tenant-fp')$$,'23503',null,'cross-tenant dataset/organization pairing is rejected');
select isnt((select c.confrelid::regclass::text from pg_constraint c where c.conrelid='public.inventory_reconciliations'::regclass and c.conname='inventory_reconciliations_dataset_id_organization_id_fkey'),'public.onyx_datasets'::text,'external Onyx dependency is absent');

select * from finish();
rollback;

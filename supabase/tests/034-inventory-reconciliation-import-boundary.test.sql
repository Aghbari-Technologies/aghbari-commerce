begin;
create extension if not exists pgtap with schema extensions;
select plan(5);

select has_table('public','inventory_reconciliations','inventory reconciliation table exists');
select has_column('public','inventory_reconciliations','dataset_id','reconciliation retains a dataset reference');
select results_eq($$select c.confrelid::regclass::text from pg_constraint c join pg_class r on r.oid=c.conrelid where r.oid='public.inventory_reconciliations'::regclass and c.conname = 'inventory_reconciliations_dataset_id_organization_id_fkey'$$,$$values ('public.import_jobs'::text)$$,'dataset boundary points to the commerce import pipeline, not an external schema');
select throws_ok($$insert into public.inventory_reconciliations(organization_id,dataset_id,warehouse_id,source_name,source_fingerprint) values ('11111111-1111-4111-8111-111111111112','22222222-2222-4222-8222-222222222224','11111111-1111-4111-8111-111111111114','cross-tenant','cross-tenant')$$,'23503',null,'cross-tenant dataset/organization pairing is rejected by composite foreign key');
select isnt((select c.confrelid::regclass::text from pg_constraint c join pg_class r on r.oid=c.conrelid where r.oid='public.inventory_reconciliations'::regclass and c.conname = 'inventory_reconciliations_dataset_id_organization_id_fkey'),'public.onyx_datasets'::text,'external Onyx dependency is absent');

select * from finish();
rollback;

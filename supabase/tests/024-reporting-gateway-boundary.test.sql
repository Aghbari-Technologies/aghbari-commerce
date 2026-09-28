begin;

select plan(15);

insert into auth.users (id,email) values ('31313131-3131-4131-8131-313131313131','report-owner@test.local'),('32323232-3232-4232-8232-323232323232','report-admin@test.local'),('33333333-3333-4333-8333-333333333333','report-sales@test.local'),('36363636-3636-4363-8363-363636363636','report-owner-b@test.local');
insert into public.organizations(id,name,is_active) values ('34343434-3434-4434-8434-343434343434','Reporting Tenant A',true),('35353535-3535-4535-8535-353535353535','Reporting Tenant B',true);
insert into public.profiles(id,organization_id,role) values ('31313131-3131-4131-8131-313131313131','34343434-3434-4434-8434-343434343434','owner'),('32323232-3232-4232-8232-323232323232','34343434-3434-4434-8434-343434343434','admin'),('33333333-3333-4333-8333-333333333333','34343434-3434-4434-8434-343434343434','sales'),('36363636-3636-4363-8363-363636363636','35353535-3535-4535-8535-353535353535','owner');

set local role authenticated;
set local request.jwt.claim.role='authenticated';
set local request.jwt.claim.sub='32323232-3232-4232-8232-323232323232';

select ok((public.request_reporting_export('sales-2026-09','2026.09','1.0','report-key-0001','2026-09-01','2026-09-16')).dataset_id like 'DS-%','Admin can create a tenant-bound reporting publication request');
select is((public.request_reporting_export('sales-2026-09','2026.09','1.0','report-key-0001','2026-09-01','2026-09-16')).processing_status,'RECEIVED','New publication starts in RECEIVED state');
select is((public.request_reporting_export('sales-2026-09','2026.09','1.0','report-key-0001','2026-09-01','2026-09-16')).tenant_id,'34343434-3434-4434-8434-343434343434'::uuid,'Tenant identity is server-bound from the authenticated profile');
select is((select count(*) from public.reporting_exports where organization_id='34343434-3434-4434-8434-343434343434'),1::bigint,'Exactly one publication exists for the idempotency key');
select is((public.request_reporting_export('sales-2026-09','2026.09','1.0','report-key-0001','2026-09-01','2026-09-16')).id,(select id from public.reporting_exports where idempotency_key='report-key-0001'),'Exact replay returns the original publication');
select throws_ok($$select public.request_reporting_export('sales-2026-10','2026.10','1.0','report-key-0001')$$,'40001',null,'Changed source payload with the same key is rejected');
select throws_ok($$select public.request_reporting_export('sales-2026-09','2026.09','2.0','report-key-0002')$$,'22023',null,'Unsupported schema versions are rejected');
select throws_ok($$select public.request_reporting_export('sales-2026-09','2026.09','1.0','bad')$$,'22023',null,'Short/invalid idempotency keys are rejected');
select throws_ok($$select public.request_reporting_export('sales-2026-09','2026.09','1.0','report-key-period','2026-09-16','2026-09-01')$$,'22023',null,'Invalid data period is rejected');
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
select throws_ok($$select public.request_reporting_export('sales-2026-09','2026.09','1.0','report-key-sales')$$,'42501',null,'Sales role cannot publish analytical datasets');
select throws_ok($$insert into public.reporting_exports(organization_id,dataset_id,source_dataset_id,source_version,tenant_id,idempotency_key,provenance_ref,correlation_id) values ('34343434-3434-4434-8434-343434343434','DIRECT-WRITE','sales','v1','34343434-3434-4434-8434-343434343434','direct-write-key','prov://direct','corr-direct')$$,'42501',null,'Authenticated users cannot write reporting_exports directly');
select set_config('request.jwt.claim.sub','31313131-3131-4131-8131-313131313131',true);
select is((select processing_status from public.reporting_exports where idempotency_key='report-key-0001'),'RECEIVED','A failed external publication cannot silently replace or mutate the pending source request');
select is((select contract_version from public.reporting_exports where idempotency_key='report-key-0001'),'1.0','Contract version is stored with the publication');
select is((select schema_version from public.reporting_exports where idempotency_key='report-key-0001'),'1.0','Schema version is stored with the publication');
select set_config('request.jwt.claim.sub','36363636-3636-4363-8363-363636363636',true);
select is((select count(*) from public.reporting_exports where organization_id='34343434-3434-4434-8434-343434343434'),0::bigint,'Tenant B cannot read Tenant A reporting exports');
select * from finish();
rollback;

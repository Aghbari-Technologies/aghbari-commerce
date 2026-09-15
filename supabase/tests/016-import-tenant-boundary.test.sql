begin;

select plan(13);

create temp table fixture as
select gen_random_uuid() org_a, gen_random_uuid() org_b,
       gen_random_uuid() admin_a, gen_random_uuid() admin_b,
       gen_random_uuid() viewer_a, gen_random_uuid() warehouse_a,
       gen_random_uuid() warehouse_b, gen_random_uuid() branch_a,
       gen_random_uuid() branch_b;

grant select on fixture to authenticated;
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
select admin_a,'00000000-0000-0000-0000-000000000000'::uuid,'authenticated','authenticated','import-admin-a@fixture.invalid','x',now(),now() from fixture
union all select admin_b,'00000000-0000-0000-0000-000000000000'::uuid,'authenticated','authenticated','import-admin-b@fixture.invalid','x',now(),now() from fixture
union all select viewer_a,'00000000-0000-0000-0000-000000000000'::uuid,'authenticated','authenticated','import-viewer-a@fixture.invalid','x',now(),now() from fixture;
insert into public.organizations(id,name,is_active) select org_a,'Import Tenant A',true from fixture union all select org_b,'Import Tenant B',true from fixture;
insert into public.profiles(id,organization_id,role) select admin_a,org_a,'admin'::user_role from fixture union all select admin_b,org_b,'admin'::user_role from fixture union all select viewer_a,org_a,'viewer'::user_role from fixture;
insert into public.branches(id,organization_id,name,is_active) select branch_a,org_a,'Import Branch A',true from fixture union all select branch_b,org_b,'Import Branch B',true from fixture;
insert into public.warehouses(id,organization_id,branch_id,name,is_active) select warehouse_a,org_a,branch_a,'Import Warehouse A',true from fixture union all select warehouse_b,org_b,branch_b,'Import Warehouse B',true from fixture;

set local role authenticated;
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub',(select viewer_a::text from fixture),true);
select throws_ok($$select public.stage_product_import('viewer.xlsx',repeat('a',64),'[{"sku":"X","name":"X","unit":"unit","category":"C","quantity":1,"prices":{"retail":1,"wholesale":1,"distributor":1}}]'::jsonb)$$,'42501',null,'Viewer cannot stage imports');

select set_config('request.jwt.claim.sub',(select admin_a::text from fixture),true);
select ok((select public.stage_product_import('tenant-a.xlsx',repeat('a',64),'[{"sku":"IMP-A","name":"Imported A","unit":"unit","category":"Imported","quantity":4,"prices":{"retail":10,"wholesale":9,"distributor":8}}]'::jsonb) is not null),'Tenant A stage returns a job id');
select is((select count(*) from public.import_jobs where organization_id=(select org_a from fixture)),1::bigint,'Tenant A has exactly one staged job');
select throws_ok($$select public.stage_product_import('duplicate.xlsx',repeat('a',64),'[{"sku":"IMP-A2","name":"Duplicate","unit":"unit","category":"Imported","quantity":1,"prices":{"retail":2,"wholesale":2,"distributor":2}}]'::jsonb)$$,'23505',null,'Duplicate fingerprint is rejected inside the same tenant');
select throws_ok($$select public.stage_product_import('invalid.xlsx',repeat('a',63),'[{"sku":"BAD","name":"Bad","unit":"unit","category":"Imported","quantity":1,"prices":{"retail":2,"wholesale":2,"distributor":2}}]'::jsonb)$$,'22023',null,'Invalid fingerprint is rejected by the server contract');
select throws_ok(format('select public.commit_product_import((select id from public.import_jobs where organization_id=%L limit 1),%L)',org_a,warehouse_b),'42501',null,'Tenant A cannot commit to Tenant B warehouse') from fixture;
select results_eq(format('select imported_rows,products_created,products_updated,inventory_changed from public.commit_product_import((select id from public.import_jobs where organization_id=%L limit 1),%L)',org_a,warehouse_a),$$values (1,1,0,1)$$,'Tenant A commit returns authoritative mutation counts') from fixture;
select throws_ok(format('select public.commit_product_import((select id from public.import_jobs where organization_id=%L limit 1),%L)',org_a,warehouse_a),'P0001',null,'Completed import cannot be replayed') from fixture;
select is((select count(*) from public.products where organization_id=(select org_a from fixture) and sku='IMP-A'),1::bigint,'Tenant A import created exactly one canonical product');
select set_config('request.jwt.claim.sub',(select admin_b::text from fixture),true);
select ok((select public.stage_product_import('tenant-b.xlsx',repeat('a',64),'[{"sku":"IMP-B","name":"Imported B","unit":"unit","category":"Imported","quantity":3,"prices":{"retail":11,"wholesale":10,"distributor":9}}]'::jsonb) is not null),'Tenant B can independently reuse Tenant A fingerprint');
select is((select count(*) from public.import_jobs where source_fingerprint=repeat('a',64)),1::bigint,'Tenant B sees only its own staged job under RLS');
select throws_ok(format('select public.commit_product_import(%L,%L)',(select id from public.import_jobs where organization_id=(select org_a from fixture) limit 1),warehouse_b),'P0002',null,'Tenant B cannot commit Tenant A job') from fixture;
select is((select count(*) from public.import_rows r join public.import_jobs j on j.id=r.import_job_id where j.organization_id=(select org_b from fixture)),1::bigint,'Tenant B import rows remain tenant-scoped');

select * from finish();
rollback;

begin;

create extension if not exists pgtap with schema extensions;
select plan(15);

select results_eq($$select public from storage.buckets where id='product-media'$$,$$values (false)$$,'Product media bucket is private');
select results_eq($$select file_size_limit from storage.buckets where id='product-media'$$,$$values (5242880::bigint)$$,'Product media bucket enforces the 5 MiB server-side limit');
select results_eq($$select allowed_mime_types from storage.buckets where id='product-media'$$,$$values (array['image/webp']::text[])$$,'Product media bucket accepts only canonical WebP objects');
select policies_are('storage','objects',array['product_media_select','product_media_insert','product_media_delete'],'Product media Storage surface has only the intended three policies');
select policy_roles_are('storage','objects','product_media_insert',array['authenticated'],'Product media INSERT is authenticated-only');
select ok((select with_check::text from pg_policies where schemaname='storage' and tablename='objects' and policyname='product_media_insert') like '%bucket_id%' ,'Product media INSERT policy is bucket-scoped');
select ok((select with_check::text from pg_policies where schemaname='storage' and tablename='objects' and policyname='product_media_insert') like '%is_staff%' and (select with_check::text from pg_policies where schemaname='storage' and tablename='objects' and policyname='product_media_insert') like '%organization%' ,'Product media INSERT policy enforces staff and tenant/product binding');

insert into auth.users (id, email) values ('11111111-1111-4111-8111-111111111111','storage-a@test.local'),('22222222-2222-4222-8222-222222222222','storage-b@test.local');
insert into public.organizations (id,name) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Storage Tenant A'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Storage Tenant B');
insert into public.customers (id,organization_id,name,tier) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Customer A','wholesale'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Customer B','wholesale');
insert into public.profiles (id,organization_id,customer_id,role) values ('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01','admin'),('22222222-2222-4222-8222-222222222222','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb01','admin');
insert into public.products (id,organization_id,sku,name,unit,status) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','A-1','Product A','كرتون','active'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb11','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','B-1','Product B','كرتون','active');
insert into storage.objects (bucket_id,name,owner_id,metadata) values ('product-media','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21.webp','11111111-1111-4111-8111-111111111111','{"mimetype":"image/webp","size":2048}'::jsonb),('product-media','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb11/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb21.webp','22222222-2222-4222-8222-222222222222','{"mimetype":"image/webp","size":1024}'::jsonb);

select set_config('request.jwt.claims','{"role":"authenticated","sub":"11111111-1111-4111-8111-111111111111"}',true);
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select set_config('request.jwt.claim.role','authenticated',true);
set local role authenticated;
select results_eq($$select count(*) from storage.objects where bucket_id='product-media'$$,$$values (1::bigint)$$,'Tenant A can read only its own active product media');
select results_eq($$select count(*) from storage.objects where bucket_id='product-media' and name like 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/%'$$,$$values (0::bigint)$$,'Tenant A cannot read Tenant B media');
select lives_ok($$select public.register_product_media('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11'::uuid,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21.webp','image/webp',1200,900,2048)$$,'Server registers a valid owned WebP object');
select throws_ok($$select public.register_product_media('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11'::uuid,'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/bbbbbbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb21.webp','image/webp',1200,900,1024)$$,'42501',null,'Server rejects a foreign-tenant storage path');
select throws_ok($$select public.register_product_media('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11'::uuid,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11/not-a-uuid.webp','image/webp',1200,900,2048)$$,'22023',null,'Server rejects a malformed storage path');
select throws_ok($$select public.register_product_media('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11'::uuid,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21.webp','image/png',1200,900,2048)$$,'22023',null,'Server rejects non-WebP registration');
select set_config('request.jwt.claims','',true);
select set_config('request.jwt.claim.sub','',true);
select set_config('request.jwt.claim.role','anon',true);
set local role anon;
select results_eq($$select count(*) from storage.objects where bucket_id='product-media'$$,$$values (0::bigint)$$,'Anonymous context cannot read product media');
select results_eq($$select array_agg(upper(cmd) order by cmd) from pg_policies where schemaname='storage' and tablename='objects' and policyname in ('product_media_select','product_media_insert','product_media_delete')$$,$$values (array['DELETE','INSERT','SELECT']::text[])$$,'Product media lifecycle excludes UPDATE and retains INSERT/DELETE/SELECT boundaries');
select * from finish(); rollback;

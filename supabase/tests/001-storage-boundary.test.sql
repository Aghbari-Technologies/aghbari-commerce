begin;
create extension if not exists pgtap with schema extensions;
select plan(15);
select results_eq($$select public from storage.buckets where id='product-media'$$,$$values (false)$$,'Product media bucket is private');
select results_eq($$select file_size_limit from storage.buckets where id='product-media'$$,$$values (5242880::bigint)$$,'Product media bucket enforces the 5 MiB server-side limit');
select results_eq($$select allowed_mime_types from storage.buckets where id='product-media'$$,$$values (array['image/webp']::text[])$$,'Product media bucket accepts only canonical WebP objects');
insert into auth.users(id,email) values ('11111111-1111-4111-8111-111111111111','storage-a@test.local'),('22222222-2222-4222-8222-222222222222','storage-b@test.local');
insert into public.organizations(id,name) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Storage Tenant A'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Storage Tenant B');
insert into public.customers(id,organization_id,name,tier) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Customer A','wholesale'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Customer B','wholesale');
insert into public.profiles(id,organization_id,customer_id,role) values ('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01','admin'),('22222222-2222-4222-8222-222222222222','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01','admin');
insert into public.products(id,organization_id,sku,name,unit,status) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','A-1','Product A','كرتون','active'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb11','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','B-1','Product B','كرتون','active');
set local role service_role;
insert into storage.objects(bucket_id,name,metadata) values
('product-media','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21.webp','{"mimetype":"image/webp","size":1024}'::jsonb),
('product-media','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb11/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb21.webp','{"mimetype":"image/webp","size":1024}'::jsonb),
('product-media','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa99/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa29.webp','{"mimetype":"image/webp","size":1024}'::jsonb);
set local role authenticated;
set local request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';
select is((select count(*) from storage.objects where bucket_id='product-media'),1::bigint,'Tenant A can enumerate only media bound to its real products');
select is((select count(*) from storage.objects where bucket_id='product-media' and name like 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/%'),0::bigint,'Tenant A cannot read Tenant B media');
select is((select count(*) from storage.objects where name='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa99/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa29.webp'),0::bigint,'Orphan product media is not readable');
select lives_ok($$select public.register_product_media('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11'::uuid,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21.webp','image/webp',1200,900,1024)$$,'Server registers an existing tenant-owned WebP object');
select throws_ok($$select public.register_product_media('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11'::uuid,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11/missing.webp','image/webp',1200,900,1024)$$,'42501',null,'Server rejects a missing object/path that cannot be proven tenant-owned');
select throws_ok($$select public.register_product_media('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb11'::uuid,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21.webp','image/webp',1200,900,1024)$$,'42501',null,'Server rejects cross-tenant product registration');
select throws_ok($$select public.register_product_media('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11'::uuid,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21.webp','image/png',1200,900,1024)$$,'22023',null,'Server rejects non-WebP registration');
select throws_ok($$select public.register_product_media('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11'::uuid,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21.webp','image/webp',5000,900,1024)$$,'22023',null,'Server rejects invalid image dimensions');
select throws_ok($$select public.register_product_media('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11'::uuid,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21.webp','image/webp',1200,900,6291456)$$,'22023',null,'Server rejects an oversized declared media payload');
select is((select count(*) from public.product_media where organization_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),1::bigint,'Registered media is persisted in the tenant product-media table');
select is((select count(*) from public.product_media where organization_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),0::bigint,'Tenant B product-media rows remain isolated');
select is((select count(*) from public.audit_events where action='product-media.register' and organization_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),1::bigint,'Successful media registration is audited');
set local request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';
select is((select count(*) from storage.objects where bucket_id='product-media'),1::bigint,'Tenant B sees only its own product-bound media');
select is((select count(*) from public.product_media where organization_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),0::bigint,'Tenant B cannot see Tenant A product-media rows');
select * from finish();
rollback;

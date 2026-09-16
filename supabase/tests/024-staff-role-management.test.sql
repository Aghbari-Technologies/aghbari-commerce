begin;

create extension if not exists pgtap with schema extensions;
select plan(7);

insert into auth.users(id,email) values
('aaaaaaaa-1111-4111-8111-111111111111','owner-a@test.local'),
('aaaaaaaa-1111-4111-8111-111111111112','admin-a@test.local'),
('aaaaaaaa-1111-4111-8111-111111111113','viewer-a@test.local'),
('bbbbbbbb-2222-4222-8222-222222222221','owner-b@test.local');
insert into public.organizations(id,name) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Role Tenant A'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Role Tenant B');
insert into public.profiles(id,organization_id,role) values
('aaaaaaaa-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','owner'),
('aaaaaaaa-1111-4111-8111-111111111112','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','admin'),
('aaaaaaaa-1111-4111-8111-111111111113','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','viewer'),
('bbbbbbbb-2222-4222-8222-222222222221','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','owner');

set local role authenticated;
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub','aaaaaaaa-1111-4111-8111-111111111112',true);
select is((select count(*) from public.list_organization_users()),3::bigint,'Admin can list only its organization users');
select throws_ok($$select public.set_organization_user_role('aaaaaaaa-1111-4111-8111-111111111113','sales'::public.user_role)$$,'42501','owner role management required','Admin cannot mutate staff roles');

select set_config('request.jwt.claim.sub','aaaaaaaa-1111-4111-8111-111111111111',true);
select is((select public.set_organization_user_role('aaaaaaaa-1111-4111-8111-111111111113','sales'::public.user_role)),'sales'::public.user_role,'Owner can change a same-organization user role');
select throws_ok($$select public.set_organization_user_role('bbbbbbbb-2222-4222-8222-222222222221','viewer'::public.user_role)$$,'P0002','organization user not found','Owner cannot mutate another organization user');
select throws_ok($$select public.set_organization_user_role('aaaaaaaa-1111-4111-8111-111111111111','admin'::public.user_role)$$,'55006','cannot remove the last organization owner','Last organization owner cannot be removed');
select is((select role from public.list_organization_users() where user_id='aaaaaaaa-1111-4111-8111-111111111113'),'sales'::public.user_role,'Role mutation is visible through the tenant-scoped staff API');
select is((select count(*) from public.audit_events where action='organization.user-role.update' and target_id='aaaaaaaa-1111-4111-8111-111111111113'),'1'::bigint,'Role mutation creates an audit event');

select * from finish();
rollback;

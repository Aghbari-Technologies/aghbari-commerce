begin;
create extension if not exists pgtap with schema extensions;
select plan(10);

insert into auth.users(id,email) values
 ('11111111-1111-4111-8111-111111111111','staff-a@test.local'),
 ('22222222-2222-4222-8222-222222222222','staff-b@test.local'),
 ('33333333-3333-4333-8333-333333333333','customer@test.local');
insert into public.organizations(id,name) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Invitation Tenant A'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Invitation Tenant B');
insert into public.customers(id,organization_id,name,tier) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Customer A','wholesale'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Customer B','wholesale');
insert into public.profiles(id,organization_id,role) values
 ('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','admin'),
 ('22222222-2222-4222-8222-222222222222','bbbbbbbb-bbbb-4bbb-8ddd-bbbbbbbbbbbb'::uuid,'admin');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","email":"staff-a@test.local"}',true);
select lives_ok(
 $$select public.create_customer_invitation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01'::uuid,'customer@test.local',24)$$,
 'Tenant A staff can create an invitation for its customer'
);
select results_eq(
 $$select count(*) from public.customer_invitations where organization_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
 $$values(1::bigint)$$,
 'Created invitation is stored under Tenant A'
);
select results_eq(
 $$select count(*) from public.customer_invitations where organization_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and email='customer@test.local' and token_hash not like '%customer@test.local%'$$,
 $$values(1::bigint)$$,
 'Invitation persists a hash, not the plaintext token'
);
select throws_ok(
 $$select public.create_customer_invitation('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01'::uuid,'customer@test.local',24)$$,
 'CUSTOMER_NOT_FOUND', null,
 'Tenant A staff cannot invite Tenant B customer'
);
select results_eq(
 $$select count(*) from public.customer_invitations where organization_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'$$,
 $$values(0::bigint)$$,
 'Cross-tenant invitation attempt creates no Tenant B row'
);

select set_config('request.jwt.claims','{"sub":"33333333-3333-4333-8333-333333333333","email":"customer@test.local"}',true);
select results_eq(
 $$select count(*) from public.customer_invitations where organization_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
 $$values(0::bigint)$$,
 'Customer identity cannot read invitation rows through staff policy'
);
select throws_ok(
 $$select public.accept_customer_invitation('not-a-valid-token-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')$$,
 'INVITATION_INVALID_OR_EXPIRED', null,
 'Unknown invitation token is rejected'
);

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","email":"staff-a@test.local"}',true);
select results_eq(
 $$select count(*) from public.audit_events where organization_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and action='customer_invitation_created'$$,
 $$values(1::bigint)$$,
 'Invitation creation emits a tenant-scoped audit event'
);
select results_eq(
 $$select count(*) from information_schema.routines where routine_schema='public' and routine_name='create_customer_invitation'$$,
 $$values(1::bigint)$$,
 'Authoritative invitation RPC exists exactly once'
);
select is(
 has_function_privilege('anon','public.create_customer_invitation(uuid,text,integer)','execute'),
 false,
 'Anonymous callers cannot execute invitation creation RPC'
);
select * from finish();
rollback;

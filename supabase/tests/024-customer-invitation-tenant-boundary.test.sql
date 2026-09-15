begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

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
 ('22222222-2222-4222-8222-222222222222','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','admin');

create temporary table invitation_fixture(id uuid, token text) on commit drop;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","email":"staff-a@test.local"}',true);
insert into invitation_fixture
select (r->>'id')::uuid, r->>'token'
from public.create_customer_invitation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01'::uuid,'customer@test.local',24) r;
select results_eq(
 $$select count(*) from invitation_fixture$$,
 $$values(1::bigint)$$,
 'Tenant A staff can create an invitation for its customer'
);
select results_eq(
 $$select count(*) from public.customer_invitations where organization_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
 $$values(1::bigint)$$,
 'Created invitation is stored under Tenant A'
);
select results_eq(
 $$select count(*) from public.customer_invitations where organization_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and token_hash=encode(digest((select token from invitation_fixture),'sha256'),'hex')$$,
 $$values(1::bigint)$$,
 'Invitation stores the SHA-256 token hash, not plaintext'
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
select results_eq(
 $$select (public.accept_customer_invitation((select token from invitation_fixture))).id$$,
 $$select 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01'::uuid$$,
 'Correct invited email accepts the invitation and links the customer account'
);
select results_eq(
 $$select count(*) from public.customer_invitations where id=(select id from invitation_fixture) and accepted_at is not null and revoked_at is null$$,
 $$values(1::bigint)$$,
 'Accepted invitation is single-use and marked accepted'
);

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","email":"staff-a@test.local"}',true);
insert into invitation_fixture
select (r->>'id')::uuid, r->>'token'
from public.create_customer_invitation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01'::uuid,'customer@test.local',24) r;
select is(
 public.revoke_customer_invitation((select id from invitation_fixture order by id desc limit 1)),
 true,
 'Tenant A admin can revoke a pending invitation'
);
select results_eq(
 $$select count(*) from public.customer_invitations where id=(select id from invitation_fixture order by id desc limit 1) and revoked_at is not null$$,
 $$values(1::bigint)$$,
 'Revoked invitation is terminally marked revoked'
);

select set_config('request.jwt.claims','{"sub":"22222222-2222-4222-8222-222222222222","email":"staff-b@test.local"}',true);
select is(
 public.revoke_customer_invitation((select id from invitation_fixture order by id desc limit 1)),
 false,
 'Tenant B admin cannot revoke Tenant A invitation'
);

select is(
 has_function_privilege('anon','public.create_customer_invitation(uuid,text,integer)','execute'),
 false,
 'Anonymous callers cannot execute invitation creation RPC'
);
select * from finish();
rollback;

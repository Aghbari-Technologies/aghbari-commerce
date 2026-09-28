begin;
create extension if not exists pgtap with schema extensions;
select plan(13);

select is((select value from unnest(coalesce(proconfig,array[]::text[])) value where value like 'search_path=%' limit 1),'search_path=""','list_organization_users uses empty search_path')
from pg_proc where oid='public.list_organization_users()'::regprocedure;
select is((select value from unnest(coalesce(proconfig,array[]::text[])) value where value like 'search_path=%' limit 1),'search_path=""','set_organization_user_role uses empty search_path')
from pg_proc where oid='public.set_organization_user_role(uuid,public.user_role)'::regprocedure;
select ok(has_function_privilege('anon','public.list_organization_users()','EXECUTE') is false,'anon cannot execute organization directory');
select ok(has_function_privilege('authenticated','public.list_organization_users()','EXECUTE'),'authenticated can execute organization directory');
select ok(has_function_privilege('anon','public.set_organization_user_role(uuid,public.user_role)','EXECUTE') is false,'anon cannot execute role mutation');
select ok(has_function_privilege('authenticated','public.set_organization_user_role(uuid,public.user_role)','EXECUTE'),'authenticated can execute role mutation');

set local role postgres;
insert into auth.users(id,email) values
 ('71111111-1111-4111-8111-111111111111','rbac-owner@test.local'),
 ('72222222-2222-4222-8222-222222222222','rbac-staff@test.local'),
 ('73333333-3333-4333-8333-333333333333','rbac-customer@test.local')
on conflict(id) do nothing;
insert into public.organizations(id,name) values
 ('7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','RBAC Test') on conflict(id) do nothing;
insert into public.customers(id,organization_id,name,tier) values
 ('7ccccccc-cccc-4ccc-8ccc-cccccccccc01','7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','RBAC Customer','wholesale')
on conflict(id) do nothing;
insert into public.profiles(id,organization_id,customer_id,role) values
 ('71111111-1111-4111-8111-111111111111','7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',null,'owner'),
 ('72222222-2222-4222-8222-222222222222','7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',null,'viewer'),
 ('73333333-3333-4333-8333-333333333333','7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','7ccccccc-cccc-4ccc-8ccc-cccccccccc01','viewer')
on conflict(id) do update set organization_id=excluded.organization_id,customer_id=excluded.customer_id,role=excluded.role;

set local role authenticated;
select set_config('request.jwt.claim.sub','71111111-1111-4111-8111-111111111111',true);
select results_eq($$select count(*)::bigint from public.list_organization_users()$$,$$values (3::bigint)$$,'owner sees only current organization users');
select is(public.set_organization_user_role('72222222-2222-4222-8222-222222222222','sales'),'sales'::public.user_role,'owner can change staff role');
set local role postgres;
select is((select role from public.profiles where id='72222222-2222-4222-8222-222222222222'),'sales'::public.user_role,'staff role persists');
set local role authenticated;

create temp table rbac_expectations(name text primary key, passed boolean);
do $$
begin
  begin
    perform public.set_organization_user_role('73333333-3333-4333-8333-333333333333','admin');
    insert into rbac_expectations values('customer-promotion',false);
  exception when others then
    insert into rbac_expectations values('customer-promotion',sqlstate='42501');
  end;
end $$;
select ok((select passed from rbac_expectations where name='customer-promotion'),'customer cannot be promoted into staff role');

do $$
begin
  begin
    perform public.set_organization_user_role('71111111-1111-4111-8111-111111111111','admin');
    insert into rbac_expectations values('self-change',false);
  exception when others then
    insert into rbac_expectations values('self-change',sqlstate='42501');
  end;
end $$;
select ok((select passed from rbac_expectations where name='self-change'),'owner cannot change own role');

set local role authenticated;
select set_config('request.jwt.claim.sub','72222222-2222-4222-8222-222222222222',true);
do $$
begin
  begin
    perform public.set_organization_user_role('73333333-3333-4333-8333-333333333333','sales');
    insert into rbac_expectations values('non-owner',false);
  exception when others then
    insert into rbac_expectations values('non-owner',sqlstate='42501');
  end;
end $$;
select ok((select passed from rbac_expectations where name='non-owner'),'non-owner cannot mutate roles');
select ok(exists(select 1 from public.audit_events where action='organization.user-role.update' and target_id='72222222-2222-4222-8222-222222222222' and result='success'),'role change is audited');

select * from finish();
rollback;
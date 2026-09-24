begin;
create extension if not exists pgtap with schema extensions;
select plan(10);

select is((select value from unnest(coalesce(proconfig,array[]::text[])) value where value like 'search_path=%' limit 1),'search_path=""','list_staff_members pins empty search_path')
from pg_proc where oid='public.list_staff_members()'::regprocedure;
select is((select value from unnest(coalesce(proconfig,array[]::text[])) value where value like 'search_path=%' limit 1),'search_path=""','set_staff_role pins empty search_path')
from pg_proc where oid='public.set_staff_role(uuid,public.user_role)'::regprocedure;
select ok(has_function_privilege('anon','public.list_staff_members()','EXECUTE') is false,'anon cannot execute staff directory');
select ok(has_function_privilege('authenticated','public.list_staff_members()','EXECUTE'),'authenticated can execute staff directory');
select ok(has_function_privilege('anon','public.set_staff_role(uuid,public.user_role)','EXECUTE') is false,'anon cannot execute role mutation');
select ok(has_function_privilege('authenticated','public.set_staff_role(uuid,public.user_role)','EXECUTE'),'authenticated can execute role mutation');

set local role postgres;
insert into auth.users(id,email) values
 ('11111111-1111-4111-8111-111111111111','rbac-owner@test.local'),
 ('22222222-2222-4222-8222-222222222222','rbac-staff@test.local'),
 ('33333333-3333-4333-8333-333333333333','rbac-other@test.local')
on conflict (id) do nothing;
insert into public.organizations(id,name) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','RBAC Test') on conflict (id) do nothing;
insert into public.profiles(id,organization_id,customer_id,role) values
 ('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',null,'owner'),
 ('22222222-2222-4222-8222-222222222222','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',null,'viewer')
on conflict (id) do update set organization_id=excluded.organization_id,customer_id=excluded.customer_id,role=excluded.role;

set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select results_eq($$select count(*)::bigint from public.list_staff_members()$$,$$values (2::bigint)$$,'owner sees only current tenant staff');
select is(public.set_staff_role('22222222-2222-4222-8222-222222222222','sales'),'sales'::public.user_role,'owner can change staff role');

create temp table rbac_expectations(name text primary key, passed boolean);
do $$
begin
  begin
    perform public.set_staff_role('11111111-1111-4111-8111-111111111111','admin');
    insert into rbac_expectations values ('self-change',false) on conflict(name) do update set passed=false;
  exception when others then
    insert into rbac_expectations values ('self-change',sqlstate='42501') on conflict(name) do update set passed=excluded.passed;
  end;
end $$;
select ok((select passed from rbac_expectations where name='self-change'),'owner cannot change own role');

set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$
begin
  begin
    perform public.set_staff_role('33333333-3333-4333-8333-333333333333','sales');
    insert into rbac_expectations values ('non-owner',false) on conflict(name) do update set passed=false;
  exception when others then
    insert into rbac_expectations values ('non-owner',sqlstate='42501') on conflict(name) do update set passed=excluded.passed;
  end;
end $$;
select ok((select passed from rbac_expectations where name='non-owner'),'non-owner cannot mutate roles');

select * from finish();
rollback;
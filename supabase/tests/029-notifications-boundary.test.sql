begin;

select plan(5);

insert into auth.users(id,email) values
  ('41414141-4141-4141-8141-414141414141','notification-customer-a@test.local'),
  ('42424242-4242-4242-8242-424242424242','notification-customer-b@test.local');
insert into public.organizations(id,name,is_active) values
  ('43434343-4343-4343-8343-434343434343','Notification Tenant A',true),
  ('44444444-4444-4444-8444-444444444444','Notification Tenant B',true);
insert into public.customers(id,organization_id,name,tier,is_active) values
  ('45454545-4545-4545-8545-454545454545','43434343-4343-4343-8343-434343434343','Notification Customer A','retail',true),
  ('46464646-4646-4646-8646-464646464646','44444444-4444-4444-8444-444444444444','Notification Customer B','retail',true);
insert into public.profiles(id,organization_id,customer_id,role) values
  ('41414141-4141-4141-8141-414141414141','43434343-4343-4343-8343-434343434343','45454545-4545-4545-8545-454545454545','viewer'),
  ('42424242-4242-4242-8242-424242424242','44444444-4444-4444-8444-444444444444','46464646-4646-4646-8646-464646464646','viewer');

-- Seed through the test owner before exercising authenticated RLS.
insert into public.notifications(organization_id,customer_id,kind,title,body)
values ('43434343-4343-4343-8343-434343434343','45454545-4545-4545-8545-454545454545','test','Fixture','Tenant A');

set local role authenticated;
set local request.jwt.claim.role='authenticated';
set local request.jwt.claim.sub='41414141-4141-4141-8141-414141414141';

select lives_ok($$select id from public.notifications limit 1$$,'Notification table is queryable inside the customer contract');
select is((select count(*) from public.notifications),1::bigint,'Tenant A sees its own seeded notification');
select throws_ok($$insert into public.notifications(organization_id,customer_id,kind,title,body) values ('43434343-4343-4343-8343-434343434343','45454545-4545-4545-8545-454545454545','test','Direct write','blocked')$$,'42501',null,'Customer direct notification writes are blocked');
select is((select count(*) from public.notifications),1::bigint,'Tenant A cannot change notification count through direct write');
set_config('request.jwt.claim.sub','42424242-4242-4242-8242-424242424242',true);
select is((select count(*) from public.notifications),0::bigint,'Tenant B cannot read Tenant A notifications');

select * from finish();
rollback;

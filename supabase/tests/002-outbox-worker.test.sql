begin;
create extension if not exists pgtap with schema extensions;
select plan(8);
insert into auth.users (id,email) values ('33333333-3333-4333-8333-333333333333','worker-a@test.local');
insert into public.organizations(id,name) values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','Worker Tenant A'),('dddddddd-dddd-4ddd-8ddd-dddddddddddd','Worker Tenant B');
insert into public.customers(id,organization_id,name,tier) values ('cccccccc-cccc-4ccc-8ccc-cccccccccc01','cccccccc-cccc-4ccc-8ccc-cccccccccccc','Worker Customer','wholesale');
insert into public.profiles(id,organization_id,customer_id,role) values ('33333333-3333-4333-8333-333333333333','cccccccc-cccc-4ccc-8ccc-cccccccccccc','cccccccc-cccc-4ccc-8ccc-cccccccccc01','admin');
insert into public.outbox_events(id,organization_id,aggregate_type,aggregate_id,event_type,payload,status,attempts,locked_until) values
 ('cccccccc-cccc-4ccc-8ccc-cccccccccc11','cccccccc-cccc-4ccc-8ccc-cccccccccccc','order','cccccccc-cccc-4ccc-8ccc-cccccccccc21','order.created','{"kind":"tenant-a"}'::jsonb,'pending',0,null),
 ('dddddddd-dddd-4ddd-8ddd-dddddddddd11','dddddddd-dddd-4ddd-8ddd-dddddddddddd','order','dddddddd-dddd-4ddd-8ddd-dddddddddd21','order.created','{"kind":"tenant-b"}'::jsonb,'pending',0,null),
 ('cccccccc-cccc-4ccc-8ccc-cccccccccc12','cccccccc-cccc-4ccc-8ccc-cccccccccccc','order','cccccccc-cccc-4ccc-8ccc-cccccccccc22','order.created','{}'::jsonb,'processing',1,now()+interval '1 hour');
select set_config('request.jwt.claims','{"role":"authenticated","sub":"33333333-3333-4333-8333-333333333333"}',true);
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
select set_config('request.jwt.claim.role','authenticated',true);
set local role authenticated;
select results_eq($$select organization_id from public.claim_outbox_events(10)$$,$$values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc'::uuid)$$,'Tenant-scoped worker claim returns only local pending events');
select results_eq($$select status from public.outbox_events where id='cccccccc-cccc-4ccc-8ccc-cccccccccc11'::uuid$$,$$values ('processing'::text)$$,'Claim transitions the event into processing');
select results_eq($$select attempts from public.outbox_events where id='cccccccc-cccc-4ccc-8ccc-cccccccccc11'::uuid$$,$$values (1::integer)$$,'Claim increments attempts exactly once');
select is(public.ack_outbox_event('cccccccc-cccc-4ccc-8ccc-cccccccccc11'::uuid),true,'Acknowledgement succeeds for the claimed tenant event');
select results_eq($$select status from public.outbox_events where id='cccccccc-cccc-4ccc-8ccc-cccccccccc11'::uuid$$,$$values ('delivered'::text)$$,'Acknowledged event becomes delivered');
update public.outbox_events set status='processing', locked_until=now()-interval '1 minute' where id='cccccccc-cccc-4ccc-8ccc-cccccccccc12'::uuid;
select is(public.recover_expired_outbox_events(10),1,'Expired worker lease is recovered exactly once');
select results_eq($$select status from public.outbox_events where id='cccccccc-cccc-4ccc-8ccc-cccccccccc12'::uuid$$,$$values ('pending'::text)$$,'Recovered work returns to pending for retry');
select is((select count(*) from public.outbox_events where organization_id='dddddddd-dddd-4ddd-8ddd-dddddddddddd'),0::bigint,'Worker context cannot observe another tenant event');
select * from finish(); rollback;

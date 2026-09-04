\set ON_ERROR_STOP on
create role authenticated login;
\i supabase/migrations/0001_core_foundation.sql
\i supabase/migrations/0002_auth_scope_hardening.sql
\i supabase/migrations/0003_order_state_machine.sql
\i supabase/migrations/0004_import_media_reliability.sql
\i supabase/migrations/0005_outbox_delivery.sql
\i supabase/migrations/0006_customer_catalog_boundary.sql
\i supabase/migrations/0007_cart_checkout.sql

insert into app.organizations(id,name) values ('00000000-0000-0000-0000-0000000000a1','Tenant A'),('00000000-0000-0000-0000-0000000000b1','Tenant B');
insert into app.roles(id,code) values('00000000-0000-0000-0000-000000000001','customer'),('00000000-0000-0000-0000-000000000002','integration_worker');
insert into app.users(id,display_name) values('00000000-0000-0000-0000-0000000000aa','User A'),('00000000-0000-0000-0000-0000000000bb','User B'),('00000000-0000-0000-0000-0000000000cc','Worker A');
insert into app.user_roles(user_id,organization_id,role_id) values('00000000-0000-0000-0000-0000000000aa','00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-0000000000bb','00000000-0000-0000-0000-0000000000b1','00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-0000000000cc','00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-000000000002');
insert into app.branches(id,organization_id,name) values('00000000-0000-0000-0000-0000000000a2','00000000-0000-0000-0000-0000000000a1','Main A'),('00000000-0000-0000-0000-0000000000b2','00000000-0000-0000-0000-0000000000b1','Main B');
insert into app.warehouses(id,organization_id,branch_id,name) values('00000000-0000-0000-0000-0000000000a3','00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-0000000000a2','Warehouse A'),('00000000-0000-0000-0000-0000000000b3','00000000-0000-0000-0000-0000000000b1','00000000-0000-0000-0000-0000000000b2','Warehouse B');
insert into app.customer_tiers(id,organization_id,code,name) values('00000000-0000-0000-0000-0000000000c1','00000000-0000-0000-0000-0000000000a1','tier1','Tier 1'),('00000000-0000-0000-0000-0000000000c2','00000000-0000-0000-0000-0000000000a1','tier2','Tier 2'),('00000000-0000-0000-0000-0000000000c3','00000000-0000-0000-0000-0000000000a1','tier3','Tier 3'),('00000000-0000-0000-0000-0000000000d1','00000000-0000-0000-0000-0000000000b1','tier1','Tier 1');
insert into app.customers(id,organization_id,name,customer_tier_id) values('00000000-0000-0000-0000-0000000000ca','00000000-0000-0000-0000-0000000000a1','Customer A','00000000-0000-0000-0000-0000000000c1'),('00000000-0000-0000-0000-0000000000cb','00000000-0000-0000-0000-0000000000b1','Customer B','00000000-0000-0000-0000-0000000000d1');
insert into app.customer_users(organization_id,customer_id,user_id) values('00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-0000000000ca','00000000-0000-0000-0000-0000000000aa'),('00000000-0000-0000-0000-0000000000b1','00000000-0000-0000-0000-0000000000cb','00000000-0000-0000-0000-0000000000bb');
insert into app.categories(id,organization_id,name) values('00000000-0000-0000-0000-0000000000e1','00000000-0000-0000-0000-0000000000a1','Food');
insert into app.products(id,organization_id,category_id,sku,name,unit) values('00000000-0000-0000-0000-0000000000fa','00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-0000000000e1','SKU-A','Product A','box'),('00000000-0000-0000-0000-0000000000fb','00000000-0000-0000-0000-0000000000b1',null,'SKU-B','Product B','box');
insert into app.price_lists(id,organization_id,customer_tier_id,code,currency) values('00000000-0000-0000-0000-0000000000f1','00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-0000000000c1','T1','YER'),('00000000-0000-0000-0000-0000000000f2','00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-0000000000c2','T2','YER'),('00000000-0000-0000-0000-0000000000f3','00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-0000000000c3','T3','YER');
insert into app.product_prices(organization_id,price_list_id,product_id,unit_price) values('00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-0000000000f1','00000000-0000-0000-0000-0000000000fa',100),('00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-0000000000f2','00000000-0000-0000-0000-0000000000fa',90),('00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-0000000000f3','00000000-0000-0000-0000-0000000000fa',80);
insert into app.inventory_balances(organization_id,warehouse_id,product_id,quantity) values('00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-0000000000a3','00000000-0000-0000-0000-0000000000fa',3),('00000000-0000-0000-0000-0000000000b1','00000000-0000-0000-0000-0000000000b3','00000000-0000-0000-0000-0000000000fb',3);

set role authenticated;
set request.jwt.claim.sub='00000000-0000-0000-0000-0000000000aa';
set request.jwt.claim.org_id='00000000-0000-0000-0000-0000000000a1';
set request.jwt.claim.customer_id='00000000-0000-0000-0000-0000000000ca';
do $$ begin if (select count(*) from app.products where id='00000000-0000-0000-0000-0000000000fb') <> 0 then raise exception 'cross-tenant product leak'; end if; end $$;
do $$ begin if (select count(*) from app.product_prices) <> 0 then raise exception 'raw tier price leakage'; end if; end $$;
do $$ begin if (select count(*) from app.inventory_balances) <> 0 then raise exception 'raw warehouse inventory leakage'; end if; end $$;
do $$ begin if (select unit_price from app.get_product_catalog(null,100) where sku='SKU-A') <> 100 then raise exception 'catalog price projection incorrect'; end if; end $$;
select * from app.create_order('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000fa',2,'00000000-0000-0000-0000-0000000000a3');
reset role;
do $$ begin if (select quantity from app.inventory_balances where warehouse_id='00000000-0000-0000-0000-0000000000a3' and product_id='00000000-0000-0000-0000-0000000000fa') <> 1 then raise exception 'inventory reservation incorrect'; end if; if (select total from app.orders where operation_id='00000000-0000-0000-0000-000000000001') <> 200 then raise exception 'server total incorrect'; end if; if (select count(*) from app.order_items where order_id=(select id from app.orders where operation_id='00000000-0000-0000-0000-000000000001')) <> 1 then raise exception 'order item missing'; end if; if (select count(*) from app.audit_events where event_type='order.created') <> 1 then raise exception 'audit missing'; end if; if (select count(*) from app.outbox_events where event_type='order.created.v1') <> 1 then raise exception 'outbox missing'; end if; end $$;
set role authenticated;
set request.jwt.claim.sub='00000000-0000-0000-0000-0000000000aa';
set request.jwt.claim.org_id='00000000-0000-0000-0000-0000000000a1';
set request.jwt.claim.customer_id='00000000-0000-0000-0000-0000000000ca';
do $$ begin begin perform app.transition_order_status((select id from app.orders where operation_id='00000000-0000-0000-0000-000000000001'),'confirmed'); raise exception 'unauthorized transition accepted'; exception when insufficient_privilege then null; end; end $$;
select * from app.create_order('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000fa',2,'00000000-0000-0000-0000-0000000000a3');
reset role;
do $$ begin if (select count(*) from app.orders where operation_id='00000000-0000-0000-0000-000000000001') <> 1 then raise exception 'idempotency duplicated order'; end if; end $$;
set role authenticated;
set request.jwt.claim.sub='00000000-0000-0000-0000-0000000000aa';
set request.jwt.claim.org_id='00000000-0000-0000-0000-0000000000a1';
set request.jwt.claim.customer_id='00000000-0000-0000-0000-0000000000ca';
do $$ begin begin perform app.create_order('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000fa',1,'00000000-0000-0000-0000-0000000000a3'); raise exception 'payload tampering was accepted'; exception when unique_violation then null; end; end $$;
select app.transition_order_status((select id from app.orders where operation_id='00000000-0000-0000-0000-000000000001'),'cancelled');
reset role;
do $$ begin if (select quantity from app.inventory_balances where warehouse_id='00000000-0000-0000-0000-0000000000a3' and product_id='00000000-0000-0000-0000-0000000000fa') <> 3 then raise exception 'reservation release incorrect'; end if; if (select count(*) from app.inventory_movements where movement_type='release') <> 1 then raise exception 'release movement missing'; end if; end $$;

-- Capture the event id with owner privileges before switching to the worker role.
select id as outbox_event_id from app.outbox_events order by created_at limit 1;\gset
set role authenticated;
set request.jwt.claim.sub='00000000-0000-0000-0000-0000000000cc';
set request.jwt.claim.org_id='00000000-0000-0000-0000-0000000000a1';
set request.jwt.claim.customer_id='';
select count(*) from app.claim_outbox_batch(10);
select app.mark_outbox_delivered(:'outbox_event_id');
reset role;
do $$ begin if (select count(*) from app.outbox_events where published_at is not null) <> 1 then raise exception 'outbox delivery acknowledgement failed'; end if; end $$;

set role authenticated;
set request.jwt.claim.sub='00000000-0000-0000-0000-0000000000aa';
set request.jwt.claim.org_id='00000000-0000-0000-0000-0000000000a1';
set request.jwt.claim.customer_id='00000000-0000-0000-0000-0000000000ca';
select * from app.create_order('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-0000000000fa',3,'00000000-0000-0000-0000-0000000000a3');
do $$ begin begin perform app.create_order('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-0000000000fa',1,'00000000-0000-0000-0000-0000000000a3'); raise exception 'oversell accepted'; exception when sqlstate 'P0001' then null; end; end $$;
reset role;
do $$ begin if (select count(*) from app.orders where operation_id='00000000-0000-0000-0000-000000000003') <> 0 then raise exception 'failed order partially committed'; end if; if (select quantity from app.inventory_balances where warehouse_id='00000000-0000-0000-0000-0000000000a3' and product_id='00000000-0000-0000-0000-0000000000fa') <> 0 then raise exception 'failed order changed inventory'; end if; end $$;
select 'R1 FOUNDATION + ORDER + SECURITY + OUTBOX PROOF PASS' as result;

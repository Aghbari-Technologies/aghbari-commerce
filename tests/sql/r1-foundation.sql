\set ON_ERROR_STOP on
create role authenticated login;
\i supabase/migrations/0001_core_foundation.sql
\i supabase/migrations/0002_auth_scope_hardening.sql

insert into app.organizations(id,name) values ('00000000-0000-0000-0000-0000000000a1','Tenant A'),('00000000-0000-0000-0000-0000000000b1','Tenant B');
insert into app.roles(id,code) values('00000000-0000-0000-0000-000000000001','customer');
insert into app.users(id,display_name) values('00000000-0000-0000-0000-0000000000aa','User A'),('00000000-0000-0000-0000-0000000000bb','User B');
insert into app.user_roles(user_id,organization_id,role_id) values('00000000-0000-0000-0000-0000000000aa','00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-0000000000bb','00000000-0000-0000-0000-0000000000b1','00000000-0000-0000-0000-000000000001');
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
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000aa';
set request.jwt.claim.org_id = '00000000-0000-0000-0000-0000000000a1';
set request.jwt.claim.customer_id = '00000000-0000-0000-0000-0000000000ca';

-- Tenant isolation: B is invisible to A even with a guessed identifier.
do $$ begin if (select count(*) from app.products where id='00000000-0000-0000-0000-0000000000fb') <> 0 then raise exception 'cross-tenant product leak'; end if; end $$;
-- Authorized price is Tier 1 only.
do $$ begin if (select unit_price from app.resolve_price('00000000-0000-0000-0000-0000000000fa')) <> 100 then raise exception 'wrong authorized price'; end if; end $$;

select * from app.create_order('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000fa',2,'00000000-0000-0000-0000-0000000000a3');
do $$ begin
  if (select quantity from app.inventory_balances where warehouse_id='00000000-0000-0000-0000-0000000000a3' and product_id='00000000-0000-0000-0000-0000000000fa') <> 1 then raise exception 'inventory mutation incorrect'; end if;
  if (select total from app.orders where operation_id='00000000-0000-0000-0000-000000000001') <> 200 then raise exception 'server total incorrect'; end if;
  if (select count(*) from app.order_items where order_id=(select id from app.orders where operation_id='00000000-0000-0000-0000-000000000001')) <> 1 then raise exception 'order item missing'; end if;
  if (select count(*) from app.audit_events where event_type='order.created') <> 1 then raise exception 'audit missing'; end if;
  if (select count(*) from app.outbox_events where event_type='order.created.v1') <> 1 then raise exception 'outbox missing'; end if;
end $$;

-- Exact replay is one business effect.
select * from app.create_order('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000fa',2,'00000000-0000-0000-0000-0000000000a3');
do $$ begin if (select count(*) from app.orders where operation_id='00000000-0000-0000-0000-000000000001') <> 1 then raise exception 'idempotency duplicated order'; end if; end $$;

-- Same operation key with different payload must be rejected.
do $$ begin
  begin perform app.create_order('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000fa',1,'00000000-0000-0000-0000-0000000000a3'); raise exception 'payload tampering was accepted';
  exception when unique_violation then null; end;
end $$;

-- Insufficient inventory must not partially create an order.
do $$ begin
  begin perform app.create_order('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-0000000000fa',2,'00000000-0000-0000-0000-0000000000a3'); raise exception 'oversell accepted';
  exception when sqlstate 'P0001' then null; end;
  if (select count(*) from app.orders where operation_id='00000000-0000-0000-0000-000000000002') <> 0 then raise exception 'failed order partially committed'; end if;
  if (select quantity from app.inventory_balances where warehouse_id='00000000-0000-0000-0000-0000000000a3' and product_id='00000000-0000-0000-0000-0000000000fa') <> 1 then raise exception 'failed order changed inventory'; end if;
end $$;

reset role;
select 'R1 FOUNDATION PROOF PASS' as result;

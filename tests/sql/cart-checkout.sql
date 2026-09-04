\set ON_ERROR_STOP on
create role authenticated login;
\i supabase/migrations/0001_core_foundation.sql
\i supabase/migrations/0002_auth_scope_hardening.sql
\i supabase/migrations/0003_order_state_machine.sql
\i supabase/migrations/0004_import_media_reliability.sql
\i supabase/migrations/0005_outbox_delivery.sql
\i supabase/migrations/0006_customer_catalog_boundary.sql
\i supabase/migrations/0007_cart_checkout.sql
insert into app.organizations(id,name) values('10000000-0000-0000-0000-000000000001','Tenant A');
insert into app.roles(id,code) values('10000000-0000-0000-0000-000000000001','customer');
insert into app.users(id,display_name) values('10000000-0000-0000-0000-000000000001','Customer User');
insert into app.user_roles(user_id,organization_id,role_id) values('10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001');
insert into app.branches(id,organization_id,name) values('10000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Main');
insert into app.warehouses(id,organization_id,branch_id,name) values('10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','Main WH');
insert into app.customer_tiers(id,organization_id,code,name) values('10000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','tier1','Tier 1');
insert into app.customers(id,organization_id,name,customer_tier_id) values('10000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001','Customer','10000000-0000-0000-0000-000000000004');
insert into app.customer_users(organization_id,customer_id,user_id) values('10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001');
insert into app.products(id,organization_id,sku,name,unit) values('10000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000001','A-1','Product A','box'),('10000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000001','A-2','Product B','box');
insert into app.price_lists(id,organization_id,customer_tier_id,code,currency) values('10000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000004','T1','YER');
insert into app.product_prices(organization_id,price_list_id,product_id,unit_price) values('10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000006',100),('10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000007',50);
insert into app.inventory_balances(organization_id,warehouse_id,product_id,quantity) values('10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000006',3),('10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000007',4);
set role authenticated;
set request.jwt.claim.sub='10000000-0000-0000-0000-000000000001';
set request.jwt.claim.org_id='10000000-0000-0000-0000-000000000001';
set request.jwt.claim.customer_id='10000000-0000-0000-0000-000000000005';
select * from app.create_order_from_cart('10000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000003','[{"product_id":"10000000-0000-0000-0000-000000000006","quantity":2},{"product_id":"10000000-0000-0000-0000-000000000007","quantity":3}]'::jsonb);
do $$ begin
  if (select total from app.orders where operation_id='10000000-0000-0000-0000-000000000009') <> 350 then raise exception 'multi-line total incorrect'; end if;
  if (select count(*) from app.order_items where order_id=(select id from app.orders where operation_id='10000000-0000-0000-0000-000000000009')) <> 2 then raise exception 'multi-line items incorrect'; end if;
  if (select quantity from app.inventory_balances where product_id='10000000-0000-0000-0000-000000000006') <> 1 then raise exception 'product A stock incorrect'; end if;
  if (select quantity from app.inventory_balances where product_id='10000000-0000-0000-0000-000000000007') <> 1 then raise exception 'product B stock incorrect'; end if;
end $$;
-- Duplicate product lines are rejected before mutation.
do $$ begin
  begin perform app.create_order_from_cart('10000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000003','[{"product_id":"10000000-0000-0000-0000-000000000006","quantity":1},{"product_id":"10000000-0000-0000-0000-000000000006","quantity":1}]'::jsonb); raise exception 'duplicate line accepted';
  exception when unique_violation then null; end;
  if (select count(*) from app.orders where operation_id='10000000-0000-0000-0000-000000000010') <> 0 then raise exception 'duplicate cart mutated order'; end if;
end $$;
reset role;
select 'MULTI-LINE CHECKOUT PROOF PASS' as result;

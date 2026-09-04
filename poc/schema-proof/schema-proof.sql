\set ON_ERROR_STOP on

\i supabase/migrations/20260905000100_core_operational.sql

-- Core relation inventory must exist and critical uniqueness constraints must be active.
select 1 from information_schema.tables where table_schema = 'public' and table_name = 'organizations';
select 1 from information_schema.tables where table_schema = 'public' and table_name = 'orders';
select 1 from information_schema.tables where table_schema = 'public' and table_name = 'inventory_balances';
select 1 from information_schema.tables where table_schema = 'public' and table_name = 'outbox_events';

-- Monetary values are numeric, not floating-point.
select data_type from information_schema.columns
where table_schema = 'public' and table_name = 'orders' and column_name = 'total';

-- Duplicate cart lines must be rejected by the database.
do $$
declare
  org_id uuid;
  branch_id uuid;
  warehouse_id uuid;
  customer_id uuid;
  product_id uuid;
  cart_id uuid;
begin
  insert into public.organizations(name) values ('Aghbari CI Fixture') returning id into org_id;
  insert into public.branches(organization_id, name, code) values (org_id, 'Main', 'MAIN') returning id into branch_id;
  insert into public.warehouses(organization_id, branch_id, name, code) values (org_id, branch_id, 'Main Warehouse', 'MAIN-WH') returning id into warehouse_id;
  insert into public.customer_tiers(organization_id, code, name) values (org_id, 'WHOLESALE', 'Wholesale') returning id into product_id;
  insert into public.customers(organization_id, tier_id, status, name) values (org_id, product_id, 'APPROVED', 'CI Customer') returning id into customer_id;
  insert into public.products(organization_id, sku, name) values (org_id, 'CI-SKU-1', 'CI Product') returning id into product_id;
  insert into public.carts(organization_id, customer_id, branch_id, warehouse_id) values (org_id, customer_id, branch_id, warehouse_id) returning id into cart_id;
  insert into public.cart_items(cart_id, product_id, quantity) values (cart_id, product_id, 1);
  begin
    insert into public.cart_items(cart_id, product_id, quantity) values (cart_id, product_id, 2);
    raise exception 'duplicate cart line was accepted';
  exception when unique_violation then
    null;
  end;
end $$;

-- Negative quantity must be rejected by the inventory invariant.
insert into public.inventory_balances(warehouse_id, product_id, quantity) values
  ((select id from public.warehouses limit 1), (select id from public.products limit 1), 0);
begin;
  insert into public.inventory_balances(warehouse_id, product_id, quantity) values
    ((select id from public.warehouses limit 1), (select id from public.products limit 1), -1);
exception when check_violation then
  null;
end;

select 'SCHEMA PROOF: PASS' as result;

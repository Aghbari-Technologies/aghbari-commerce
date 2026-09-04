\set ON_ERROR_STOP on

\i supabase/migrations/20260905000100_core_operational.sql
\i supabase/migrations/20260905000200_create_order_transaction.sql
\i supabase/migrations/20260905000300_harden_order_idempotency.sql
\i supabase/migrations/20260905000400_enforce_scope_integrity.sql

DO $$
declare
  org_id uuid;
  branch_id uuid;
  warehouse_id uuid;
  tier_id uuid;
  price_list_id uuid;
  customer_id uuid;
  product_id uuid;
  operation_id uuid := gen_random_uuid();
  result record;
  replay record;
begin
  insert into public.organizations(name) values ('Aghbari Order CI') returning id into org_id;
  insert into public.branches(organization_id, name, code) values (org_id, 'Main', 'MAIN') returning id into branch_id;
  insert into public.warehouses(organization_id, branch_id, name, code) values (org_id, branch_id, 'Main Warehouse', 'MAIN-WH') returning id into warehouse_id;
  insert into public.customer_tiers(organization_id, code, name) values (org_id, 'WHOLESALE', 'Wholesale') returning id into tier_id;
  insert into public.price_lists(organization_id, tier_id, code, name) values (org_id, tier_id, 'WHOLESALE', 'Wholesale Prices') returning id into price_list_id;
  insert into public.customers(organization_id, tier_id, status, name) values (org_id, tier_id, 'APPROVED', 'CI Customer') returning id into customer_id;
  insert into public.products(organization_id, sku, name) values (org_id, 'CI-ORDER-1', 'CI Product') returning id into product_id;
  insert into public.product_prices(organization_id, price_list_id, product_id, unit_price, effective_from)
    values (org_id, price_list_id, product_id, 25.00, now() - interval '1 day');
  insert into public.inventory_balances(organization_id, warehouse_id, product_id, quantity)
    values (org_id, warehouse_id, product_id, 3);

  select * into result from public.create_order_transaction(
    operation_id, customer_id, branch_id, warehouse_id,
    jsonb_build_array(jsonb_build_object('product_id', product_id, 'quantity', 2)),
    999.00
  );

  if result.total <> 50.00 or result.status <> 'NEW' or result.replayed then
    raise exception 'canonical order result mismatch';
  end if;

  if (select ib.quantity from public.inventory_balances ib
      where ib.warehouse_id = warehouse_id and ib.product_id = product_id) <> 1 then
    raise exception 'inventory was not decremented atomically';
  end if;
  if (select count(*) from public.order_items where order_id = result.order_id) <> 1 then
    raise exception 'order item was not persisted';
  end if;
  if (select count(*) from public.outbox_events where aggregate_id = result.order_id) <> 1 then
    raise exception 'outbox event was not persisted';
  end if;
  if (select count(*) from public.inventory_movements where source_id = result.order_id::text) <> 1 then
    raise exception 'inventory movement was not persisted';
  end if;
  if (select count(*) from public.audit_events where target_id = result.order_id) <> 1 then
    raise exception 'audit event was not persisted';
  end if;

  -- Same operation/payload returns the original result and does not consume more stock.
  select * into replay from public.create_order_transaction(
    operation_id, customer_id, branch_id, warehouse_id,
    jsonb_build_array(jsonb_build_object('product_id', product_id, 'quantity', 2)),
    1.00
  );
  if not replay.replayed or replay.order_id <> result.order_id then
    raise exception 'idempotent replay did not return original order';
  end if;

  -- Same operation with a changed payload must be rejected.
  begin
    perform public.create_order_transaction(
      operation_id, customer_id, branch_id, warehouse_id,
      jsonb_build_array(jsonb_build_object('product_id', product_id, 'quantity', 1)),
      null
    );
    raise exception 'idempotency payload conflict was accepted';
  exception when unique_violation then
    null;
  end;

  if (select ib.quantity from public.inventory_balances ib
      where ib.warehouse_id = warehouse_id and ib.product_id = product_id) <> 1 then
    raise exception 'replay mutated inventory';
  end if;
end $$;

select 'ORDER TRANSACTION PROOF: PASS' as result;

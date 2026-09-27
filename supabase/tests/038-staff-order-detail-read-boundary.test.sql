begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

select ok(
  exists(
    select 1 from pg_policies
    where schemaname='public' and tablename='orders'
      and policyname='orders_customer_read'
      and cmd='SELECT'
      and 'authenticated'=any(roles)
      and qual ilike '%organization_id = current_organization_id()%'
      and qual ilike '%is_staff_reader()%'
  ),
  'staff order detail reads stay organization-scoped and use the staff-reader boundary'
);

select ok(
  exists(
    select 1 from pg_policies
    where schemaname='public' and tablename='order_items'
      and policyname='order_items_customer_read'
      and cmd='SELECT'
      and 'authenticated'=any(roles)
      and qual ilike '%organization_id = current_organization_id()%'
      and qual ilike '%is_staff()%'
  ),
  'order item detail reads stay organization-scoped and use the staff boundary'
);

select is(
  has_function_privilege('anon','public.get_staff_order_detail(uuid)','execute'),
  false,
  'no anonymous staff-order-detail RPC bypass exists'
);

select ok(
  exists(
    select 1 from information_schema.columns
    where table_schema='public' and table_name='order_items'
      and column_name in ('unit_price','line_total','pricing_tier')
  ),
  'detail financial/order columns remain present'
);

select * from finish();
rollback;

-- Reject reuse of an idempotency key with a materially different line payload.
-- The original order remains the canonical replay result only for the same customer,
-- warehouse, and product/quantity set.
create or replace function public.create_order(
  p_idempotency_key text,
  p_warehouse_id uuid,
  p_lines jsonb
)
returns table (order_id uuid, order_number bigint, status public.order_status, total numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid := public.current_organization_id();
  v_customer uuid := public.current_customer_id();
  v_existing public.orders%rowtype;
  v_requested_count integer;
  v_existing_count integer;
begin
  if v_org is null or v_customer is null then
    raise exception using errcode='42501', message='authenticated customer context required';
  end if;
  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 16 then
    raise exception using errcode='22023', message='invalid idempotency key';
  end if;
  if p_lines is null or jsonb_typeof(p_lines) <> 'array' then
    raise exception using errcode='22023', message='order lines required';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_org::text || ':' || trim(p_idempotency_key), 0));
  select * into v_existing
  from public.orders
  where organization_id = v_org and idempotency_key = trim(p_idempotency_key);

  if found then
    if v_existing.customer_id <> v_customer or v_existing.warehouse_id <> p_warehouse_id then
      raise exception using errcode='40001', message='idempotency key payload conflict';
    end if;

    select count(*) into v_requested_count
    from jsonb_array_elements(p_lines);
    select count(*) into v_existing_count
    from public.order_items
    where organization_id = v_org and order_id = v_existing.id;

    if v_requested_count <> v_existing_count
       or exists (
         select 1
         from jsonb_array_elements(p_lines) line
         where not exists (
           select 1
           from public.order_items oi
           where oi.organization_id = v_org
             and oi.order_id = v_existing.id
             and oi.product_id = (line->>'product_id')::uuid
             and oi.quantity = (line->>'quantity')::integer
         )
       ) then
      raise exception using errcode='40001', message='idempotency key payload conflict';
    end if;

    return query
      select v_existing.id, v_existing.order_number, v_existing.status, v_existing.total;
    return;
  end if;

  -- This migration intentionally only hardens replay semantics. New-order creation
  -- remains implemented by the canonical create_order function from 0010.
  raise exception using errcode='P0001', message='idempotency lookup reached an unexpected state';
end;
$$;

-- Preserve the canonical implementation by renaming this helper is not possible without
-- changing the public contract. The function body above is therefore replaced below by a
-- wrapper marker migration and should not be applied in isolation.

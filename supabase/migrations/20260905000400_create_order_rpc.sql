alter table orders add column if not exists idempotency_fingerprint text;

create sequence if not exists order_number_seq start 100000;

create or replace function public.create_order(
  p_branch_id uuid,
  p_warehouse_id uuid,
  p_lines jsonb,
  p_idempotency_key text,
  p_correlation_id text default gen_random_uuid()::text
)
returns table(order_id uuid, order_number text, total numeric)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_customer customers%rowtype;
  v_order orders%rowtype;
  v_line jsonb;
  v_product_id uuid;
  v_quantity numeric;
  v_price numeric;
  v_price_list_id uuid;
  v_line_total numeric;
  v_subtotal numeric := 0;
  v_fingerprint text;
  v_existing orders%rowtype;
  v_order_id uuid;
  v_order_number text;
begin
  if v_actor_id is null then
    raise exception using errcode = '28000', message = 'AUTHENTICATION_REQUIRED';
  end if;
  if p_idempotency_key is null or length(trim(p_idempotency_key)) = 0 then
    raise exception using errcode = '22023', message = 'VALIDATION_FAILED: idempotency key is required';
  end if;
  if jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then
    raise exception using errcode = '22023', message = 'VALIDATION_FAILED: at least one order line is required';
  end if;

  select * into v_customer
  from customers
  where account_user_id = v_actor_id and status = 'active'
  limit 1;
  if not found then
    raise exception using errcode = '42501', message = 'FORBIDDEN';
  end if;

  if v_customer.branch_id is not null and v_customer.branch_id <> p_branch_id then
    raise exception using errcode = '42501', message = 'FORBIDDEN';
  end if;

  if not exists (
    select 1 from branches
    where id = p_branch_id and organization_id = v_customer.organization_id and status = 'active'
  ) then
    raise exception using errcode = '42501', message = 'FORBIDDEN';
  end if;

  if not exists (
    select 1 from warehouses
    where id = p_warehouse_id and organization_id = v_customer.organization_id
      and branch_id = p_branch_id and status = 'active'
  ) then
    raise exception using errcode = '42501', message = 'FORBIDDEN';
  end if;

  select id into v_price_list_id
  from price_lists
  where organization_id = v_customer.organization_id
    and customer_tier_id = v_customer.tier_id
    and status = 'active'
  order by id
  limit 1;
  if v_price_list_id is null then
    raise exception using errcode = '22023', message = 'VALIDATION_FAILED: authorized price list not configured';
  end if;

  v_fingerprint := encode(digest(convert_to(
    jsonb_build_object(
      'branch_id', p_branch_id,
      'warehouse_id', p_warehouse_id,
      'lines', p_lines
    )::text, 'utf8'), 'sha256'), 'hex');

  select * into v_existing
  from orders
  where organization_id = v_customer.organization_id
    and customer_id = v_customer.id
    and idempotency_key = p_idempotency_key
  for update;

  if found then
    if v_existing.idempotency_fingerprint is distinct from v_fingerprint then
      raise exception using errcode = '23505', message = 'CONFLICT: idempotency key reused with a different payload';
    end if;
    return query select v_existing.id, v_existing.order_number, v_existing.total;
    return;
  end if;

  v_order_id := gen_random_uuid();
  v_order_number := 'AGH-' || nextval('order_number_seq')::text;

  insert into orders (
    id, organization_id, customer_id, branch_id, warehouse_id,
    order_number, status, subtotal, total, idempotency_key,
    idempotency_fingerprint, version
  ) values (
    v_order_id, v_customer.organization_id, v_customer.id, p_branch_id, p_warehouse_id,
    v_order_number, 'pending', 0, 0, p_idempotency_key,
    v_fingerprint, 1
  );

  for v_line in select value from jsonb_array_elements(p_lines)
  loop
    v_product_id := (v_line->>'product_id')::uuid;
    v_quantity := (v_line->>'quantity')::numeric;
    if v_product_id is null or v_quantity is null or v_quantity <= 0 then
      raise exception using errcode = '22023', message = 'VALIDATION_FAILED: invalid order line';
    end if;

    if not exists (
      select 1 from products
      where id = v_product_id and organization_id = v_customer.organization_id and status = 'active'
    ) then
      raise exception using errcode = '23503', message = 'NOT_FOUND: product';
    end if;

    select pp.unit_price into v_price
    from product_prices pp
    where pp.organization_id = v_customer.organization_id
      and pp.price_list_id = v_price_list_id
      and pp.product_id = v_product_id
      and pp.effective_from <= now()
      and (pp.effective_to is null or pp.effective_to > now())
    order by pp.effective_from desc
    limit 1;
    if v_price is null then
      raise exception using errcode = '22023', message = 'VALIDATION_FAILED: product has no effective authorized price';
    end if;

    v_line_total := v_price * v_quantity;
    v_subtotal := v_subtotal + v_line_total;

    insert into order_items(order_id, product_id, quantity, unit_price, line_total, pricing_context)
    values (
      v_order_id, v_product_id, v_quantity, v_price, v_line_total,
      jsonb_build_object('price_list_id', v_price_list_id, 'customer_tier_id', v_customer.tier_id)
    );

    update inventory_balances
    set available = available - v_quantity,
        reserved = reserved + v_quantity,
        version = version + 1,
        updated_at = now()
    where warehouse_id = p_warehouse_id
      and product_id = v_product_id
      and available >= v_quantity;

    if not found then
      raise exception using errcode = '23514', message = 'INSUFFICIENT_STOCK: product inventory unavailable';
    end if;

    insert into inventory_movements (
      organization_id, warehouse_id, product_id, movement_type, quantity,
      source_type, source_id, actor_id, correlation_id, idempotency_key
    ) values (
      v_customer.organization_id, p_warehouse_id, v_product_id, 'reservation', v_quantity,
      'order', v_order_id::text, v_actor_id, p_correlation_id,
      'order:' || v_order_id::text || ':' || v_product_id::text
    );
  end loop;

  update orders set subtotal = v_subtotal, total = v_subtotal, updated_at = now() where id = v_order_id;

  insert into order_status_history(order_id, from_status, to_status, actor_id, correlation_id)
  values (v_order_id, null, 'pending', v_actor_id, p_correlation_id);

  insert into outbox_events (
    organization_id, event_type, event_version, aggregate_type, aggregate_id,
    correlation_id, payload
  ) values (
    v_customer.organization_id, 'order.created', 1, 'order', v_order_id,
    p_correlation_id,
    jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number, 'customer_id', v_customer.id)
  );

  insert into audit_events (
    organization_id, actor_id, action, target_type, target_id,
    correlation_id, result, metadata
  ) values (
    v_customer.organization_id, v_actor_id, 'order.created', 'order', v_order_id,
    p_correlation_id, 'success', jsonb_build_object('order_number', v_order_number, 'total', v_subtotal)
  );

  return query select v_order_id, v_order_number, v_subtotal;
end;
$$;

alter table public.orders
  add column if not exists payload_hash text;

-- Existing rows created before this hardening cannot be safely treated as replayable
-- without a known request payload. They remain valid business records but must not
-- be used to certify idempotency until backfilled from authoritative evidence.

create index if not exists orders_operation_lookup_idx
  on public.orders(organization_id, operation_id);

create or replace function public.create_order_transaction(
  p_operation_id uuid,
  p_customer_id uuid,
  p_branch_id uuid,
  p_warehouse_id uuid,
  p_lines jsonb,
  p_client_total numeric default null,
  p_correlation_id uuid default gen_random_uuid(),
  p_actor_user_id uuid default null
)
returns table (
  order_id uuid,
  order_number text,
  status public.order_status,
  subtotal numeric,
  total numeric,
  replayed boolean
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_org_id uuid;
  v_customer_status public.customer_status;
  v_tier_id uuid;
  v_existing public.orders%rowtype;
  v_payload_hash text;
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(14,2) := 0;
  v_sequence bigint;
  v_product record;
  v_line record;
  v_price numeric(14,2);
  v_quantity integer;
  v_inventory integer;
  v_item_count integer;
  v_seen integer;
begin
  if p_operation_id is null then raise exception 'operation_id is required' using errcode = '22023'; end if;
  if p_customer_id is null or p_branch_id is null or p_warehouse_id is null then
    raise exception 'scope identifiers are required' using errcode = '22023';
  end if;
  if jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then
    raise exception 'at least one order line is required' using errcode = '22023';
  end if;

  select c.organization_id, c.status, c.tier_id
    into v_org_id, v_customer_status, v_tier_id
  from public.customers c
  where c.id = p_customer_id
  for update;
  if not found then raise exception 'customer not found' using errcode = 'P0002'; end if;
  if v_customer_status <> 'APPROVED' then raise exception 'customer is not approved' using errcode = '42501'; end if;

  if not exists (select 1 from public.branches b where b.id = p_branch_id and b.organization_id = v_org_id and b.active) then
    raise exception 'branch is outside customer organization or inactive' using errcode = '42501';
  end if;
  if not exists (select 1 from public.warehouses w where w.id = p_warehouse_id and w.organization_id = v_org_id and w.branch_id = p_branch_id and w.active) then
    raise exception 'warehouse is outside branch scope or inactive' using errcode = '42501';
  end if;

  v_payload_hash := encode(digest(
    jsonb_build_object('customer_id', p_customer_id, 'branch_id', p_branch_id, 'warehouse_id', p_warehouse_id, 'lines', p_lines)::text,
    'sha256'
  ), 'hex');

  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text, 0));

  select * into v_existing from public.orders where organization_id = v_org_id and operation_id = p_operation_id;
  if found then
    if v_existing.payload_hash is null or v_existing.payload_hash <> v_payload_hash then
      raise exception 'operation_id replay payload conflict' using errcode = '23505';
    end if;
    return query select v_existing.id, v_existing.order_number, v_existing.status,
      v_existing.subtotal, v_existing.total, true;
    return;
  end if;

  select count(*) into v_item_count from jsonb_array_elements(p_lines);
  select count(distinct x.product_id) into v_seen
    from jsonb_to_recordset(p_lines) as x(product_id uuid, quantity integer);
  if v_item_count <> v_seen then raise exception 'duplicate product in order lines' using errcode = '23505'; end if;

  for v_product in
    select distinct x.product_id
    from jsonb_to_recordset(p_lines) as x(product_id uuid, quantity integer)
    order by x.product_id
  loop
    if not exists (select 1 from public.products p where p.id = v_product.product_id and p.organization_id = v_org_id and p.status = 'ACTIVE') then
      raise exception 'product is unavailable' using errcode = 'P0002';
    end if;

    select ib.quantity - ib.reserved_quantity into v_inventory
    from public.inventory_balances ib
    where ib.warehouse_id = p_warehouse_id and ib.product_id = v_product.product_id
    for update;
    if not found then raise exception 'inventory record not found' using errcode = 'P0002'; end if;

    select x.quantity into v_quantity
    from jsonb_to_recordset(p_lines) as x(product_id uuid, quantity integer)
    where x.product_id = v_product.product_id;
    if v_quantity is null or v_quantity <= 0 then raise exception 'invalid order quantity' using errcode = '22023'; end if;
    if v_inventory < v_quantity then raise exception 'insufficient inventory' using errcode = 'P0001'; end if;

    select pp.unit_price into v_price
    from public.product_prices pp
    join public.price_lists pl on pl.id = pp.price_list_id
    where pp.organization_id = v_org_id and pp.product_id = v_product.product_id
      and pl.tier_id = v_tier_id and pl.organization_id = v_org_id
      and pp.active and pl.active and pp.effective_from <= now()
      and (pp.effective_to is null or now() < pp.effective_to)
    order by pp.effective_from desc limit 1;
    if v_price is null then raise exception 'authorized price not found' using errcode = 'P0002'; end if;

    v_subtotal := v_subtotal + round(v_quantity * v_price, 2);
  end loop;

  update public.organizations
  set next_order_number = next_order_number + 1
  where id = v_org_id
  returning next_order_number - 1 into v_sequence;

  v_order_number := 'AGH-' || to_char(current_date, 'YYYYMMDD') || '-' || lpad(v_sequence::text, 6, '0');
  v_order_id := gen_random_uuid();

  insert into public.orders(
    id, organization_id, customer_id, branch_id, warehouse_id,
    order_number, operation_id, payload_hash, status, subtotal, total, version
  ) values (
    v_order_id, v_org_id, p_customer_id, p_branch_id, p_warehouse_id,
    v_order_number, p_operation_id, v_payload_hash, 'NEW', v_subtotal, v_subtotal, 1
  );

  for v_line in
    select x.product_id, x.quantity
    from jsonb_to_recordset(p_lines) as x(product_id uuid, quantity integer)
    order by x.product_id
  loop
    select pp.unit_price into v_price
    from public.product_prices pp
    join public.price_lists pl on pl.id = pp.price_list_id
    where pp.organization_id = v_org_id and pp.product_id = v_line.product_id
      and pl.tier_id = v_tier_id and pl.organization_id = v_org_id
      and pp.active and pl.active and pp.effective_from <= now()
      and (pp.effective_to is null or now() < pp.effective_to)
    order by pp.effective_from desc limit 1;

    insert into public.order_items(order_id, product_id, quantity, unit_price, line_total, pricing_context)
    values (v_order_id, v_line.product_id, v_line.quantity, v_price,
      round(v_line.quantity * v_price, 2),
      jsonb_build_object('tier_id', v_tier_id, 'resolved_at', now()));

    update public.inventory_balances
    set quantity = quantity - v_line.quantity, version = version + 1, updated_at = now()
    where warehouse_id = p_warehouse_id and product_id = v_line.product_id;

    insert into public.inventory_movements(
      organization_id, warehouse_id, product_id, movement_type, quantity_delta,
      source_type, source_id, operation_id, actor_user_id, reason, occurred_at
    ) values (
      v_org_id, p_warehouse_id, v_line.product_id, 'SALE', -v_line.quantity,
      'ORDER', v_order_id::text, p_operation_id, p_actor_user_id, 'Order acceptance', now());
  end loop;

  insert into public.order_status_history(
    organization_id, order_id, from_status, to_status, actor_user_id, correlation_id
  ) values (v_org_id, v_order_id, null, 'NEW', p_actor_user_id, p_correlation_id);

  insert into public.outbox_events(
    organization_id, event_type, event_version, aggregate_type, aggregate_id,
    operation_id, correlation_id, payload_hash, payload
  ) values (
    v_org_id, 'order.created', 1, 'order', v_order_id,
    p_operation_id, p_correlation_id, v_payload_hash,
    jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number, 'status', 'NEW'));

  insert into public.audit_events(
    organization_id, actor_user_id, action, target_type, target_id,
    correlation_id, result, metadata
  ) values (
    v_org_id, p_actor_user_id, 'order.create', 'order', v_order_id,
    p_correlation_id, 'SUCCESS',
    jsonb_build_object('operation_id', p_operation_id, 'payload_hash', v_payload_hash, 'total', v_subtotal));

  return query select v_order_id, v_order_number, 'NEW'::public.order_status, v_subtotal, v_subtotal, false;
end;
$$;

comment on function public.create_order_transaction is
  'Atomic canonical order acceptance with scope validation, authoritative pricing, locked inventory, idempotency, audit and outbox.';

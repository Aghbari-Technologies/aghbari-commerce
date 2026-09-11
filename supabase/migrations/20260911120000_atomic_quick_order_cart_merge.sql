-- Server-authoritative Excel/quick-order commit.
-- Parsing stays in the browser; business mutation is atomic in PostgreSQL.

create or replace function public.apply_quick_order(
  p_idempotency_key text,
  p_lines jsonb
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_org uuid := public.current_organization_id();
  v_customer uuid := public.current_customer_id();
  v_cart uuid;
  v_existing public.operation_idempotency%rowtype;
  v_line jsonb;
  v_product uuid;
  v_qty integer;
  v_existing_qty integer;
  v_price numeric(18,2);
  v_tier public.customer_tier;
  v_currency text;
  v_subtotal numeric(18,2) := 0;
  v_key text := trim(coalesce(p_idempotency_key,''));
  v_hash text := md5(coalesce(p_lines,'null')::text);
  v_count integer;
begin
  if v_org is null or v_customer is null then
    raise exception using errcode='42501', message='authenticated customer context required';
  end if;
  if length(v_key) < 16 or length(v_key) > 200 then
    raise exception using errcode='22023', message='invalid idempotency key';
  end if;
  if p_lines is null or jsonb_typeof(p_lines) <> 'array' then
    raise exception using errcode='22023', message='order lines required';
  end if;
  v_count := jsonb_array_length(p_lines);
  if v_count < 1 or v_count > 100 then
    raise exception using errcode='22023', message='quick order must contain between 1 and 100 lines';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_org::text || ':quick-order:' || v_key, 0));

  select * into v_existing
    from public.operation_idempotency
   where organization_id=v_org
     and idempotency_key=v_key
     and operation_type='quick_order_cart_merge'
   for update;

  if found then
    if v_existing.request_hash <> v_hash then
      raise exception using errcode='40001', message='idempotency key payload conflict';
    end if;
    if v_existing.status='completed' and v_existing.response_reference is not null then
      return v_existing.response_reference;
    end if;
    if v_existing.expires_at <= now() then
      delete from public.operation_idempotency where id=v_existing.id;
    else
      raise exception using errcode='40001', message='quick order operation is already processing';
    end if;
  end if;

  select c.tier into v_tier
    from public.customers c
   where c.id=v_customer and c.organization_id=v_org and c.is_active;
  if v_tier is null then
    raise exception using errcode='42501', message='active customer required';
  end if;

  v_cart := public.get_or_create_cart();

  insert into public.operation_idempotency(
    organization_id,idempotency_key,request_hash,operation_type,status,expires_at
  ) values (
    v_org,v_key,v_hash,'quick_order_cart_merge','processing',now()+interval '24 hours'
  );

  for v_line in select value from jsonb_array_elements(p_lines) loop
    if nullif(trim(v_line->>'product_id'),'') is null then
      raise exception using errcode='22023', message='product_id required';
    end if;
    begin
      v_product := (v_line->>'product_id')::uuid;
    exception when invalid_text_representation then
      raise exception using errcode='22023', message='invalid product_id';
    end;
    if v_line->>'quantity' is null or v_line->>'quantity' !~ '^[0-9]+$' then
      raise exception using errcode='22023', message='invalid quantity';
    end if;
    v_qty := (v_line->>'quantity')::integer;
    if v_qty < 1 or v_qty > 10000 then
      raise exception using errcode='22023', message='quantity must be between 1 and 10000';
    end if;
  end loop;

  if exists (
    select 1
      from (select value->>'product_id' as product_id from jsonb_array_elements(p_lines)) lines
     group by product_id
    having count(*) > 1
  ) then
    raise exception using errcode='22023', message='duplicate product line';
  end if;

  for v_line in select value from jsonb_array_elements(p_lines) order by value->>'product_id' loop
    v_product := (v_line->>'product_id')::uuid;
    v_qty := (v_line->>'quantity')::integer;

    if not exists (
      select 1 from public.products p
       where p.id=v_product and p.organization_id=v_org and p.status='active'
    ) then
      raise exception using errcode='P0001', message='product unavailable';
    end if;

    select pp.amount, pl.currency into v_price, v_currency
      from public.product_prices pp
      join public.price_lists pl on pl.id=pp.price_list_id
     where pp.organization_id=v_org
       and pp.product_id=v_product
       and pl.organization_id=v_org
       and pl.tier=v_tier
       and pl.is_active
       and pp.valid_from <= now()
       and (pp.valid_to is null or pp.valid_to > now())
     order by pp.valid_from desc
     limit 1;
    if v_price is null then
      raise exception using errcode='P0001', message='authorized price unavailable';
    end if;

    select ib.quantity into v_existing_qty
      from public.inventory_balances ib
     where ib.organization_id=v_org
       and ib.warehouse_id=(select c.warehouse_id from public.carts c where c.id=v_cart)
       and ib.product_id=v_product
     for update;
    if not found or v_existing_qty < v_qty then
      raise exception using errcode='P0001', message='insufficient stock';
    end if;

    select coalesce(ci.quantity,0) into v_existing_qty
      from public.cart_items ci
     where ci.cart_id=v_cart and ci.organization_id=v_org and ci.product_id=v_product
     for update;
    v_existing_qty := coalesce(v_existing_qty,0);
    if v_existing_qty + v_qty > (select ib.quantity from public.inventory_balances ib where ib.organization_id=v_org and ib.warehouse_id=(select c.warehouse_id from public.carts c where c.id=v_cart) and ib.product_id=v_product) then
      raise exception using errcode='P0001', message='cart quantity exceeds current stock';
    end if;
    v_subtotal := v_subtotal + v_price * v_qty;

    insert into public.cart_items(organization_id,cart_id,product_id,quantity)
    values(v_org,v_cart,v_product,v_existing_qty+v_qty)
    on conflict(cart_id,product_id) do update
      set quantity=excluded.quantity, updated_at=now();
  end loop;

  update public.carts set updated_at=now() where id=v_cart and organization_id=v_org;
  update public.operation_idempotency
     set status='completed', response_reference=v_cart
   where organization_id=v_org and idempotency_key=v_key and operation_type='quick_order_cart_merge';
  insert into public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  values(v_org,auth.uid(),'cart.quick_order.import','cart',v_cart,'success',jsonb_build_object('line_count',v_count,'subtotal',v_subtotal,'currency',coalesce(v_currency,'YER'),'idempotency_key',v_key));
  return v_cart;
end;
$$;

revoke execute on function public.apply_quick_order(text,jsonb) from public, anon;
grant execute on function public.apply_quick_order(text,jsonb) to authenticated;
comment on function public.apply_quick_order(text,jsonb) is 'Atomic server-authoritative merge of validated quick-order lines into the current customer cart with idempotency, price/inventory validation, and audit evidence.';

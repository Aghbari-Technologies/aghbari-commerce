-- Atomic server-authoritative application of a saved customer order template.
-- The operation replaces the active cart in one transaction so a bad line cannot leave
-- a partially applied template in the customer's cart.

create or replace function public.apply_order_template(p_template_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid := public.current_organization_id();
  v_customer uuid := public.current_customer_id();
  v_cart uuid;
  v_template public.order_templates%rowtype;
  v_line jsonb;
  v_product uuid;
  v_qty integer;
  v_available integer;
  v_tier public.customer_tier;
  v_price numeric(18,2);
  v_count integer;
begin
  if v_org is null or v_customer is null then
    raise exception using errcode='42501', message='authenticated customer context required';
  end if;
  if p_template_id is null then
    raise exception using errcode='22023', message='template id required';
  end if;

  select * into v_template
    from public.order_templates
   where id=p_template_id and customer_id=v_customer;
  if not found then
    raise exception using errcode='42501', message='order template access denied';
  end if;

  if pg_catalog.jsonb_typeof(v_template.lines) <> 'array' then
    raise exception using errcode='22023', message='template lines must be an array';
  end if;
  v_count := pg_catalog.jsonb_array_length(v_template.lines);
  if v_count < 1 or v_count > 100 then
    raise exception using errcode='22023', message='template must contain between 1 and 100 lines';
  end if;

  select c.tier into v_tier
    from public.customers c
   where c.id=v_customer and c.organization_id=v_org and c.is_active;
  if v_tier is null then
    raise exception using errcode='42501', message='active customer required';
  end if;

  v_cart := public.get_or_create_cart();

  -- Validate every line before mutating the cart. Inventory rows are locked in a
  -- deterministic UUID order to reduce deadlock risk with concurrent order commands.
  for v_line in
    select value from pg_catalog.jsonb_array_elements(v_template.lines)
    order by value->>'productId'
  loop
    if nullif(pg_catalog.btrim(v_line->>'productId'),'') is null then
      raise exception using errcode='22023', message='template product_id required';
    end if;
    begin
      v_product := (v_line->>'productId')::uuid;
    exception when invalid_text_representation then
      raise exception using errcode='22023', message='invalid template product_id';
    end;
    if v_line->>'quantity' is null or v_line->>'quantity' !~ '^[0-9]+$' then
      raise exception using errcode='22023', message='invalid template quantity';
    end if;
    begin
      v_qty := (v_line->>'quantity')::integer;
    exception when numeric_value_out_of_range then
      raise exception using errcode='22023', message='template quantity out of range';
    end;
    if v_qty < 1 or v_qty > 10000 then
      raise exception using errcode='22023', message='template quantity must be between 1 and 10000';
    end if;
    if not exists (select 1 from public.products p where p.id=v_product and p.organization_id=v_org and p.status='active') then
      raise exception using errcode='P0001', message='template product unavailable';
    end if;
    select pp.amount into v_price
      from public.product_prices pp
      join public.price_lists pl on pl.id=pp.price_list_id
     where pp.organization_id=v_org and pp.product_id=v_product
       and pl.organization_id=v_org and pl.tier=v_tier and pl.is_active
       and pp.valid_from<=pg_catalog.now() and (pp.valid_to is null or pp.valid_to>pg_catalog.now())
     order by pp.valid_from desc limit 1;
    if v_price is null then
      raise exception using errcode='P0001', message='authorized price unavailable';
    end if;
    select ib.quantity into v_available
      from public.inventory_balances ib
     where ib.organization_id=v_org and ib.product_id=v_product
     order by ib.updated_at desc
     limit 1
     for update;
    if not found or v_available < v_qty then
      raise exception using errcode='P0001', message='insufficient stock for template';
    end if;
  end loop;

  delete from public.cart_items where organization_id=v_org and cart_id=v_cart;

  for v_line in select value from pg_catalog.jsonb_array_elements(v_template.lines) loop
    v_product := (v_line->>'productId')::uuid;
    v_qty := (v_line->>'quantity')::integer;
    insert into public.cart_items(organization_id,cart_id,product_id,quantity)
    values(v_org,v_cart,v_product,v_qty);
  end loop;

  update public.carts set updated_at=pg_catalog.now() where id=v_cart and organization_id=v_org;
  insert into public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  values(v_org,auth.uid(),'cart.template.apply','cart',v_cart,'success',pg_catalog.jsonb_build_object('template_id',p_template_id,'line_count',v_count));
  return v_cart;
end;
$$;

revoke execute on function public.apply_order_template(uuid) from public, anon;
grant execute on function public.apply_order_template(uuid) to authenticated;
comment on function public.apply_order_template(uuid) is 'Atomically replace the current customer cart from an authorized saved order template after server-side product, price, inventory and ownership validation.';

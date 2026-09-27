-- Canonicalize order-template quantities to the executable cart/order ceiling.
-- Existing rows are intentionally not rewritten; new writes are constrained and legacy oversized templates fail closed at apply time.
begin;

alter table public.order_template_lines
  drop constraint if exists order_template_lines_quantity_10k_check;

alter table public.order_template_lines
  add constraint order_template_lines_quantity_10k_check
  check (quantity between 1 and 10000)
  not valid;

CREATE OR REPLACE FUNCTION public.save_order_template(p_name text, p_lines jsonb, p_branch_label text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_org uuid := public.current_organization_id();
  v_customer uuid := public.current_customer_id();
  v_template uuid;
  v_line jsonb;
  v_product uuid;
  v_qty integer;
begin
  if v_org is null or v_customer is null then
    raise exception using errcode='42501', message='authenticated customer context required';
  end if;

  if not exists (
    select 1
    from public.customers
    where id=v_customer and organization_id=v_org and is_active
  ) then
    raise exception using errcode='42501', message='active customer required';
  end if;

  if p_name is null or char_length(trim(p_name)) not between 1 and 120 then
    raise exception using errcode='22023', message='template name is invalid';
  end if;

  if jsonb_typeof(p_lines)<>'array'
     or jsonb_array_length(p_lines)<1
     or jsonb_array_length(p_lines)>100 then
    raise exception using errcode='22023', message='template lines are invalid';
  end if;

  if (
    select count(*)
    from public.order_templates
    where organization_id=v_org and customer_id=v_customer
  ) >= coalesce((
    select greatest(1,least(coalesce((config->>'maxTemplates')::integer,50),500))
    from public.client_ui_settings
    where organization_id=v_org
  ),50) then
    raise exception using errcode='P0001', message='template limit reached';
  end if;

  -- Validate every requested line before creating the row.
  for v_line in select value from jsonb_array_elements(p_lines) loop
    v_product := nullif(v_line->>'product_id','')::uuid;
    v_qty := (v_line->>'quantity')::integer;

    if v_product is null or v_qty is null or v_qty<1 or v_qty>10000 then
      raise exception using errcode='22023', message='template line is invalid';
    end if;

    if not exists (
      select 1
      from public.products
      where id=v_product and organization_id=v_org
    ) then
      raise exception using errcode='42501', message='template product is outside organization';
    end if;
  end loop;

  -- Satisfy the row-level JSON line-count constraint at INSERT time.
  insert into public.order_templates(
    organization_id,customer_id,name,branch_label,lines
  )
  values(
    v_org,
    v_customer,
    trim(p_name),
    nullif(trim(p_branch_label),''),
    p_lines
  )
  returning id into v_template;

  -- Keep normalized line rows as the authoritative relational representation.
  for v_line in select value from jsonb_array_elements(p_lines) loop
    v_product := (v_line->>'product_id')::uuid;
    v_qty := (v_line->>'quantity')::integer;

    if exists (
      select 1
      from public.order_template_lines
      where template_id=v_template and product_id=v_product
    ) then
      raise exception using errcode='22023', message='duplicate product in template';
    end if;

    insert into public.order_template_lines(
      organization_id,template_id,product_id,quantity
    )
    values(v_org,v_template,v_product,v_qty);
  end loop;

  update public.order_templates
  set lines = (
    select coalesce(
      jsonb_agg(
        jsonb_build_object('product_id',product_id,'quantity',quantity)
        order by created_at
      ),
      '[]'::jsonb
    )
    from public.order_template_lines
    where template_id=v_template
  ),
  updated_at=now()
  where id=v_template;

  return v_template;
end;
$function$


CREATE OR REPLACE FUNCTION public.apply_order_template(p_template_id uuid, p_warehouse_id uuid, p_idempotency_key text)
 RETURNS TABLE(cart_id uuid, applied_lines integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ declare v_org uuid:=public.current_organization_id(); v_customer uuid:=public.current_customer_id(); v_cart uuid; v_existing public.order_template_apply_operations%rowtype; v_hash text; v_template public.order_templates%rowtype; v_line record; v_available numeric; v_tier public.customer_tier; v_count integer:=0; begin if v_org is null or v_customer is null then raise exception using errcode='42501',message='authenticated customer context required'; end if; if p_idempotency_key is null or char_length(trim(p_idempotency_key))>128 or char_length(trim(p_idempotency_key))<1 then raise exception using errcode='22023',message='invalid idempotency key'; end if; select * into v_template from public.order_templates where id=p_template_id and organization_id=v_org and customer_id=v_customer for update; if not found then raise exception using errcode='42501',message='template not found'; end if; if p_warehouse_id is null or not exists(select 1 from public.warehouses where id=p_warehouse_id and organization_id=v_org and is_active) then raise exception using errcode='42501',message='warehouse not available'; end if; select c.tier into v_tier from public.customers c where c.id=v_customer and c.organization_id=v_org and c.is_active; if v_tier is null then raise exception using errcode='42501',message='active customer required'; end if; v_hash:=encode(digest(jsonb_build_object('template_id',p_template_id,'warehouse_id',p_warehouse_id)::text,'sha256'),'hex'); select * into v_existing from public.order_template_apply_operations where organization_id=v_org and customer_id=v_customer and idempotency_key=trim(p_idempotency_key) for update; if found then if v_existing.request_hash<>v_hash or v_existing.template_id<>p_template_id then raise exception using errcode='23505',message='idempotency key already used with different payload'; end if; return query select v_existing.cart_id,(select count(*)::integer from public.order_template_lines where template_id=p_template_id); return; end if; select id into v_cart from public.carts where organization_id=v_org and customer_id=v_customer and status='active' for update; if v_cart is null then insert into public.carts(organization_id,customer_id,status) values(v_org,v_customer,'active') returning id into v_cart; end if; for v_line in select otl.product_id,otl.quantity,p.sku,p.status from public.order_template_lines otl join public.products p on p.id=otl.product_id and p.organization_id=v_org where otl.organization_id=v_org and otl.template_id=p_template_id order by otl.created_at loop if v_line.status<>'active' then raise exception using errcode='P0001',message='template contains unavailable product'; end if; if v_line.quantity>10000 then raise exception using errcode='22023',message='template quantity exceeds 10000'; end if; select coalesce(sum(ib.quantity),0) into v_available from public.inventory_balances ib where ib.organization_id=v_org and ib.warehouse_id=p_warehouse_id and ib.product_id=v_line.product_id; if v_available<v_line.quantity then raise exception using errcode='P0001',message=format('insufficient stock for SKU %s',v_line.sku); end if; if not exists(select 1 from public.product_prices pp join public.price_lists pl on pl.id=pp.price_list_id where pp.organization_id=v_org and pp.product_id=v_line.product_id and pl.organization_id=v_org and pl.tier=v_tier and pl.is_active and pp.valid_from<=now() and (pp.valid_to is null or pp.valid_to>now())) then raise exception using errcode='42501',message=format('no authorized price for SKU %s',v_line.sku); end if; v_count:=v_count+1; end loop; if v_count=0 then raise exception using errcode='22023',message='template has no valid lines'; end if; for v_line in select product_id,quantity from public.order_template_lines where organization_id=v_org and template_id=p_template_id order by created_at loop insert into public.cart_items(organization_id,cart_id,product_id,quantity) values(v_org,v_cart,v_line.product_id,v_line.quantity) on conflict(cart_id,product_id) do update set quantity=excluded.quantity,updated_at=now(); end loop; update public.carts set updated_at=now() where id=v_cart and organization_id=v_org; insert into public.order_template_apply_operations(organization_id,customer_id,template_id,idempotency_key,request_hash,cart_id) values(v_org,v_customer,p_template_id,trim(p_idempotency_key),v_hash,v_cart); insert into public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata) values(v_org,auth.uid(),'order_template.apply','order_template',p_template_id,'success',jsonb_build_object('cart_id',v_cart,'line_count',v_count)); return query select v_cart,v_count; end; $function$


revoke all on function public.save_order_template(text,jsonb,text) from public, anon;
grant execute on function public.save_order_template(text,jsonb,text) to authenticated;

revoke all on function public.apply_order_template(uuid,uuid,text) from public, anon;
grant execute on function public.apply_order_template(uuid,uuid,text) to authenticated;

commit;

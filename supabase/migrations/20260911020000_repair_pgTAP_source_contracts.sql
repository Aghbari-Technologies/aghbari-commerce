-- Candidate repair: fix source-level pgTAP failures discovered by clean replay.
-- This is a forward migration; historical migrations remain immutable.

-- create_order: qualify the products.status column so PL/pgSQL cannot resolve
-- status against a routine variable/record field, and pin the SECURITY DEFINER
-- function to an empty search_path.
create or replace function public.create_order(
  p_idempotency_key text,
  p_warehouse_id uuid,
  p_lines jsonb
)
returns table (order_id uuid, order_number bigint, status public.order_status, total numeric)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid := public.current_organization_id();
  v_customer uuid := public.current_customer_id();
  v_order public.orders%rowtype;
  v_existing public.orders%rowtype;
  v_line jsonb;
  v_product uuid;
  v_qty integer;
  v_price numeric(18,2);
  v_tier public.customer_tier;
  v_currency text;
  v_subtotal numeric(18,2) := 0;
  v_available integer;
  v_line_count integer;
  v_existing_count integer;
  v_requested_key text := trim(coalesce(p_idempotency_key, ''));
begin
  if v_org is null or v_customer is null then
    raise exception using errcode='42501', message='authenticated customer context required';
  end if;
  if length(v_requested_key) < 16 then
    raise exception using errcode='22023', message='invalid idempotency key';
  end if;
  if p_warehouse_id is null then
    raise exception using errcode='22023', message='warehouse required';
  end if;
  if p_lines is null or jsonb_typeof(p_lines) <> 'array' then
    raise exception using errcode='22023', message='order lines required';
  end if;

  v_line_count := jsonb_array_length(p_lines);
  if v_line_count = 0 or v_line_count > 100 then
    raise exception using errcode='22023', message='order must contain between 1 and 100 lines';
  end if;

  select c.tier into v_tier
  from public.customers c
  where c.id = v_customer and c.organization_id = v_org and c.is_active;
  if v_tier is null then
    raise exception using errcode='42501', message='active customer required';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_org::text || ':' || v_requested_key, 0));

  for v_line in select value from jsonb_array_elements(p_lines) loop
    if nullif(trim(v_line->>'product_id'), '') is null then
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
    if v_qty <= 0 or v_qty > 10000 then
      raise exception using errcode='22023', message='invalid quantity';
    end if;
  end loop;

  if exists (
    select 1 from (
      select value->>'product_id' as product_id
      from jsonb_array_elements(p_lines)
    ) lines
    group by product_id
    having count(*) > 1
  ) then
    raise exception using errcode='22023', message='duplicate product line';
  end if;

  select * into v_existing
  from public.orders
  where organization_id = v_org and idempotency_key = v_requested_key;
  if found then
    if v_existing.customer_id <> v_customer or v_existing.warehouse_id <> p_warehouse_id then
      raise exception using errcode='40001', message='idempotency key payload conflict';
    end if;

    select count(*) into v_existing_count
    from public.order_items
    where organization_id = v_org and order_id = v_existing.id;

    if v_existing_count <> v_line_count
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

    return query select v_existing.id, v_existing.order_number, v_existing.status, v_existing.total;
    return;
  end if;

  if not exists (
    select 1 from public.warehouses w
    where w.id = p_warehouse_id and w.organization_id = v_org and w.is_active
  ) then
    raise exception using errcode='42501', message='warehouse not available';
  end if;

  for v_line in
    select value from jsonb_array_elements(p_lines)
    order by value->>'product_id'
  loop
    v_product := (v_line->>'product_id')::uuid;
    v_qty := (v_line->>'quantity')::integer;

    if not exists (
      select 1 from public.products p
      where p.id = v_product and p.organization_id = v_org and p.status = 'active'
    ) then
      raise exception using errcode='P0001', message='product unavailable';
    end if;

    select pp.amount, pl.currency into v_price, v_currency
    from public.product_prices pp
    join public.price_lists pl on pl.id = pp.price_list_id
    where pp.organization_id = v_org
      and pp.product_id = v_product
      and pl.organization_id = v_org
      and pl.tier = v_tier
      and pl.is_active
      and pp.valid_from <= now()
      and (pp.valid_to is null or pp.valid_to > now())
    order by pp.valid_from desc
    limit 1;
    if v_price is null then
      raise exception using errcode='P0001', message='authorized price unavailable';
    end if;

    select ib.quantity into v_available
    from public.inventory_balances ib
    where ib.organization_id = v_org and ib.warehouse_id = p_warehouse_id and ib.product_id = v_product
    for update;
    if not found or v_available < v_qty then
      raise exception using errcode='P0001', message='insufficient stock';
    end if;

    v_subtotal := v_subtotal + (v_price * v_qty);
  end loop;

  insert into public.orders(
    organization_id, customer_id, warehouse_id, status, currency,
    subtotal, total, idempotency_key, created_by
  )
  values(
    v_org, v_customer, p_warehouse_id, 'pending', coalesce(v_currency, 'YER'),
    v_subtotal, v_subtotal, v_requested_key, auth.uid()
  )
  returning * into v_order;

  for v_line in
    select value from jsonb_array_elements(p_lines)
    order by value->>'product_id'
  loop
    v_product := (v_line->>'product_id')::uuid;
    v_qty := (v_line->>'quantity')::integer;

    select pp.amount into v_price
    from public.product_prices pp
    join public.price_lists pl on pl.id = pp.price_list_id
    where pp.organization_id = v_org
      and pp.product_id = v_product
      and pl.organization_id = v_org
      and pl.tier = v_tier
      and pl.is_active
      and pp.valid_from <= now()
      and (pp.valid_to is null or pp.valid_to > now())
    order by pp.valid_from desc
    limit 1;

    update public.inventory_balances ib
    set quantity = ib.quantity - v_qty, updated_at = now()
    where ib.organization_id = v_org
      and ib.warehouse_id = p_warehouse_id
      and ib.product_id = v_product
      and ib.quantity >= v_qty;
    if not found then
      raise exception using errcode='P0001', message='inventory changed; retry order';
    end if;

    insert into public.inventory_movements(
      organization_id, warehouse_id, product_id, delta, source_type, source_id, actor_id
    ) values(v_org, p_warehouse_id, v_product, -v_qty, 'order', v_order.id, auth.uid());

    insert into public.order_items(
      organization_id, order_id, product_id, quantity, unit_price, pricing_tier
    ) values(v_org, v_order.id, v_product, v_qty, v_price, v_tier);
  end loop;

  insert into public.order_status_history(
    organization_id, order_id, from_status, to_status, actor_id
  ) values(v_org, v_order.id, null, 'pending', auth.uid());

  insert into public.outbox_events(
    organization_id, aggregate_type, aggregate_id, event_type, payload
  ) values(
    v_org, 'order', v_order.id, 'order.created',
    jsonb_build_object('order_id', v_order.id, 'order_number', v_order.order_number)
  );

  insert into public.audit_events(
    organization_id, actor_id, action, target_type, target_id, result, metadata
  ) values(
    v_org, auth.uid(), 'order.create', 'order', v_order.id, 'success',
    jsonb_build_object('order_number', v_order.order_number)
  );

  return query select v_order.id, v_order.order_number, v_order.status, v_order.total;
end;
$$;

revoke execute on function public.create_order(text,uuid,jsonb) from anon, public;
grant execute on function public.create_order(text,uuid,jsonb) to authenticated;

-- record_payment: cast enum literals explicitly; otherwise PostgreSQL resolves the
-- CASE expression to text and rejects assignment to invoice_status.
create or replace function public.record_payment(
  p_invoice_id uuid,
  p_amount numeric,
  p_method public.payment_method,
  p_cash_account_id uuid default null,
  p_reference text default null
)
returns public.payments
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid:=public.current_organization_id();
  v_role public.user_role:=public.current_role();
  v_invoice public.operational_invoices%rowtype;
  v_account public.cash_accounts%rowtype;
  v_paid numeric(18,2);
  v_payment public.payments%rowtype;
begin
  if v_org is null or v_role not in ('owner','admin','sales') then raise exception using errcode='42501',message='payment access required'; end if;
  if p_amount is null or p_amount<=0 then raise exception using errcode='22023',message='payment amount must be positive'; end if;
  select * into v_invoice from public.operational_invoices where id=p_invoice_id and organization_id=v_org for update;
  if not found then raise exception using errcode='P0002',message='invoice not found'; end if;
  if v_invoice.status='void' then raise exception using errcode='22023',message='void invoice cannot receive payment'; end if;
  select coalesce(sum(amount),0) into v_paid from public.payments where organization_id=v_org and invoice_id=v_invoice.id;
  if p_amount > v_invoice.total-v_paid then raise exception using errcode='22003',message='payment exceeds invoice balance'; end if;
  if p_method='cash' then
    if p_cash_account_id is null then raise exception using errcode='22023',message='cash account required for cash payment'; end if;
    select * into v_account from public.cash_accounts where id=p_cash_account_id and organization_id=v_org and is_active for update;
    if not found or v_account.currency<>v_invoice.currency then raise exception using errcode='22023',message='cash account mismatch'; end if;
  elsif p_cash_account_id is not null then
    select * into v_account from public.cash_accounts where id=p_cash_account_id and organization_id=v_org and is_active for update;
    if not found or v_account.currency<>v_invoice.currency then raise exception using errcode='22023',message='cash account mismatch'; end if;
  end if;
  insert into public.payments(organization_id,invoice_id,cash_account_id,amount,method,reference,actor_id)
  values(v_org,v_invoice.id,p_cash_account_id,p_amount,p_method,nullif(trim(p_reference),''),auth.uid())
  returning * into v_payment;
  if p_cash_account_id is not null then
    insert into public.cash_transactions(organization_id,cash_account_id,direction,amount,source_type,source_id,note,actor_id)
    values(v_org,p_cash_account_id,'in',p_amount,'payment',v_payment.id,nullif(trim(p_reference),''),auth.uid());
  end if;
  select coalesce(sum(amount),0) into v_paid from public.payments where organization_id=v_org and invoice_id=v_invoice.id;
  update public.operational_invoices
  set status = case when v_paid >= total then 'paid'::public.invoice_status else 'partially_paid'::public.invoice_status end,
      updated_at=now()
  where id=v_invoice.id;
  insert into public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  values(v_org,auth.uid(),'payment.create','payment',v_payment.id,'success',jsonb_build_object('invoice_id',v_invoice.id,'amount',p_amount,'method',p_method));
  insert into public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload)
  values(v_org,'operational_invoice',v_invoice.id,'payment.received',jsonb_build_object('invoice_id',v_invoice.id,'payment_id',v_payment.id,'amount',p_amount));
  return v_payment;
end;
$$;

revoke execute on function public.record_payment(uuid,numeric,public.payment_method,uuid,text) from anon, public;
grant execute on function public.record_payment(uuid,numeric,public.payment_method,uuid,text) to authenticated;

-- record_expense: numeric supports special values; reject Infinity/-Infinity/NaN
-- explicitly instead of calling a nonexistent isfinite(numeric) function.
create or replace function public.record_expense(
  p_branch_id uuid,
  p_cash_account_id uuid,
  p_category text,
  p_amount numeric,
  p_currency text default 'YER',
  p_description text default null,
  p_expense_date date default current_date
)
returns public.expenses
language plpgsql
security definer
set search_path = ''
as $$
declare
  o uuid:=public.current_organization_id();
  r public.user_role:=public.current_role();
  a public.cash_accounts%rowtype;
  e public.expenses%rowtype;
  bal numeric;
begin
  if o is null or r not in('owner','admin') then raise exception using errcode='42501'; end if;
  if p_branch_id is null or not exists(select 1 from public.branches where id=p_branch_id and organization_id=o and is_active) then raise exception using errcode='42501',message='branch not available'; end if;
  select * into a from public.cash_accounts where id=p_cash_account_id and organization_id=o and is_active for update;
  if not found
     or p_amount is null
     or p_amount::text in ('Infinity','-Infinity','NaN')
     or p_amount<=0
     or p_amount>9007199254740991
     or p_currency is null
     or trim(p_currency) !~ '^[A-Za-z]{3}$'
     or a.currency<>upper(trim(p_currency)) then
    raise exception using errcode='22023';
  end if;
  if nullif(trim(p_category),'') is null or length(trim(p_category))>200 then raise exception using errcode='22023'; end if;
  if p_description is not null and length(p_description)>2000 then raise exception using errcode='22023'; end if;
  select a.opening_balance+coalesce(sum(case when direction='in' then amount else -amount end),0)
    into bal
    from public.cash_transactions
    where organization_id=o and cash_account_id=a.id;
  if bal<p_amount then raise exception using errcode='22003'; end if;
  insert into public.expenses(organization_id,branch_id,cash_account_id,category,amount,currency,description,expense_date,actor_id)
  values(o,p_branch_id,p_cash_account_id,trim(p_category),p_amount,upper(trim(p_currency)),nullif(trim(p_description),''),coalesce(p_expense_date,current_date),auth.uid())
  returning * into e;
  insert into public.cash_transactions(organization_id,cash_account_id,direction,amount,source_type,source_id,actor_id)
  values(o,p_cash_account_id,'out',p_amount,'expense',e.id,auth.uid());
  return e;
end;
$$;

revoke execute on function public.record_expense(uuid,uuid,text,numeric,text,text,date) from anon, public;
grant execute on function public.record_expense(uuid,uuid,text,numeric,text,text,date) to authenticated;

-- Later migrations re-created these functions with search_path=public after the
-- original hardening migration. Re-pin them here so the final canonical state
-- is deterministic on an empty replay.
alter function public.create_purchase_order(uuid,uuid,text,jsonb,text,text) set search_path = '';
alter function public.receive_purchase_order(uuid,text,jsonb,text) set search_path = '';
alter function public.set_cart_item(uuid,integer) set search_path = '';

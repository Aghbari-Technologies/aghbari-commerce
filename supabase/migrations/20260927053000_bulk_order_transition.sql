-- Atomic, permission-aware bulk order status transitions.
-- Production migration is source-controlled; release application remains gated by exact proof.
begin;

create table if not exists public.bulk_order_transition_results (
  id uuid primary key default gen_random_uuid(),
  operation_idempotency_id uuid not null references public.operation_idempotency(id) on delete cascade,
  organization_id uuid not null,
  order_id uuid not null,
  from_status public.order_status,
  to_status public.order_status not null,
  created_at timestamptz not null default now(),
  unique (operation_idempotency_id, order_id)
);

create index if not exists bulk_order_transition_results_operation_idx
  on public.bulk_order_transition_results(operation_idempotency_id, order_id);

create index if not exists bulk_order_transition_results_org_idx
  on public.bulk_order_transition_results(organization_id, order_id);

alter table public.bulk_order_transition_results enable row level security;
revoke all on table public.bulk_order_transition_results from public, anon, authenticated;

create or replace function public.bulk_transition_orders(
  p_idempotency_key text,
  p_order_ids uuid[],
  p_to_status public.order_status
)
returns table(
  order_id uuid,
  from_status public.order_status,
  to_status public.order_status
)
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_org uuid := public.current_organization_id();
  v_role public.user_role := public.current_role();
  v_key text := trim(coalesce(p_idempotency_key,''));
  v_order_ids uuid[];
  v_hash text;
  v_existing public.operation_idempotency%rowtype;
  v_operation_id uuid;
  v_order public.orders%rowtype;
  v_item record;
  v_allowed boolean;
begin
  if v_org is null or v_role not in ('owner','admin','sales','warehouse') then
    raise exception using errcode='42501', message='authenticated staff context required';
  end if;

  if length(v_key) < 16 or length(v_key) > 128 then
    raise exception using errcode='22023', message='invalid idempotency key';
  end if;

  if p_order_ids is null
     or cardinality(p_order_ids) < 1
     or cardinality(p_order_ids) > 100
     or p_to_status is null then
    raise exception using errcode='22023', message='bulk transition input is invalid';
  end if;

  if exists (
    select 1
    from unnest(p_order_ids) as ids(order_id)
    group by order_id
    having count(*) > 1
  ) then
    raise exception using errcode='22023', message='duplicate order id';
  end if;

  v_order_ids := array(select ids.order_id from unnest(p_order_ids) ids(order_id) order by ids.order_id);
  v_hash := md5(jsonb_build_object('order_ids', v_order_ids, 'to_status', p_to_status)::text);

  perform pg_advisory_xact_lock(hashtextextended(v_org::text || ':bulk-order:' || v_key, 0));

  select * into v_existing
  from public.operation_idempotency
  where organization_id=v_org
    and idempotency_key=v_key
    and operation_type='bulk_order_transition'
  for update;

  if found then
    if v_existing.request_hash <> v_hash then
      raise exception using errcode='40001', message='idempotency key payload conflict';
    end if;
    if v_existing.status='completed' then
      return query
        select r.order_id, r.from_status, r.to_status
        from public.bulk_order_transition_results r
        where r.operation_idempotency_id=v_existing.id
          and r.organization_id=v_org
        order by r.order_id;
      return;
    end if;
    if v_existing.expires_at <= now() then
      delete from public.bulk_order_transition_results where operation_idempotency_id=v_existing.id;
      delete from public.operation_idempotency where id=v_existing.id;
    else
      raise exception using errcode='40001', message='bulk order operation is already processing';
    end if;
  end if;

  if (
    select count(*)
    from public.orders
    where organization_id=v_org
      and id=any(v_order_ids)
  ) <> cardinality(v_order_ids) then
    raise exception using errcode='42501', message='one or more orders are outside organization';
  end if;

  -- Lock every selected order before any validation or inventory mutation.
  for v_order in
    select *
    from public.orders
    where organization_id=v_org
      and id=any(v_order_ids)
    order by id
    for update
  loop
    v_allowed := case
      when v_order.status='pending' and p_to_status='confirmed' then v_role in ('owner','admin','sales')
      when v_order.status='confirmed' and p_to_status='preparing' then v_role in ('owner','admin','warehouse')
      when v_order.status='preparing' and p_to_status='ready' then v_role in ('owner','admin','warehouse')
      when v_order.status='ready' and p_to_status='completed' then v_role in ('owner','admin','warehouse','sales')
      when v_order.status in ('pending','confirmed','preparing') and p_to_status='cancelled' then v_role in ('owner','admin','sales','warehouse')
      else false
    end;

    if not v_allowed then
      raise exception using errcode='42501', message='one or more order transitions are not authorized';
    end if;
  end loop;

  if p_to_status='cancelled' then
    if exists (
      select 1
      from public.order_items oi
      join public.orders o on o.id=oi.order_id and o.organization_id=v_org
      left join public.inventory_balances ib
        on ib.organization_id=v_org
       and ib.warehouse_id=o.warehouse_id
       and ib.product_id=oi.product_id
      where oi.organization_id=v_org
        and oi.order_id=any(v_order_ids)
        and ib.product_id is null
    ) then
      raise exception using errcode='P0001', message='inventory balance missing during bulk cancellation';
    end if;

    -- Stable inventory lock order prevents cross-batch deadlocks.
    perform ib.quantity
    from public.inventory_balances ib
    where ib.organization_id=v_org
      and exists (
        select 1
        from public.orders o
        join public.order_items oi on oi.order_id=o.id and oi.organization_id=v_org
        where o.organization_id=v_org
          and o.id=any(v_order_ids)
          and ib.warehouse_id=o.warehouse_id
          and ib.product_id=oi.product_id
      )
    order by ib.warehouse_id, ib.product_id
    for update;
  end if;

  insert into public.operation_idempotency(
    organization_id,idempotency_key,request_hash,operation_type,status,expires_at
  )
  values (
    v_org,v_key,v_hash,'bulk_order_transition','processing',now()+interval '24 hours'
  )
  returning id into v_operation_id;

  for v_order in
    select *
    from public.orders
    where organization_id=v_org
      and id=any(v_order_ids)
    order by id
  loop
    if p_to_status='cancelled' then
      for v_item in
        select oi.product_id, oi.quantity
        from public.order_items oi
        where oi.organization_id=v_org
          and oi.order_id=v_order.id
        order by oi.product_id
      loop
        update public.inventory_balances
        set quantity=quantity+v_item.quantity, updated_at=now()
        where organization_id=v_org
          and warehouse_id=v_order.warehouse_id
          and product_id=v_item.product_id;

        insert into public.inventory_movements(
          organization_id,warehouse_id,product_id,delta,source_type,source_id,actor_id
        )
        values(
          v_org,v_order.warehouse_id,v_item.product_id,v_item.quantity,
          'order_cancel',v_order.id,auth.uid()
        );
      end loop;
    end if;

    update public.orders
    set status=p_to_status, updated_at=now()
    where organization_id=v_org and id=v_order.id;

    insert into public.bulk_order_transition_results(
      operation_idempotency_id,organization_id,order_id,from_status,to_status
    )
    values(v_operation_id,v_org,v_order.id,v_order.status,p_to_status);

    insert into public.order_status_history(
      organization_id,order_id,from_status,to_status,actor_id
    )
    values(v_org,v_order.id,v_order.status,p_to_status,auth.uid());

    insert into public.audit_events(
      organization_id,actor_id,action,target_type,target_id,result,metadata
    )
    values(
      v_org,auth.uid(),'order.bulk_transition','order',v_order.id,'success',
      jsonb_build_object(
        'from',v_order.status,
        'to',p_to_status,
        'operation_type','bulk_order_transition',
        'idempotency_key',v_key
      )
    );

    insert into public.outbox_events(
      organization_id,aggregate_type,aggregate_id,event_type,payload
    )
    values(
      v_org,'order',v_order.id,'order.status_changed',
      jsonb_build_object(
        'order_id',v_order.id,
        'from',v_order.status,
        'to',p_to_status,
        'bulk',true
      )
    );
  end loop;

  update public.operation_idempotency
  set status='completed', response_reference=v_order_ids[1]
  where id=v_operation_id;

  return query
    select r.order_id, r.from_status, r.to_status
    from public.bulk_order_transition_results r
    where r.operation_idempotency_id=v_operation_id
      and r.organization_id=v_org
    order by r.order_id;
end;
$function$;

grant execute on function public.bulk_transition_orders(text,uuid[],public.order_status) to authenticated;
revoke execute on function public.bulk_transition_orders(text,uuid[],public.order_status) from public, anon;

commit;

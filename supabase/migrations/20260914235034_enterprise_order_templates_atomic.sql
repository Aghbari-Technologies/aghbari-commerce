-- Enterprise order templates: normalized lines, tenant-bound ownership, atomic apply and idempotency.
-- Source of truth is PostgreSQL; the legacy order_templates.lines JSONB column remains only for compatibility.

alter table public.order_templates add column if not exists organization_id uuid;
update public.order_templates t set organization_id = c.organization_id from public.customers c where c.id=t.customer_id and t.organization_id is null;
alter table public.order_templates alter column organization_id set not null;
create index if not exists idx_order_templates_org_customer_updated on public.order_templates(organization_id,customer_id,updated_at desc);

create table if not exists public.order_template_lines (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  template_id uuid not null references public.order_templates(id) on delete cascade, product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check(quantity>=1 and quantity<=1000000), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(template_id,product_id)
);
create index if not exists idx_order_template_lines_org_template on public.order_template_lines(organization_id,template_id);
create index if not exists idx_order_template_lines_product on public.order_template_lines(organization_id,product_id);
insert into public.order_template_lines(organization_id,template_id,product_id,quantity)
select t.organization_id,t.id,x.product_id,x.quantity from public.order_templates t
cross join lateral jsonb_to_recordset(case when jsonb_typeof(t.lines)='array' then t.lines else '[]'::jsonb end) as x(product_id uuid,quantity integer)
where x.product_id is not null and x.quantity between 1 and 1000000
on conflict(template_id,product_id) do update set quantity=excluded.quantity,updated_at=now();

create table if not exists public.order_template_apply_operations (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade, template_id uuid not null references public.order_templates(id) on delete cascade,
  idempotency_key text not null check(char_length(trim(idempotency_key)) between 1 and 128), request_hash text not null,
  cart_id uuid not null references public.carts(id) on delete restrict, created_at timestamptz not null default now(), unique(organization_id,customer_id,idempotency_key)
);
create index if not exists idx_order_template_apply_ops_template on public.order_template_apply_operations(organization_id,template_id,created_at desc);

alter table public.order_template_lines enable row level security;
alter table public.order_template_apply_operations enable row level security;
drop policy if exists order_template_lines_select_own on public.order_template_lines;
create policy order_template_lines_select_own on public.order_template_lines for select to authenticated using(
  organization_id=(select organization_id from public.profiles where id=auth.uid()) and template_id in(
    select id from public.order_templates where organization_id=(select organization_id from public.profiles where id=auth.uid()) and customer_id=(select customer_id from public.profiles where id=auth.uid())
  )
);
drop policy if exists order_template_apply_ops_select_own on public.order_template_apply_operations;
create policy order_template_apply_ops_select_own on public.order_template_apply_operations for select to authenticated using(
  organization_id=(select organization_id from public.profiles where id=auth.uid()) and customer_id=(select customer_id from public.profiles where id=auth.uid())
);

drop policy if exists order_templates_select_own on public.order_templates;
create policy order_templates_select_own on public.order_templates for select to authenticated using(organization_id=(select organization_id from public.profiles where id=auth.uid()) and customer_id=(select customer_id from public.profiles where id=auth.uid()));
drop policy if exists order_templates_insert_own on public.order_templates;
create policy order_templates_insert_own on public.order_templates for insert to authenticated with check(organization_id=(select organization_id from public.profiles where id=auth.uid()) and customer_id=(select customer_id from public.profiles where id=auth.uid()));
drop policy if exists order_templates_update_own on public.order_templates;
create policy order_templates_update_own on public.order_templates for update to authenticated using(organization_id=(select organization_id from public.profiles where id=auth.uid()) and customer_id=(select customer_id from public.profiles where id=auth.uid())) with check(organization_id=(select organization_id from public.profiles where id=auth.uid()) and customer_id=(select customer_id from public.profiles where id=auth.uid()));
drop policy if exists order_templates_delete_own on public.order_templates;
create policy order_templates_delete_own on public.order_templates for delete to authenticated using(organization_id=(select organization_id from public.profiles where id=auth.uid()) and customer_id=(select customer_id from public.profiles where id=auth.uid()));

create or replace function public.save_order_template(p_name text,p_lines jsonb,p_branch_label text default null)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_org uuid:=public.current_organization_id(); v_customer uuid:=public.current_customer_id(); v_template uuid; v_line jsonb; v_product uuid; v_qty integer;
begin
 if v_org is null or v_customer is null then raise exception using errcode='42501',message='authenticated customer context required'; end if;
 if not exists(select 1 from public.customers where id=v_customer and organization_id=v_org and is_active) then raise exception using errcode='42501',message='active customer required'; end if;
 if p_name is null or char_length(trim(p_name)) not between 1 and 120 then raise exception using errcode='22023',message='template name is invalid'; end if;
 if jsonb_typeof(p_lines)<>'array' or jsonb_array_length(p_lines)<1 or jsonb_array_length(p_lines)>100 then raise exception using errcode='22023',message='template lines are invalid'; end if;
 insert into public.order_templates(organization_id,customer_id,name,branch_label,lines) values(v_org,v_customer,trim(p_name),nullif(trim(p_branch_label),''),'[]'::jsonb) returning id into v_template;
 for v_line in select value from jsonb_array_elements(p_lines) loop
  v_product:=nullif(v_line->>'product_id','')::uuid; v_qty:=(v_line->>'quantity')::integer;
  if v_product is null or v_qty is null or v_qty<1 or v_qty>1000000 then raise exception using errcode='22023',message='template line is invalid'; end if;
  if exists(select 1 from public.order_template_lines where template_id=v_template and product_id=v_product) then raise exception using errcode='22023',message='duplicate product in template'; end if;
  if not exists(select 1 from public.products where id=v_product and organization_id=v_org) then raise exception using errcode='42501',message='template product is outside organization'; end if;
  insert into public.order_template_lines(organization_id,template_id,product_id,quantity) values(v_org,v_template,v_product,v_qty);
 end loop;
 update public.order_templates set lines=(select coalesce(jsonb_agg(jsonb_build_object('product_id',product_id,'quantity',quantity) order by created_at),'[]'::jsonb) from public.order_template_lines where template_id=v_template),updated_at=now() where id=v_template;
 return v_template;
end; $$;
revoke all on function public.save_order_template(text,jsonb,text) from public,anon;
grant execute on function public.save_order_template(text,jsonb,text) to authenticated;

create or replace function public.apply_order_template(p_template_id uuid,p_warehouse_id uuid,p_idempotency_key text)
returns table(cart_id uuid,applied_lines integer) language plpgsql security definer set search_path=public as $$
declare v_org uuid:=public.current_organization_id(); v_customer uuid:=public.current_customer_id(); v_cart uuid; v_existing public.order_template_apply_operations%rowtype; v_hash text; v_template public.order_templates%rowtype; v_line record; v_available numeric; v_tier public.customer_tier; v_count integer:=0;
begin
 if v_org is null or v_customer is null then raise exception using errcode='42501',message='authenticated customer context required'; end if;
 if p_idempotency_key is null or char_length(trim(p_idempotency_key))>128 or char_length(trim(p_idempotency_key))<1 then raise exception using errcode='22023',message='invalid idempotency key'; end if;
 select * into v_template from public.order_templates where id=p_template_id and organization_id=v_org and customer_id=v_customer for update;
 if not found then raise exception using errcode='42501',message='template not found'; end if;
 if p_warehouse_id is null or not exists(select 1 from public.warehouses where id=p_warehouse_id and organization_id=v_org and is_active) then raise exception using errcode='42501',message='warehouse not available'; end if;
 select c.tier into v_tier from public.customers c where c.id=v_customer and c.organization_id=v_org and c.is_active;
 if v_tier is null then raise exception using errcode='42501',message='active customer required'; end if;
 v_hash:=encode(digest(jsonb_build_object('template_id',p_template_id,'warehouse_id',p_warehouse_id)::text,'sha256'),'hex');
 select * into v_existing from public.order_template_apply_operations where organization_id=v_org and customer_id=v_customer and idempotency_key=trim(p_idempotency_key) for update;
 if found then
  if v_existing.request_hash<>v_hash or v_existing.template_id<>p_template_id then raise exception using errcode='23505',message='idempotency key already used with different payload'; end if;
  return query select v_existing.cart_id,(select count(*)::integer from public.order_template_lines where template_id=p_template_id); return;
 end if;
 select id into v_cart from public.carts where organization_id=v_org and customer_id=v_customer and status='active' for update;
 if v_cart is null then insert into public.carts(organization_id,customer_id,status) values(v_org,v_customer,'active') returning id into v_cart; end if;
 for v_line in select otl.product_id,otl.quantity,p.sku,p.status from public.order_template_lines otl join public.products p on p.id=otl.product_id and p.organization_id=v_org where otl.organization_id=v_org and otl.template_id=p_template_id order by otl.created_at loop
  if v_line.status<>'active' then raise exception using errcode='P0001',message='template contains unavailable product'; end if;
  select coalesce(sum(ib.quantity),0) into v_available from public.inventory_balances ib where ib.organization_id=v_org and ib.warehouse_id=p_warehouse_id and ib.product_id=v_line.product_id;
  if v_available<v_line.quantity then raise exception using errcode='P0001',message=format('insufficient stock for SKU %s',v_line.sku); end if;
  if not exists(select 1 from public.product_prices pp join public.price_lists pl on pl.id=pp.price_list_id where pp.organization_id=v_org and pp.product_id=v_line.product_id and pl.organization_id=v_org and pl.tier=v_tier and pl.is_active and pp.valid_from<=now() and (pp.valid_to is null or pp.valid_to>now())) then raise exception using errcode='42501',message=format('no authorized price for SKU %s',v_line.sku); end if;
  v_count:=v_count+1;
 end loop;
 if v_count=0 then raise exception using errcode='22023',message='template has no valid lines'; end if;
 for v_line in select product_id,quantity from public.order_template_lines where organization_id=v_org and template_id=p_template_id order by created_at loop
  insert into public.cart_items(organization_id,cart_id,product_id,quantity) values(v_org,v_cart,v_line.product_id,v_line.quantity) on conflict(cart_id,product_id) do update set quantity=excluded.quantity,updated_at=now();
 end loop;
 update public.carts set updated_at=now() where id=v_cart and organization_id=v_org;
 insert into public.order_template_apply_operations(organization_id,customer_id,template_id,idempotency_key,request_hash,cart_id) values(v_org,v_customer,p_template_id,trim(p_idempotency_key),v_hash,v_cart);
 insert into public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata) values(v_org,auth.uid(),'order_template.apply','order_template',p_template_id,'success',jsonb_build_object('cart_id',v_cart,'line_count',v_count));
 return query select v_cart,v_count;
end; $$;
revoke all on function public.apply_order_template(uuid,uuid,text) from public,anon;
grant execute on function public.apply_order_template(uuid,uuid,text) to authenticated;
comment on table public.order_template_lines is 'Normalized canonical order-template lines; product and quantity truth lives in PostgreSQL.';
comment on function public.apply_order_template(uuid,uuid,text) is 'Atomically validates every template line, then mutates the customer cart; replay is idempotent and cross-tenant access is rejected.';

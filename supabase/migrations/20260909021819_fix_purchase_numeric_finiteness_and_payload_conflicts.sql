-- Replace the invalid isfinite(numeric) predicate with explicit PostgreSQL numeric special-value rejection.
create or replace function public.create_purchase_order(p_supplier_id uuid, p_warehouse_id uuid, p_idempotency_key text, p_lines jsonb, p_currency text default 'YER', p_notes text default null)
returns table(purchase_order_id uuid, purchase_order_number bigint, status public.purchase_order_status, total numeric)
language plpgsql security definer set search_path = public
as $$
declare o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); po public.purchase_orders%rowtype; l jsonb; pid uuid; qty numeric; cost numeric; total numeric:=0; key text:=trim(coalesce(p_idempotency_key,'')); currency text:=upper(trim(coalesce(p_currency,''))); requested_lines jsonb; existing_lines jsonb;
begin
 if o is null or r not in('owner','admin','warehouse') then raise exception using errcode='42501'; end if;
 if length(key)<16 or length(key)>200 or p_lines is null or jsonb_typeof(p_lines)<>'array' or jsonb_array_length(p_lines)=0 or jsonb_array_length(p_lines)>100 then raise exception using errcode='22023'; end if;
 if currency !~ '^[A-Z]{3}$' then raise exception using errcode='22023',message='invalid currency'; end if;
 if p_notes is not null and length(p_notes)>2000 then raise exception using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(o::text||':purchase:'||key,0));
 select * into po from public.purchase_orders where organization_id=o and idempotency_key=key;
 if found then
   select coalesce(jsonb_agg(jsonb_build_object('product_id',x.product_id,'quantity',x.quantity,'unit_cost',x.unit_cost) order by x.product_id), '[]'::jsonb) into requested_lines from (select (value->>'product_id')::text product_id,(value->>'quantity')::numeric quantity,round((value->>'unit_cost')::numeric,2) unit_cost from jsonb_array_elements(p_lines)) x;
   select coalesce(jsonb_agg(jsonb_build_object('product_id',poi.product_id::text,'quantity',poi.quantity_ordered,'unit_cost',round(poi.unit_cost,2)) order by poi.product_id), '[]'::jsonb) into existing_lines from public.purchase_order_items poi where poi.organization_id=o and poi.purchase_order_id=po.id;
   if po.supplier_id is distinct from p_supplier_id or po.warehouse_id is distinct from p_warehouse_id or po.currency is distinct from currency or coalesce(po.notes,'') is distinct from coalesce(nullif(trim(p_notes),''),'') or existing_lines is distinct from requested_lines then raise exception using errcode='40001',message='idempotency key payload conflict'; end if;
   return query select po.id,po.purchase_order_number,po.status,po.total; return;
 end if;
 if not exists(select 1 from public.suppliers where id=p_supplier_id and organization_id=o and is_active) or not exists(select 1 from public.warehouses where id=p_warehouse_id and organization_id=o and is_active) then raise exception using errcode='P0002'; end if;
 if exists(select 1 from(select value->>'product_id' product_id from jsonb_array_elements(p_lines)) x group by product_id having count(*)>1) then raise exception using errcode='22023',message='duplicate product line'; end if;
 for l in select value from jsonb_array_elements(p_lines) loop
  begin pid:=(l->>'product_id')::uuid; qty:=(l->>'quantity')::numeric; cost:=(l->>'unit_cost')::numeric; exception when invalid_text_representation or numeric_value_out_of_range then raise exception using errcode='22023',message='invalid purchase line'; end;
  if not exists(select 1 from public.products where id=pid and organization_id=o) or qty is null or qty::text in ('Infinity','-Infinity','NaN') or qty<>trunc(qty) or qty<=0 or qty>100000 or cost is null or cost::text in ('Infinity','-Infinity','NaN') or cost<0 or cost>9007199254740991 then raise exception using errcode='22023'; end if;
  total:=total+qty*round(cost,2); if total>9007199254740991 then raise exception using errcode='22003'; end if;
 end loop;
 insert into public.purchase_orders(organization_id,supplier_id,warehouse_id,currency,subtotal,total,idempotency_key,notes,created_by) values(o,p_supplier_id,p_warehouse_id,currency,total,total,key,nullif(trim(p_notes),''),auth.uid()) returning * into po;
 for l in select value from jsonb_array_elements(p_lines) loop insert into public.purchase_order_items(organization_id,purchase_order_id,product_id,quantity_ordered,unit_cost) values(o,po.id,(l->>'product_id')::uuid,(l->>'quantity')::integer,round((l->>'unit_cost')::numeric,2)); end loop;
 return query select po.id,po.purchase_order_number,po.status,po.total;
end; $$;

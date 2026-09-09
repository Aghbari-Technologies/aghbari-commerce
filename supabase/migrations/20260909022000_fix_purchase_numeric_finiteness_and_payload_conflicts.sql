-- Harden purchase command numeric validation and idempotency replay semantics.
-- Existing idempotency keys may only replay the exact same logical request.

create or replace function public.create_purchase_order(p_supplier_id uuid, p_warehouse_id uuid, p_idempotency_key text, p_lines jsonb, p_currency text default 'YER', p_notes text default null)
returns table(purchase_order_id uuid, purchase_order_number bigint, status public.purchase_order_status, total numeric)
language plpgsql security definer set search_path = public
as $$
declare
  o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); po public.purchase_orders%rowtype; l jsonb; pid uuid; qty numeric; cost numeric; total numeric:=0; key text:=trim(coalesce(p_idempotency_key,'')); currency text:=upper(trim(coalesce(p_currency,''))); requested_lines jsonb; existing_lines jsonb;
begin
 if o is null or r not in('owner','admin','warehouse') then raise exception using errcode='42501'; end if;
 if length(key)<16 or length(key)>200 or p_lines is null or jsonb_typeof(p_lines)<>'array' or jsonb_array_length(p_lines)=0 or jsonb_array_length(p_lines)>100 then raise exception using errcode='22023'; end if;
 if currency !~ '^[A-Z]{3}$' then raise exception using errcode='22023',message='invalid currency'; end if;
 if p_notes is not null and length(p_notes)>2000 then raise exception using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(o::text||':purchase:'||key,0));
 select * into po from public.purchase_orders where organization_id=o and idempotency_key=key;
 if found then
   select coalesce(jsonb_agg(jsonb_build_object('product_id',x.product_id,'quantity',x.quantity,'unit_cost',x.unit_cost) order by x.product_id), '[]'::jsonb) into requested_lines
   from (select (value->>'product_id')::text product_id, (value->>'quantity')::numeric quantity, round((value->>'unit_cost')::numeric,2) unit_cost from jsonb_array_elements(p_lines)) x;
   select coalesce(jsonb_agg(jsonb_build_object('product_id',poi.product_id::text,'quantity',poi.quantity_ordered,'unit_cost',round(poi.unit_cost,2)) order by poi.product_id), '[]'::jsonb) into existing_lines
   from public.purchase_order_items poi where poi.organization_id=o and poi.purchase_order_id=po.id;
   if po.supplier_id is distinct from p_supplier_id or po.warehouse_id is distinct from p_warehouse_id or po.currency is distinct from currency or coalesce(po.notes,'') is distinct from coalesce(nullif(trim(p_notes),''),'') or existing_lines is distinct from requested_lines then
     raise exception using errcode='40001', message='idempotency key payload conflict';
   end if;
   return query select po.id,po.purchase_order_number,po.status,po.total; return;
 end if;
 if not exists(select 1 from public.suppliers where id=p_supplier_id and organization_id=o and is_active) or not exists(select 1 from public.warehouses where id=p_warehouse_id and organization_id=o and is_active) then raise exception using errcode='P0002'; end if;
 if exists(select 1 from(select (value->>'product_id') as product_id from jsonb_array_elements(p_lines)) x group by product_id having count(*)>1) then raise exception using errcode='22023',message='duplicate product line'; end if;
 for l in select value from jsonb_array_elements(p_lines) loop
  begin pid:=(l->>'product_id')::uuid; qty:=(l->>'quantity')::numeric; cost:=(l->>'unit_cost')::numeric; exception when invalid_text_representation or numeric_value_out_of_range then raise exception using errcode='22023',message='invalid purchase line'; end;
  if not exists(select 1 from public.products where id=pid and organization_id=o) or qty is null or qty::text in ('Infinity','-Infinity','NaN') or qty<>trunc(qty) or qty<=0 or qty>100000 or cost is null or cost::text in ('Infinity','-Infinity','NaN') or cost<0 or cost>9007199254740991 then raise exception using errcode='22023'; end if;
  total:=total+qty*round(cost,2); if total>9007199254740991 then raise exception using errcode='22003'; end if;
 end loop;
 insert into public.purchase_orders(organization_id,supplier_id,warehouse_id,currency,subtotal,total,idempotency_key,notes,created_by) values(o,p_supplier_id,p_warehouse_id,currency,total,total,key,nullif(trim(p_notes),''),auth.uid()) returning * into po;
 for l in select value from jsonb_array_elements(p_lines) loop insert into public.purchase_order_items(organization_id,purchase_order_id,product_id,quantity_ordered,unit_cost) values(o,po.id,(l->>'product_id')::uuid,(l->>'quantity')::integer,round((l->>'unit_cost')::numeric,2)); end loop;
 return query select po.id,po.purchase_order_number,po.status,po.total;
end; $$;

create or replace function public.receive_purchase_order(p_purchase_order_id uuid, p_idempotency_key text, p_lines jsonb, p_notes text default null)
returns table(receipt_id uuid, receipt_number bigint, purchase_order_id uuid, purchase_order_status public.purchase_order_status, received_total numeric)
language plpgsql security definer set search_path = public
as $$
declare o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); po public.purchase_orders%rowtype; rec public.purchase_receipts%rowtype; existing public.purchase_receipts%rowtype; l jsonb; item public.purchase_order_items%rowtype; pid uuid; q int; inv int; total numeric:=0; key text:=trim(coalesce(p_idempotency_key,'')); requested_lines jsonb; existing_lines jsonb;
begin
 if o is null or r not in('owner','admin','warehouse') then raise exception using errcode='42501'; end if;
 if p_purchase_order_id is null or length(key)<16 or length(key)>200 or p_lines is null or jsonb_typeof(p_lines)<>'array' or jsonb_array_length(p_lines)=0 or jsonb_array_length(p_lines)>100 then raise exception using errcode='22023'; end if;
 if p_notes is not null and length(p_notes)>2000 then raise exception using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(o::text||':receipt:'||key,0));
 select * into existing from public.purchase_receipts where organization_id=o and idempotency_key=key;
 if found then
   select coalesce(jsonb_agg(jsonb_build_object('purchase_order_item_id',x.item_id,'product_id',x.product_id,'quantity',x.quantity) order by x.item_id), '[]'::jsonb) into requested_lines
   from (select (value->>'purchase_order_item_id')::text item_id,(value->>'product_id')::text product_id,(value->>'quantity')::integer quantity from jsonb_array_elements(p_lines)) x;
   select coalesce(jsonb_agg(jsonb_build_object('purchase_order_item_id',pri.purchase_order_item_id::text,'product_id',pri.product_id::text,'quantity',pri.quantity_received) order by pri.purchase_order_item_id), '[]'::jsonb) into existing_lines
   from public.purchase_receipt_items pri where pri.organization_id=o and pri.receipt_id=existing.id;
   if existing.purchase_order_id is distinct from p_purchase_order_id or coalesce(existing.notes,'') is distinct from coalesce(nullif(trim(p_notes),''),'') or existing_lines is distinct from requested_lines then
     raise exception using errcode='40001', message='idempotency key payload conflict';
   end if;
   return query select existing.id,existing.receipt_number,existing.purchase_order_id,(select po0.status from public.purchase_orders po0 where po0.id=existing.purchase_order_id),coalesce((select sum(pri.line_total) from public.purchase_receipt_items pri where pri.organization_id=o and pri.receipt_id=existing.id),0); return;
 end if;
 select * into po from public.purchase_orders po0 where po0.id=p_purchase_order_id and po0.organization_id=o for update;
 if not found or po.status not in('approved','partially_received') then raise exception using errcode='22023'; end if;
 if exists(select 1 from(select value->>'purchase_order_item_id' as item_id from jsonb_array_elements(p_lines)) x group by item_id having count(*)>1) then raise exception using errcode='22023',message='duplicate receipt line'; end if;
 insert into public.purchase_receipts(organization_id,purchase_order_id,warehouse_id,idempotency_key,received_by,notes) values(o,po.id,po.warehouse_id,key,auth.uid(),nullif(trim(p_notes),'')) returning * into rec;
 for l in select value from jsonb_array_elements(p_lines) loop
  begin pid:=(l->>'product_id')::uuid; q:=(l->>'quantity')::integer; exception when invalid_text_representation or numeric_value_out_of_range then raise exception using errcode='22023',message='invalid receipt line'; end;
  select * into item from public.purchase_order_items poi where poi.id=(l->>'purchase_order_item_id')::uuid and poi.organization_id=o and poi.purchase_order_id=po.id and poi.product_id=pid for update;
  if not found or q is null or q<=0 or q>item.quantity_ordered-item.quantity_received then raise exception using errcode='22023'; end if;
  insert into public.inventory_balances(organization_id,warehouse_id,product_id,quantity) values(o,po.warehouse_id,pid,0) on conflict(warehouse_id,product_id) do nothing;
  select ib.quantity into inv from public.inventory_balances ib where ib.organization_id=o and ib.warehouse_id=po.warehouse_id and ib.product_id=pid for update;
  update public.inventory_balances ib set quantity=inv+q,updated_at=now() where ib.organization_id=o and ib.warehouse_id=po.warehouse_id and ib.product_id=pid;
  update public.purchase_order_items poi set quantity_received=quantity_received+q where poi.id=item.id;
  insert into public.purchase_receipt_items(organization_id,receipt_id,purchase_order_item_id,product_id,quantity_received,unit_cost) values(o,rec.id,item.id,pid,q,item.unit_cost);
  insert into public.inventory_movements(organization_id,warehouse_id,product_id,delta,source_type,source_id,actor_id) values(o,po.warehouse_id,pid,q,'purchase_receipt',rec.id,auth.uid()); total:=total+item.unit_cost*q;
 end loop;
 update public.purchase_orders po0 set status=(case when not exists(select 1 from public.purchase_order_items poi where poi.organization_id=o and poi.purchase_order_id=po.id and poi.quantity_received<poi.quantity_ordered) then 'received'::public.purchase_order_status else 'partially_received'::public.purchase_order_status end),updated_at=now() where po0.id=po.id;
 return query select rec.id,rec.receipt_number,po.id,(select po1.status from public.purchase_orders po1 where po1.id=po.id),total;
end; $$;

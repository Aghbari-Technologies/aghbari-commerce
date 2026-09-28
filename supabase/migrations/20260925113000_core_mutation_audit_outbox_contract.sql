-- Close operational audit/outbox gaps on canonical mutation commands.
-- No permission broadening: all functions remain tenant-scoped SECURITY DEFINER
-- with the existing role gates and empty search_path.
CREATE OR REPLACE FUNCTION public.create_invoice_from_order(
  p_order_id uuid,
  p_due_at timestamptz DEFAULT NULL
)
RETURNS public.operational_invoices
LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE
  o uuid:=public.current_organization_id();
  r public.user_role:=public.current_role();
  ord public.orders%rowtype;
  inv public.operational_invoices%rowtype;
  it public.order_items%rowtype;
BEGIN
  IF o IS NULL OR r NOT IN('owner','admin','sales') THEN RAISE EXCEPTION USING errcode='42501',message='invoice creation access required'; END IF;
  SELECT * INTO ord FROM public.orders WHERE id=p_order_id AND organization_id=o FOR UPDATE;
  IF NOT FOUND OR ord.status NOT IN('ready','completed') THEN RAISE EXCEPTION USING errcode='22023',message='order is not invoiceable'; END IF;
  SELECT * INTO inv FROM public.operational_invoices WHERE organization_id=o AND order_id=ord.id;
  IF FOUND THEN RETURN inv; END IF;
  INSERT INTO public.operational_invoices(organization_id,order_id,customer_id,currency,subtotal,total,due_at,created_by)
  VALUES(o,ord.id,ord.customer_id,ord.currency,ord.subtotal,ord.total,p_due_at,auth.uid())
  RETURNING * INTO inv;
  FOR it IN SELECT * FROM public.order_items WHERE organization_id=o AND order_id=ord.id LOOP
    INSERT INTO public.operational_invoice_items(organization_id,invoice_id,product_id,description,quantity,unit_price)
    SELECT o,inv.id,it.product_id,p.name,it.quantity,it.unit_price
    FROM public.products p
    WHERE p.id=it.product_id AND p.organization_id=o;
  END LOOP;
  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  VALUES(o,auth.uid(),'invoice.create','operational_invoice',inv.id,'success',
         jsonb_build_object('order_id',ord.id,'invoice_number',inv.invoice_number,'total',inv.total));
  INSERT INTO public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload)
  VALUES(o,'operational_invoice',inv.id,'invoice.issued',
         jsonb_build_object('invoice_id',inv.id,'invoice_number',inv.invoice_number,'order_id',ord.id));
  RETURN inv;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_purchase_order(
  p_supplier_id uuid,
  p_warehouse_id uuid,
  p_idempotency_key text,
  p_lines jsonb,
  p_currency text DEFAULT 'YER',
  p_notes text DEFAULT NULL
)
RETURNS TABLE(purchase_order_id uuid,purchase_order_number bigint,status public.purchase_order_status,total numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
declare
  o uuid:=public.current_organization_id();
  r public.user_role:=public.current_role();
  po public.purchase_orders%rowtype;
  l jsonb;
  pid uuid;
  qty numeric;
  cost numeric;
  total numeric:=0;
  key text:=trim(coalesce(p_idempotency_key,''));
  currency text:=upper(trim(coalesce(p_currency,'')));
  requested_lines jsonb;
  existing_lines jsonb;
begin
 if o is null or r not in('owner','admin','warehouse') then raise exception using errcode='42501'; end if;
 if length(key)<16 or length(key)>200 or p_lines is null or jsonb_typeof(p_lines)<>'array' or jsonb_array_length(p_lines)=0 or jsonb_array_length(p_lines)>100 then raise exception using errcode='22023'; end if;
 if currency !~ '^[A-Z]{3}$' then raise exception using errcode='22023',message='invalid currency'; end if;
 if p_notes is not null and length(p_notes)>2000 then raise exception using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(o::text||':purchase:'||key,0));
 select * into po from public.purchase_orders where organization_id=o and idempotency_key=key;
 if found then
   select coalesce(jsonb_agg(jsonb_build_object('product_id',x.product_id,'quantity',x.quantity,'unit_cost',x.unit_cost) order by x.product_id),'[]'::jsonb) into requested_lines
   from (select (value->>'product_id')::text product_id,(value->>'quantity')::numeric quantity,round((value->>'unit_cost')::numeric,2) unit_cost from jsonb_array_elements(p_lines)) x;
   select coalesce(jsonb_agg(jsonb_build_object('product_id',poi.product_id::text,'quantity',poi.quantity_ordered,'unit_cost',round(poi.unit_cost,2)) order by poi.product_id),'[]'::jsonb) into existing_lines
   from public.purchase_order_items poi where poi.organization_id=o and poi.purchase_order_id=po.id;
   if po.supplier_id is distinct from p_supplier_id or po.warehouse_id is distinct from p_warehouse_id or po.currency is distinct from currency or coalesce(po.notes,'') is distinct from coalesce(nullif(trim(p_notes),''),'') or existing_lines is distinct from requested_lines then
     raise exception using errcode='40001',message='idempotency key payload conflict';
   end if;
   return query select po.id,po.purchase_order_number,po.status,po.total; return;
 end if;
 if not exists(select 1 from public.suppliers where id=p_supplier_id and organization_id=o and is_active) or not exists(select 1 from public.warehouses where id=p_warehouse_id and organization_id=o and is_active) then raise exception using errcode='P0002'; end if;
 if exists(select 1 from(select value->>'product_id' product_id from jsonb_array_elements(p_lines)) x group by product_id having count(*)>1) then raise exception using errcode='22023',message='duplicate product line'; end if;
 for l in select value from jsonb_array_elements(p_lines) loop
  begin
    pid:=(l->>'product_id')::uuid;
    qty:=(l->>'quantity')::numeric;
    cost:=(l->>'unit_cost')::numeric;
  exception when invalid_text_representation or numeric_value_out_of_range then
    raise exception using errcode='22023',message='invalid purchase line';
  end;
  if not exists(select 1 from public.products where id=pid and organization_id=o)
     or qty is null or qty::text in ('Infinity','-Infinity','NaN') or qty<>trunc(qty) or qty<=0 or qty>100000
     or cost is null or cost::text in ('Infinity','-Infinity','NaN') or cost<0 or cost>9007199254740991 then raise exception using errcode='22023'; end if;
  total:=total+qty*round(cost,2);
  if total>9007199254740991 then raise exception using errcode='22003'; end if;
 end loop;
 insert into public.purchase_orders(organization_id,supplier_id,warehouse_id,currency,subtotal,total,idempotency_key,notes,created_by)
 values(o,p_supplier_id,p_warehouse_id,currency,total,total,key,nullif(trim(p_notes),''),auth.uid()) returning * into po;
 for l in select value from jsonb_array_elements(p_lines) loop
   insert into public.purchase_order_items(organization_id,purchase_order_id,product_id,quantity_ordered,unit_cost)
   values(o,po.id,(l->>'product_id')::uuid,(l->>'quantity')::integer,round((l->>'unit_cost')::numeric,2));
 end loop;
 insert into public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
 values(o,auth.uid(),'purchase_order.create','purchase_order',po.id,'success',
        jsonb_build_object('purchase_order_number',po.purchase_order_number,'total',po.total));
 insert into public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload)
 values(o,'purchase_order',po.id,'purchase.created',
        jsonb_build_object('purchase_order_id',po.id,'purchase_order_number',po.purchase_order_number,'total',po.total));
 return query select po.id,po.purchase_order_number,po.status,po.total;
end;
$$;

CREATE OR REPLACE FUNCTION public.submit_purchase_order(p_purchase_order_id uuid)
RETURNS public.purchase_orders
LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); po public.purchase_orders%rowtype;
BEGIN
 IF o IS NULL OR r NOT IN('owner','admin','warehouse') THEN RAISE EXCEPTION USING errcode='42501'; END IF;
 SELECT * INTO po FROM public.purchase_orders WHERE id=p_purchase_order_id AND organization_id=o FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION USING errcode='P0002'; END IF;
 IF po.status<>'draft' THEN RAISE EXCEPTION USING errcode='22023'; END IF;
 UPDATE public.purchase_orders SET status='submitted',updated_at=now() WHERE id=po.id RETURNING * INTO po;
 INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
 VALUES(o,auth.uid(),'purchase_order.submit','purchase_order',po.id,'success',
        jsonb_build_object('purchase_order_number',po.purchase_order_number));
 INSERT INTO public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload)
 VALUES(o,'purchase_order',po.id,'purchase.submitted',
        jsonb_build_object('purchase_order_id',po.id,'purchase_order_number',po.purchase_order_number));
 RETURN po;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_purchase_order(p_purchase_order_id uuid)
RETURNS public.purchase_orders
LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); po public.purchase_orders%rowtype;
BEGIN
 IF o IS NULL OR r NOT IN('owner','admin') THEN RAISE EXCEPTION USING errcode='42501'; END IF;
 SELECT * INTO po FROM public.purchase_orders WHERE id=p_purchase_order_id AND organization_id=o FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION USING errcode='P0002'; END IF;
 IF po.status<>'submitted' THEN RAISE EXCEPTION USING errcode='22023'; END IF;
 UPDATE public.purchase_orders SET status='approved',approved_by=auth.uid(),approved_at=now(),updated_at=now() WHERE id=po.id RETURNING * INTO po;
 INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
 VALUES(o,auth.uid(),'purchase_order.approve','purchase_order',po.id,'success',
        jsonb_build_object('purchase_order_number',po.purchase_order_number,'approved_by',auth.uid()));
 INSERT INTO public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload)
 VALUES(o,'purchase_order',po.id,'purchase.approved',
        jsonb_build_object('purchase_order_id',po.id,'purchase_order_number',po.purchase_order_number));
 RETURN po;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_cash_account(
 p_branch_id uuid,p_name text,p_currency text DEFAULT 'YER',p_opening_balance numeric DEFAULT 0
)
RETURNS public.cash_accounts
LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); a public.cash_accounts%rowtype;
BEGIN
 IF o IS NULL OR r NOT IN('owner','admin') THEN RAISE EXCEPTION USING errcode='42501'; END IF;
 IF nullif(trim(p_name),'') IS NULL OR p_opening_balance IS NULL OR p_opening_balance::text IN ('Infinity','-Infinity','NaN') OR p_opening_balance<0 OR p_opening_balance>9007199254740991 OR p_currency IS NULL OR trim(p_currency) !~ '^[A-Za-z]{3}$' THEN
   RAISE EXCEPTION USING errcode='22023';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM public.branches WHERE id=p_branch_id AND organization_id=o AND is_active) THEN RAISE EXCEPTION USING errcode='P0002'; END IF;
 INSERT INTO public.cash_accounts(organization_id,branch_id,name,currency,opening_balance)
 VALUES(o,p_branch_id,trim(p_name),upper(trim(p_currency)),p_opening_balance) RETURNING * INTO a;
 INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
 VALUES(o,auth.uid(),'cash_account.create','cash_account',a.id,'success',
        jsonb_build_object('branch_id',p_branch_id,'currency',a.currency,'opening_balance',a.opening_balance));
 RETURN a;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_customer(
 p_name text,p_phone text DEFAULT NULL,p_tier public.customer_tier DEFAULT 'retail'
)
RETURNS public.customers
LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); c public.customers%rowtype; n text:=trim(coalesce(p_name,''));
BEGIN
 IF o IS NULL OR r NOT IN('owner','admin','sales') THEN RAISE EXCEPTION USING errcode='42501'; END IF;
 IF n='' OR length(n)>200 THEN RAISE EXCEPTION USING errcode='22023',message='invalid customer name'; END IF;
 IF p_phone IS NOT NULL AND length(trim(p_phone))>50 THEN RAISE EXCEPTION USING errcode='22023',message='invalid customer phone'; END IF;
 INSERT INTO public.customers(organization_id,name,phone,tier)
 VALUES(o,n,nullif(trim(p_phone),''),coalesce(p_tier,'retail')) RETURNING * INTO c;
 INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
 VALUES(o,auth.uid(),'customer.create','customer',c.id,'success',
        jsonb_build_object('tier',c.tier));
 RETURN c;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_supplier(
 p_name text,p_phone text DEFAULT NULL,p_email text DEFAULT NULL,p_address text DEFAULT NULL
)
RETURNS public.suppliers
LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); s public.suppliers%rowtype; n text:=trim(coalesce(p_name,''));
BEGIN
 IF o IS NULL OR r NOT IN('owner','admin','warehouse') THEN RAISE EXCEPTION USING errcode='42501'; END IF;
 IF n='' OR length(n)>200 THEN RAISE EXCEPTION USING errcode='22023',message='invalid supplier name'; END IF;
 IF p_phone IS NOT NULL AND length(trim(p_phone))>50 THEN RAISE EXCEPTION USING errcode='22023',message='invalid supplier phone'; END IF;
 IF p_email IS NOT NULL AND length(trim(p_email))>320 THEN RAISE EXCEPTION USING errcode='22023',message='invalid supplier email'; END IF;
 IF p_address IS NOT NULL AND length(trim(p_address))>500 THEN RAISE EXCEPTION USING errcode='22023',message='invalid supplier address'; END IF;
 INSERT INTO public.suppliers(organization_id,name,phone,email,address)
 VALUES(o,n,nullif(trim(p_phone),''),nullif(trim(p_email),''),nullif(trim(p_address),'')) RETURNING * INTO s;
 INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
 VALUES(o,auth.uid(),'supplier.create','supplier',s.id,'success',jsonb_build_object('name',s.name));
 RETURN s;
END;
$$;

REVOKE ALL ON FUNCTION public.create_invoice_from_order(uuid,timestamptz) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.create_invoice_from_order(uuid,timestamptz) TO authenticated;
REVOKE ALL ON FUNCTION public.create_purchase_order(uuid,uuid,text,jsonb,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.create_purchase_order(uuid,uuid,text,jsonb,text,text) TO authenticated;
REVOKE ALL ON FUNCTION public.submit_purchase_order(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.submit_purchase_order(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.approve_purchase_order(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.approve_purchase_order(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.create_cash_account(uuid,text,text,numeric) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.create_cash_account(uuid,text,text,numeric) TO authenticated;
REVOKE ALL ON FUNCTION public.create_customer(text,text,public.customer_tier) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.create_customer(text,text,public.customer_tier) TO authenticated;
REVOKE ALL ON FUNCTION public.create_supplier(text,text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.create_supplier(text,text,text,text) TO authenticated;

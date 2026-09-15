-- Closure domain repair: final authoritative runtime definitions after legacy batch migrations.

CREATE OR REPLACE FUNCTION public.create_order(
  p_idempotency_key text,
  p_warehouse_id uuid,
  p_lines jsonb
)
RETURNS TABLE(order_id uuid, order_number bigint, status public.order_status, total numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public
AS $$
DECLARE
  v_org uuid:=public.current_organization_id(); v_customer uuid:=public.current_customer_id();
  v_order public.orders%rowtype; v_existing public.orders%rowtype; v_line jsonb; v_product uuid;
  v_qty integer; v_qty_numeric numeric; v_price numeric(18,2); v_tier public.customer_tier; v_currency text; v_product_status text;
  v_subtotal numeric(18,2):=0; v_available integer; v_cart_id uuid;
BEGIN
  IF v_org IS NULL OR v_customer IS NULL THEN RAISE EXCEPTION USING errcode='42501',message='authenticated customer context required'; END IF;
  IF p_idempotency_key IS NULL OR length(trim(p_idempotency_key))<16 OR length(trim(p_idempotency_key))>128 THEN RAISE EXCEPTION USING errcode='22023',message='invalid idempotency key'; END IF;
  IF p_lines IS NULL OR jsonb_typeof(p_lines)<>'array' OR jsonb_array_length(p_lines)=0 OR jsonb_array_length(p_lines)>100 THEN RAISE EXCEPTION USING errcode='22023',message='order lines required'; END IF;
  IF EXISTS(SELECT 1 FROM jsonb_array_elements(p_lines) AS line GROUP BY line->>'product_id' HAVING count(*)>1) THEN RAISE EXCEPTION USING errcode='22023',message='duplicate product line'; END IF;
  SELECT c.tier INTO v_tier FROM public.customers c WHERE c.id=v_customer AND c.organization_id=v_org AND c.is_active;
  IF v_tier IS NULL THEN RAISE EXCEPTION USING errcode='42501',message='active customer required'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(v_org::text||':'||trim(p_idempotency_key),0));
  SELECT * INTO v_existing FROM public.orders WHERE organization_id=v_org AND idempotency_key=trim(p_idempotency_key);
  IF FOUND THEN
    IF v_existing.customer_id<>v_customer OR v_existing.warehouse_id<>p_warehouse_id THEN RAISE EXCEPTION USING errcode='40001',message='idempotency key payload conflict'; END IF;
    RETURN QUERY SELECT v_existing.id,v_existing.order_number,v_existing.status,v_existing.total; RETURN;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.warehouses w WHERE w.id=p_warehouse_id AND w.organization_id=v_org AND w.is_active) THEN RAISE EXCEPTION USING errcode='42501',message='warehouse not available'; END IF;
  FOR v_line IN SELECT value FROM jsonb_array_elements(p_lines) LOOP
    BEGIN v_qty_numeric:=(v_line->>'quantity')::numeric; v_product:=(v_line->>'product_id')::uuid; EXCEPTION WHEN invalid_text_representation OR numeric_value_out_of_range THEN RAISE EXCEPTION USING errcode='22023',message='invalid product or quantity'; END;
    IF v_qty_numeric IS NULL OR v_qty_numeric<>trunc(v_qty_numeric) OR v_qty_numeric<=0 OR v_qty_numeric>10000 THEN RAISE EXCEPTION USING errcode='22023',message='quantity must be a positive integer not exceeding 10000'; END IF;
    v_qty:=v_qty_numeric::integer;
    SELECT p.status INTO v_product_status FROM public.products p WHERE p.id=v_product AND p.organization_id=v_org;
    IF NOT FOUND OR v_product_status<>'active' THEN RAISE EXCEPTION USING errcode='P0002',message='product not available'; END IF;
    SELECT pp.amount,pl.currency INTO v_price,v_currency FROM public.product_prices pp JOIN public.price_lists pl ON pl.id=pp.price_list_id
    WHERE pp.organization_id=v_org AND pp.product_id=v_product AND pl.organization_id=v_org AND pl.tier=v_tier AND pl.is_active
      AND pp.valid_from<=now() AND (pp.valid_to IS NULL OR pp.valid_to>now()) ORDER BY pp.valid_from DESC LIMIT 1;
    IF v_price IS NULL THEN RAISE EXCEPTION USING errcode='P0001',message='authorized price unavailable'; END IF;
    SELECT ib.quantity INTO v_available FROM public.inventory_balances ib WHERE ib.organization_id=v_org AND ib.warehouse_id=p_warehouse_id AND ib.product_id=v_product FOR UPDATE;
    IF NOT FOUND OR v_available<v_qty THEN RAISE EXCEPTION USING errcode='P0001',message='insufficient stock'; END IF;
    v_subtotal:=v_subtotal+(v_price*v_qty);
  END LOOP;
  INSERT INTO public.orders(organization_id,customer_id,warehouse_id,status,currency,subtotal,total,idempotency_key,created_by)
  VALUES(v_org,v_customer,p_warehouse_id,'pending',coalesce(v_currency,'YER'),v_subtotal,v_subtotal,trim(p_idempotency_key),auth.uid()) RETURNING * INTO v_order;
  FOR v_line IN SELECT value FROM jsonb_array_elements(p_lines) LOOP
    v_product:=(v_line->>'product_id')::uuid; v_qty:=(v_line->>'quantity')::integer;
    SELECT pp.amount INTO v_price FROM public.product_prices pp JOIN public.price_lists pl ON pl.id=pp.price_list_id
    WHERE pp.organization_id=v_org AND pp.product_id=v_product AND pl.organization_id=v_org AND pl.tier=v_tier AND pl.is_active
      AND pp.valid_from<=now() AND (pp.valid_to IS NULL OR pp.valid_to>now()) ORDER BY pp.valid_from DESC LIMIT 1;
    UPDATE public.inventory_balances ib SET quantity=ib.quantity-v_qty,updated_at=now()
    WHERE ib.organization_id=v_org AND ib.warehouse_id=p_warehouse_id AND ib.product_id=v_product AND ib.quantity>=v_qty;
    IF NOT FOUND THEN RAISE EXCEPTION USING errcode='P0001',message='inventory changed; retry order'; END IF;
    INSERT INTO public.inventory_movements(organization_id,warehouse_id,product_id,delta,source_type,source_id,actor_id) VALUES(v_org,p_warehouse_id,v_product,-v_qty,'order',v_order.id,auth.uid());
    INSERT INTO public.order_items(organization_id,order_id,product_id,quantity,unit_price,pricing_tier) VALUES(v_org,v_order.id,v_product,v_qty,v_price,v_tier);
  END LOOP;
  SELECT c.id INTO v_cart_id FROM public.carts c WHERE c.organization_id=v_org AND c.customer_id=v_customer AND c.status='active' FOR UPDATE;
  IF v_cart_id IS NOT NULL THEN
    DELETE FROM public.cart_items ci WHERE ci.organization_id=v_org AND ci.cart_id=v_cart_id;
    UPDATE public.carts c SET status='converted',updated_at=now() WHERE c.id=v_cart_id AND c.organization_id=v_org;
  END IF;
  INSERT INTO public.order_status_history(organization_id,order_id,from_status,to_status,actor_id) VALUES(v_org,v_order.id,NULL,'pending',auth.uid());
  INSERT INTO public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload) VALUES(v_org,'order',v_order.id,'order.created',jsonb_build_object('order_id',v_order.id,'order_number',v_order.order_number));
  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata) VALUES(v_org,auth.uid(),'order.create','order',v_order.id,'success',jsonb_build_object('order_number',v_order.order_number,'cart_converted',v_cart_id IS NOT NULL));
  RETURN QUERY SELECT v_order.id,v_order.order_number,v_order.status,v_order.total;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_purchase_order(
  p_supplier_id uuid,p_warehouse_id uuid,p_idempotency_key text,p_lines jsonb,p_currency text DEFAULT 'YER',p_notes text DEFAULT NULL
)
RETURNS TABLE(purchase_order_id uuid,purchase_order_number bigint,status public.purchase_order_status,total numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public
AS $$
DECLARE o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); po public.purchase_orders%rowtype; existing public.purchase_orders%rowtype;
  l jsonb; pid uuid; qty numeric; cost numeric; total numeric:=0; key text:=trim(coalesce(p_idempotency_key,'')); currency text:=upper(trim(coalesce(p_currency,''))); existing_count integer;
BEGIN
  IF o IS NULL OR r NOT IN('owner','admin','warehouse') THEN RAISE EXCEPTION USING errcode='42501',message='purchasing access required'; END IF;
  IF length(key)<16 OR length(key)>128 THEN RAISE EXCEPTION USING errcode='22023',message='invalid idempotency key'; END IF;
  IF p_lines IS NULL OR jsonb_typeof(p_lines)<>'array' OR jsonb_array_length(p_lines)=0 OR jsonb_array_length(p_lines)>100 THEN RAISE EXCEPTION USING errcode='22023',message='purchase lines required'; END IF;
  IF currency !~ '^[A-Z]{3}$' THEN RAISE EXCEPTION USING errcode='22023',message='invalid currency'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(o::text||':purchase:'||key,0));
  SELECT * INTO existing FROM public.purchase_orders WHERE organization_id=o AND idempotency_key=key;
  IF FOUND THEN
    SELECT count(*) INTO existing_count FROM public.purchase_order_items WHERE organization_id=o AND purchase_order_id=existing.id;
    IF existing.supplier_id<>p_supplier_id OR existing.warehouse_id<>p_warehouse_id OR existing.currency<>currency OR coalesce(existing.notes,'')<>coalesce(nullif(trim(p_notes),''),'') OR existing_count<>jsonb_array_length(p_lines) THEN RAISE EXCEPTION USING errcode='40001',message='idempotency key payload conflict'; END IF;
    RETURN QUERY SELECT existing.id,existing.purchase_order_number,existing.status,existing.total; RETURN;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.suppliers s WHERE s.id=p_supplier_id AND s.organization_id=o AND s.is_active) THEN RAISE EXCEPTION USING errcode='P0002',message='supplier not found'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.warehouses w WHERE w.id=p_warehouse_id AND w.organization_id=o AND w.is_active) THEN RAISE EXCEPTION USING errcode='P0002',message='warehouse not found'; END IF;
  IF EXISTS(SELECT 1 FROM jsonb_array_elements(p_lines) x GROUP BY x->>'product_id' HAVING count(*)>1) THEN RAISE EXCEPTION USING errcode='22023',message='duplicate product line'; END IF;
  FOR l IN SELECT value FROM jsonb_array_elements(p_lines) LOOP
    BEGIN pid:=(l->>'product_id')::uuid; qty:=(l->>'quantity')::numeric; cost:=(l->>'unit_cost')::numeric; EXCEPTION WHEN invalid_text_representation OR numeric_value_out_of_range THEN RAISE EXCEPTION USING errcode='22023',message='invalid purchase line'; END;
    IF NOT EXISTS(SELECT 1 FROM public.products p WHERE p.id=pid AND p.organization_id=o) OR qty IS NULL OR qty<>trunc(qty) OR qty<=0 OR qty>100000 OR cost IS NULL OR cost::text IN('NaN','Infinity','-Infinity') OR cost<0 OR cost>99999999999999.99 THEN RAISE EXCEPTION USING errcode='22023',message='invalid product, quantity or unit cost'; END IF;
    total:=total+round(cost,2)*qty;
    IF total>9999999999999999.99 THEN RAISE EXCEPTION USING errcode='22003',message='purchase total exceeds supported range'; END IF;
  END LOOP;
  INSERT INTO public.purchase_orders(organization_id,supplier_id,warehouse_id,status,currency,subtotal,total,idempotency_key,notes,created_by)
  VALUES(o,p_supplier_id,p_warehouse_id,'draft',currency,total,total,key,nullif(trim(p_notes),''),auth.uid()) RETURNING * INTO po;
  FOR l IN SELECT value FROM jsonb_array_elements(p_lines) LOOP
    INSERT INTO public.purchase_order_items(organization_id,purchase_order_id,product_id,quantity_ordered,unit_cost)
    VALUES(o,po.id,(l->>'product_id')::uuid,(l->>'quantity')::integer,round((l->>'unit_cost')::numeric,2));
  END LOOP;
  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata) VALUES(o,auth.uid(),'purchase_order.create','purchase_order',po.id,'success',jsonb_build_object('supplier_id',p_supplier_id,'warehouse_id',p_warehouse_id,'purchase_order_number',po.purchase_order_number));
  INSERT INTO public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload) VALUES(o,'purchase_order',po.id,'purchase_order.created',jsonb_build_object('purchase_order_id',po.id,'purchase_order_number',po.purchase_order_number));
  RETURN QUERY SELECT po.id,po.purchase_order_number,po.status,po.total;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_staff_dashboard_metrics()
RETURNS TABLE(orders_total bigint,orders_pending bigint,orders_confirmed bigint,orders_preparing bigint,orders_ready bigint,orders_completed bigint,orders_cancelled bigint,completed_sales numeric,active_customers bigint,active_products bigint,available_stock numeric,receivables_issued numeric)
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_catalog
AS $$
DECLARE o uuid:=public.current_organization_id(); rec numeric:=0;
BEGIN
  IF o IS NULL THEN RETURN QUERY SELECT 0::bigint,0::bigint,0::bigint,0::bigint,0::bigint,0::bigint,0::bigint,0::numeric,0::bigint,0::bigint,0::numeric,0::numeric; RETURN; END IF;
  IF to_regclass('public.operational_invoices') IS NOT NULL THEN EXECUTE 'select coalesce(sum(total),0) from public.operational_invoices where organization_id=$1 and status=''issued''' INTO rec USING o; END IF;
  RETURN QUERY SELECT (select count(*) from public.orders x where x.organization_id=o),(select count(*) from public.orders x where x.organization_id=o and x.status='pending'),(select count(*) from public.orders x where x.organization_id=o and x.status='confirmed'),(select count(*) from public.orders x where x.organization_id=o and x.status='preparing'),(select count(*) from public.orders x where x.organization_id=o and x.status='ready'),(select count(*) from public.orders x where x.organization_id=o and x.status='completed'),(select count(*) from public.orders x where x.organization_id=o and x.status='cancelled'),coalesce((select sum(x.total) from public.orders x where x.organization_id=o and x.status='completed'),0),(select count(*) from public.customers x where x.organization_id=o and x.is_active),(select count(*) from public.products x where x.organization_id=o and x.status='active'),coalesce((select sum(x.quantity) from public.inventory_balances x where x.organization_id=o),0),rec;
END;
$$;

ALTER FUNCTION public.adjust_inventory(uuid,uuid,integer,text) SET search_path='public';
ALTER FUNCTION public.stage_product_import(text,text,jsonb) SET search_path='public';
ALTER FUNCTION public.set_product_price(uuid,public.customer_tier,numeric,text) SET search_path='public';
ALTER FUNCTION public.commit_product_import(uuid,uuid) SET search_path='public';
ALTER FUNCTION public.begin_product_import(text,text,integer) SET search_path='public';
ALTER FUNCTION public.stage_product_import_chunk(uuid,integer,jsonb) SET search_path='public';
ALTER FUNCTION public.finalize_product_import(uuid) SET search_path='public';
ALTER FUNCTION public.create_customer_invitation(uuid,text,integer) SET search_path='public,pg_catalog';
ALTER FUNCTION public.revoke_customer_invitation(uuid) SET search_path='public,pg_catalog';
ALTER FUNCTION public.accept_customer_invitation(text) SET search_path='public,pg_catalog';

REVOKE ALL ON FUNCTION public.get_catalog(text,uuid,integer,integer) FROM PUBLIC,anon,authenticated;

CREATE INDEX IF NOT EXISTS cash_accounts_branch_org_fk_idx ON public.cash_accounts(branch_id,organization_id);
CREATE INDEX IF NOT EXISTS cash_transactions_account_org_fk_idx ON public.cash_transactions(cash_account_id,organization_id);
CREATE INDEX IF NOT EXISTS expenses_branch_org_fk_idx ON public.expenses(branch_id,organization_id);
CREATE INDEX IF NOT EXISTS expenses_cash_account_org_fk_idx ON public.expenses(cash_account_id,organization_id);
CREATE INDEX IF NOT EXISTS operational_invoice_items_invoice_org_fk_idx ON public.operational_invoice_items(invoice_id,organization_id);
CREATE INDEX IF NOT EXISTS operational_invoice_items_product_org_fk_idx ON public.operational_invoice_items(product_id,organization_id);
CREATE INDEX IF NOT EXISTS operational_invoice_items_org_fk_idx ON public.operational_invoice_items(organization_id);
CREATE INDEX IF NOT EXISTS operational_invoices_customer_org_fk_idx ON public.operational_invoices(customer_id,organization_id);
CREATE INDEX IF NOT EXISTS operational_invoices_order_org_fk_idx ON public.operational_invoices(order_id,organization_id);
CREATE INDEX IF NOT EXISTS operational_invoices_org_fk_idx ON public.operational_invoices(organization_id);
CREATE INDEX IF NOT EXISTS payments_cash_account_org_fk_idx ON public.payments(cash_account_id,organization_id);
CREATE INDEX IF NOT EXISTS payments_invoice_org_fk_idx ON public.payments(invoice_id,organization_id);
CREATE INDEX IF NOT EXISTS purchase_order_items_product_org_fk_idx ON public.purchase_order_items(product_id,organization_id);
CREATE INDEX IF NOT EXISTS purchase_order_items_purchase_order_org_fk_idx ON public.purchase_order_items(purchase_order_id,organization_id);
CREATE INDEX IF NOT EXISTS purchase_order_items_org_fk_idx ON public.purchase_order_items(organization_id);
CREATE INDEX IF NOT EXISTS purchase_orders_supplier_org_fk_idx ON public.purchase_orders(supplier_id,organization_id);
CREATE INDEX IF NOT EXISTS purchase_orders_warehouse_org_fk_idx ON public.purchase_orders(warehouse_id,organization_id);
CREATE INDEX IF NOT EXISTS purchase_orders_org_fk_idx ON public.purchase_orders(organization_id);
CREATE INDEX IF NOT EXISTS purchase_receipt_items_purchase_order_item_org_fk_idx ON public.purchase_receipt_items(purchase_order_item_id,organization_id);
CREATE INDEX IF NOT EXISTS purchase_receipt_items_receipt_org_fk_idx ON public.purchase_receipt_items(receipt_id,organization_id);
CREATE INDEX IF NOT EXISTS purchase_receipt_items_product_org_fk_idx ON public.purchase_receipt_items(product_id,organization_id);
CREATE INDEX IF NOT EXISTS purchase_receipt_items_org_fk_idx ON public.purchase_receipt_items(organization_id);
CREATE INDEX IF NOT EXISTS purchase_receipts_purchase_order_org_fk_idx ON public.purchase_receipts(purchase_order_id,organization_id);
CREATE INDEX IF NOT EXISTS purchase_receipts_warehouse_org_fk_idx ON public.purchase_receipts(warehouse_id,organization_id);
CREATE INDEX IF NOT EXISTS purchase_receipts_org_fk_idx ON public.purchase_receipts(organization_id);

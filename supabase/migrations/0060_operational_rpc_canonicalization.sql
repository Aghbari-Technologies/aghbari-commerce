-- Canonical operational RPC implementations mirrored from the verified live contract.
-- All mutating functions are tenant-scoped SECURITY DEFINER functions with a fixed search_path.

CREATE OR REPLACE FUNCTION public.create_supplier(p_name text,p_phone text DEFAULT NULL,p_email text DEFAULT NULL,p_address text DEFAULT NULL)
RETURNS public.suppliers LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); s public.suppliers%rowtype;
BEGIN
 IF o IS NULL OR r NOT IN('owner','admin','warehouse') THEN RAISE EXCEPTION USING errcode='42501'; END IF;
 IF nullif(trim(p_name),'') IS NULL THEN RAISE EXCEPTION USING errcode='22023'; END IF;
 INSERT INTO public.suppliers(organization_id,name,phone,email,address) VALUES(o,trim(p_name),nullif(trim(p_phone),''),nullif(trim(p_email),''),nullif(trim(p_address),'')) RETURNING * INTO s;
 RETURN s;
END $$;

CREATE OR REPLACE FUNCTION public.create_purchase_order(p_supplier_id uuid,p_warehouse_id uuid,p_idempotency_key text,p_lines jsonb,p_currency text DEFAULT 'YER',p_notes text DEFAULT NULL)
RETURNS TABLE(purchase_order_id uuid,purchase_order_number bigint,status public.purchase_order_status,total numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); po public.purchase_orders%rowtype; l jsonb; pid uuid; qty numeric; cost numeric; total numeric:=0;
BEGIN
 IF o IS NULL OR r NOT IN('owner','admin','warehouse') THEN RAISE EXCEPTION USING errcode='42501'; END IF;
 IF length(trim(coalesce(p_idempotency_key,'')))<16 OR p_lines IS NULL OR jsonb_typeof(p_lines)<>'array' OR jsonb_array_length(p_lines)=0 OR jsonb_array_length(p_lines)>100 THEN RAISE EXCEPTION USING errcode='22023'; END IF;
 SELECT * INTO po FROM public.purchase_orders WHERE organization_id=o AND idempotency_key=trim(p_idempotency_key);
 IF FOUND THEN RETURN QUERY SELECT po.id,po.purchase_order_number,po.status,po.total; RETURN; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.suppliers WHERE id=p_supplier_id AND organization_id=o AND is_active) OR NOT EXISTS(SELECT 1 FROM public.warehouses WHERE id=p_warehouse_id AND organization_id=o AND is_active) THEN RAISE EXCEPTION USING errcode='P0002'; END IF;
 FOR l IN SELECT value FROM jsonb_array_elements(p_lines) LOOP
  pid:=(l->>'product_id')::uuid; qty:=(l->>'quantity')::numeric; cost:=round((l->>'unit_cost')::numeric,2);
  IF NOT EXISTS(SELECT 1 FROM public.products WHERE id=pid AND organization_id=o) OR qty IS NULL OR qty<>trunc(qty) OR qty<=0 OR qty>100000 OR cost IS NULL OR cost<0 THEN RAISE EXCEPTION USING errcode='22023'; END IF;
  total:=total+qty*cost;
 END LOOP;
 INSERT INTO public.purchase_orders(organization_id,supplier_id,warehouse_id,currency,subtotal,total,idempotency_key,notes,created_by) VALUES(o,p_supplier_id,p_warehouse_id,upper(trim(p_currency)),total,total,trim(p_idempotency_key),nullif(trim(p_notes),''),auth.uid()) RETURNING * INTO po;
 FOR l IN SELECT value FROM jsonb_array_elements(p_lines) LOOP
  INSERT INTO public.purchase_order_items(organization_id,purchase_order_id,product_id,quantity_ordered,unit_cost) VALUES(o,po.id,(l->>'product_id')::uuid,(l->>'quantity')::integer,round((l->>'unit_cost')::numeric,2));
 END LOOP;
 RETURN QUERY SELECT po.id,po.purchase_order_number,po.status,po.total;
END $$;

CREATE OR REPLACE FUNCTION public.submit_purchase_order(p_purchase_order_id uuid)
RETURNS public.purchase_orders LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); po public.purchase_orders%rowtype;
BEGIN
 IF o IS NULL OR r NOT IN('owner','admin','warehouse') THEN RAISE EXCEPTION USING errcode='42501'; END IF;
 SELECT * INTO po FROM public.purchase_orders WHERE id=p_purchase_order_id AND organization_id=o FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION USING errcode='P0002'; END IF;
 IF po.status<>'draft' THEN RAISE EXCEPTION USING errcode='22023'; END IF;
 UPDATE public.purchase_orders SET status='submitted',updated_at=now() WHERE id=po.id RETURNING * INTO po; RETURN po;
END $$;

CREATE OR REPLACE FUNCTION public.approve_purchase_order(p_purchase_order_id uuid)
RETURNS public.purchase_orders LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); po public.purchase_orders%rowtype;
BEGIN
 IF o IS NULL OR r NOT IN('owner','admin') THEN RAISE EXCEPTION USING errcode='42501'; END IF;
 SELECT * INTO po FROM public.purchase_orders WHERE id=p_purchase_order_id AND organization_id=o FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION USING errcode='P0002'; END IF;
 IF po.status<>'submitted' THEN RAISE EXCEPTION USING errcode='22023'; END IF;
 UPDATE public.purchase_orders SET status='approved',approved_by=auth.uid(),approved_at=now(),updated_at=now() WHERE id=po.id RETURNING * INTO po; RETURN po;
END $$;

CREATE OR REPLACE FUNCTION public.receive_purchase_order(p_purchase_order_id uuid,p_idempotency_key text,p_lines jsonb,p_notes text DEFAULT NULL)
RETURNS TABLE(receipt_id uuid,receipt_number bigint,purchase_order_id uuid,purchase_order_status public.purchase_order_status,received_total numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); po public.purchase_orders%rowtype; rec public.purchase_receipts%rowtype; l jsonb; item public.purchase_order_items%rowtype; pid uuid; q int; inv int; total numeric:=0;
BEGIN
 IF o IS NULL OR r NOT IN('owner','admin','warehouse') THEN RAISE EXCEPTION USING errcode='42501'; END IF;
 SELECT * INTO po FROM public.purchase_orders WHERE id=p_purchase_order_id AND organization_id=o FOR UPDATE;
 IF NOT FOUND OR po.status NOT IN('approved','partially_received') THEN RAISE EXCEPTION USING errcode='22023'; END IF;
 INSERT INTO public.purchase_receipts(organization_id,purchase_order_id,warehouse_id,idempotency_key,received_by,notes) VALUES(o,po.id,po.warehouse_id,trim(p_idempotency_key),auth.uid(),nullif(trim(p_notes),'')) RETURNING * INTO rec;
 FOR l IN SELECT value FROM jsonb_array_elements(p_lines) LOOP
  pid:=(l->>'product_id')::uuid; q:=(l->>'quantity')::integer;
  SELECT * INTO item FROM public.purchase_order_items WHERE id=(l->>'purchase_order_item_id')::uuid AND organization_id=o AND purchase_order_id=po.id AND product_id=pid FOR UPDATE;
  IF NOT FOUND OR q<=0 OR q>item.quantity_ordered-item.quantity_received THEN RAISE EXCEPTION USING errcode='22023'; END IF;
  INSERT INTO public.inventory_balances(organization_id,warehouse_id,product_id,quantity) VALUES(o,po.warehouse_id,pid,0) ON CONFLICT(warehouse_id,product_id) DO NOTHING;
  SELECT quantity INTO inv FROM public.inventory_balances WHERE warehouse_id=po.warehouse_id AND product_id=pid FOR UPDATE;
  UPDATE public.inventory_balances SET quantity=inv+q,updated_at=now() WHERE warehouse_id=po.warehouse_id AND product_id=pid;
  UPDATE public.purchase_order_items SET quantity_received=quantity_received+q WHERE id=item.id;
  INSERT INTO public.purchase_receipt_items(organization_id,receipt_id,purchase_order_item_id,product_id,quantity_received,unit_cost) VALUES(o,rec.id,item.id,pid,q,item.unit_cost);
  INSERT INTO public.inventory_movements(organization_id,warehouse_id,product_id,delta,source_type,source_id,actor_id) VALUES(o,po.warehouse_id,pid,q,'purchase_receipt',rec.id,auth.uid());
  total:=total+item.unit_cost*q;
 END LOOP;
 UPDATE public.purchase_orders SET status=CASE WHEN NOT EXISTS(SELECT 1 FROM public.purchase_order_items WHERE organization_id=o AND purchase_order_id=po.id AND quantity_received<quantity_ordered) THEN 'received' ELSE 'partially_received' END,updated_at=now() WHERE id=po.id;
 RETURN QUERY SELECT rec.id,rec.receipt_number,po.id,(SELECT status FROM public.purchase_orders WHERE id=po.id),total;
END $$;

CREATE OR REPLACE FUNCTION public.create_customer(p_name text,p_phone text DEFAULT NULL,p_tier public.customer_tier DEFAULT 'retail')
RETURNS public.customers LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); c public.customers%rowtype;
BEGIN
 IF o IS NULL OR r NOT IN('owner','admin','sales') THEN RAISE EXCEPTION USING errcode='42501'; END IF;
 IF nullif(trim(p_name),'') IS NULL THEN RAISE EXCEPTION USING errcode='22023'; END IF;
 INSERT INTO public.customers(organization_id,name,phone,tier) VALUES(o,trim(p_name),nullif(trim(p_phone),''),coalesce(p_tier,'retail')) RETURNING * INTO c; RETURN c;
END $$;

CREATE OR REPLACE FUNCTION public.set_customer_active(p_customer_id uuid,p_is_active boolean)
RETURNS public.customers LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); c public.customers%rowtype;
BEGIN
 IF o IS NULL OR r NOT IN('owner','admin') THEN RAISE EXCEPTION USING errcode='42501'; END IF;
 SELECT * INTO c FROM public.customers WHERE id=p_customer_id AND organization_id=o FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION USING errcode='P0002'; END IF;
 UPDATE public.customers SET is_active=coalesce(p_is_active,false),updated_at=now() WHERE id=c.id RETURNING * INTO c; RETURN c;
END $$;

CREATE OR REPLACE FUNCTION public.set_customer_tier(p_customer_id uuid,p_tier public.customer_tier)
RETURNS public.customers LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); c public.customers%rowtype;
BEGIN
 IF o IS NULL OR r NOT IN('owner','admin') THEN RAISE EXCEPTION USING errcode='42501'; END IF;
 SELECT * INTO c FROM public.customers WHERE id=p_customer_id AND organization_id=o FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION USING errcode='P0002'; END IF;
 UPDATE public.customers SET tier=p_tier,updated_at=now() WHERE id=c.id RETURNING * INTO c; RETURN c;
END $$;

CREATE OR REPLACE FUNCTION public.create_cash_account(p_branch_id uuid,p_name text,p_currency text DEFAULT 'YER',p_opening_balance numeric DEFAULT 0)
RETURNS public.cash_accounts LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); a public.cash_accounts%rowtype;
BEGIN
 IF o IS NULL OR r NOT IN('owner','admin') THEN RAISE EXCEPTION USING errcode='42501'; END IF;
 IF nullif(trim(p_name),'') IS NULL OR p_opening_balance IS NULL OR p_opening_balance<0 OR length(trim(p_currency))<>3 THEN RAISE EXCEPTION USING errcode='22023'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.branches WHERE id=p_branch_id AND organization_id=o AND is_active) THEN RAISE EXCEPTION USING errcode='P0002'; END IF;
 INSERT INTO public.cash_accounts(organization_id,branch_id,name,currency,opening_balance) VALUES(o,p_branch_id,trim(p_name),upper(trim(p_currency)),p_opening_balance) RETURNING * INTO a; RETURN a;
END $$;

CREATE OR REPLACE FUNCTION public.get_cash_account_balances()
RETURNS TABLE(id uuid,name text,currency text,opening_balance numeric,received numeric,spent numeric,current_balance numeric)
LANGUAGE sql STABLE SET search_path=public AS $$
SELECT a.id,a.name,a.currency,a.opening_balance,coalesce(sum(CASE WHEN t.direction='in' THEN t.amount ELSE 0 END),0),coalesce(sum(CASE WHEN t.direction='out' THEN t.amount ELSE 0 END),0),a.opening_balance+coalesce(sum(CASE WHEN t.direction='in' THEN t.amount WHEN t.direction='out' THEN -t.amount ELSE 0 END),0)
FROM public.cash_accounts a LEFT JOIN public.cash_transactions t ON t.organization_id=a.organization_id AND t.cash_account_id=a.id
WHERE a.organization_id=public.current_organization_id() AND public.is_staff() GROUP BY a.id,a.name,a.currency,a.opening_balance
$$;

CREATE OR REPLACE FUNCTION public.record_expense(p_branch_id uuid,p_cash_account_id uuid,p_category text,p_amount numeric,p_currency text DEFAULT 'YER',p_description text DEFAULT NULL,p_expense_date date DEFAULT CURRENT_DATE)
RETURNS public.expenses LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); a public.cash_accounts%rowtype; e public.expenses%rowtype; bal numeric;
BEGIN
 IF o IS NULL OR r NOT IN('owner','admin') THEN RAISE EXCEPTION USING errcode='42501'; END IF;
 SELECT * INTO a FROM public.cash_accounts WHERE id=p_cash_account_id AND organization_id=o AND is_active FOR UPDATE;
 IF NOT FOUND OR p_amount IS NULL OR p_amount<=0 OR a.currency<>upper(trim(p_currency)) THEN RAISE EXCEPTION USING errcode='22023'; END IF;
 SELECT a.opening_balance+coalesce(sum(CASE WHEN direction='in' THEN amount ELSE -amount END),0) INTO bal FROM public.cash_transactions WHERE organization_id=o AND cash_account_id=a.id;
 IF bal<p_amount THEN RAISE EXCEPTION USING errcode='22003'; END IF;
 INSERT INTO public.expenses(organization_id,branch_id,cash_account_id,category,amount,currency,description,expense_date,actor_id) VALUES(o,p_branch_id,p_cash_account_id,trim(p_category),p_amount,upper(trim(p_currency)),nullif(trim(p_description),''),coalesce(p_expense_date,current_date),auth.uid()) RETURNING * INTO e;
 INSERT INTO public.cash_transactions(organization_id,cash_account_id,direction,amount,source_type,source_id,actor_id) VALUES(o,p_cash_account_id,'out',p_amount,'expense',e.id,auth.uid()); RETURN e;
END $$;

CREATE OR REPLACE FUNCTION public.create_invoice_from_order(p_order_id uuid,p_due_at timestamptz DEFAULT NULL)
RETURNS public.operational_invoices LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); ord public.orders%rowtype; inv public.operational_invoices%rowtype; it public.order_items%rowtype;
BEGIN
 IF o IS NULL OR r NOT IN('owner','admin','sales') THEN RAISE EXCEPTION USING errcode='42501'; END IF;
 SELECT * INTO ord FROM public.orders WHERE id=p_order_id AND organization_id=o FOR UPDATE;
 IF NOT FOUND OR ord.status NOT IN('ready','completed') THEN RAISE EXCEPTION USING errcode='22023'; END IF;
 SELECT * INTO inv FROM public.operational_invoices WHERE organization_id=o AND order_id=ord.id; IF FOUND THEN RETURN inv; END IF;
 INSERT INTO public.operational_invoices(organization_id,order_id,customer_id,currency,subtotal,total,due_at,created_by) VALUES(o,ord.id,ord.customer_id,ord.currency,ord.subtotal,ord.total,p_due_at,auth.uid()) RETURNING * INTO inv;
 FOR it IN SELECT * FROM public.order_items WHERE organization_id=o AND order_id=ord.id LOOP
  INSERT INTO public.operational_invoice_items(organization_id,invoice_id,product_id,description,quantity,unit_price) SELECT o,inv.id,it.product_id,p.name,it.quantity,it.unit_price FROM public.products p WHERE p.id=it.product_id AND p.organization_id=o;
 END LOOP;
 RETURN inv;
END $$;

CREATE OR REPLACE FUNCTION public.record_payment(p_invoice_id uuid,p_amount numeric,p_method public.payment_method,p_cash_account_id uuid DEFAULT NULL,p_reference text DEFAULT NULL)
RETURNS public.payments LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); inv public.operational_invoices%rowtype; a public.cash_accounts%rowtype; paid numeric; pay public.payments%rowtype;
BEGIN
 IF o IS NULL OR r NOT IN('owner','admin','sales') THEN RAISE EXCEPTION USING errcode='42501'; END IF;
 SELECT * INTO inv FROM public.operational_invoices WHERE id=p_invoice_id AND organization_id=o FOR UPDATE;
 IF NOT FOUND OR p_amount IS NULL OR p_amount<=0 THEN RAISE EXCEPTION USING errcode='22023'; END IF;
 SELECT coalesce(sum(amount),0) INTO paid FROM public.payments WHERE organization_id=o AND invoice_id=inv.id;
 IF p_amount>inv.total-paid THEN RAISE EXCEPTION USING errcode='22003'; END IF;
 IF p_method='cash' AND p_cash_account_id IS NULL THEN RAISE EXCEPTION USING errcode='22023'; END IF;
 IF p_cash_account_id IS NOT NULL THEN SELECT * INTO a FROM public.cash_accounts WHERE id=p_cash_account_id AND organization_id=o AND is_active FOR UPDATE; IF NOT FOUND OR a.currency<>inv.currency THEN RAISE EXCEPTION USING errcode='22023'; END IF; END IF;
 INSERT INTO public.payments(organization_id,invoice_id,cash_account_id,amount,method,reference,actor_id) VALUES(o,inv.id,p_cash_account_id,p_amount,p_method,nullif(trim(p_reference),''),auth.uid()) RETURNING * INTO pay;
 IF p_cash_account_id IS NOT NULL THEN INSERT INTO public.cash_transactions(organization_id,cash_account_id,direction,amount,source_type,source_id,actor_id) VALUES(o,p_cash_account_id,'in',p_amount,'payment',pay.id,auth.uid()); END IF;
 UPDATE public.operational_invoices SET status=CASE WHEN paid+p_amount>=total THEN 'paid' ELSE 'partially_paid' END,updated_at=now() WHERE id=inv.id; RETURN pay;
END $$;

DO $$
DECLARE r record;
BEGIN
 FOR r IN SELECT * FROM (VALUES
 ('approve_purchase_order','uuid'),('create_cash_account','uuid,text,text,numeric'),('create_customer','text,text,customer_tier'),('create_invoice_from_order','uuid,timestamptz'),('create_purchase_order','uuid,uuid,text,jsonb,text,text'),('create_supplier','text,text,text,text'),('get_cash_account_balances',''),('receive_purchase_order','uuid,text,jsonb,text'),('record_expense','uuid,uuid,text,numeric,text,text,date'),('record_payment','uuid,numeric,payment_method,uuid,text'),('set_customer_active','uuid,boolean'),('set_customer_tier','uuid,customer_tier'),('submit_purchase_order','uuid')) x(name,args) LOOP
  EXECUTE format('REVOKE ALL ON FUNCTION public.%I(%s) FROM PUBLIC',r.name,r.args);
  EXECUTE format('REVOKE ALL ON FUNCTION public.%I(%s) FROM anon',r.name,r.args);
  EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I(%s) TO authenticated',r.name,r.args);
 END LOOP;
END $$;

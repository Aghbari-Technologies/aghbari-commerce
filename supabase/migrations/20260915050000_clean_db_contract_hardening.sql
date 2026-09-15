-- Clean-source replay hardening discovered by run 34920530387.
-- Keep the fixes in a forward migration so production history remains append-only.

-- The SECURITY DEFINER contract requires an explicitly pinned path for these
-- legacy-but-still-exposed command RPCs as well.
ALTER FUNCTION public.adjust_inventory(uuid,uuid,integer,text) SET search_path='';
ALTER FUNCTION public.set_product_price(uuid,public.customer_tier,numeric,text) SET search_path='';

-- Restore the non-negative cash invariant lost when record_expense was
-- rewritten for the empty search_path hardening.
CREATE OR REPLACE FUNCTION public.record_expense(
  p_branch_id uuid,
  p_cash_account_id uuid,
  p_category text,
  p_amount numeric,
  p_currency text DEFAULT 'YER',
  p_description text DEFAULT NULL,
  p_expense_date date DEFAULT current_date
)
RETURNS public.expenses
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=''
AS $$
DECLARE
  v_org uuid := public.current_organization_id();
  v_role public.user_role := public.current_role();
  v_account public.cash_accounts%rowtype;
  v_expense public.expenses%rowtype;
  v_balance numeric(18,2);
BEGIN
  IF v_org IS NULL OR v_role NOT IN ('owner','admin') THEN
    RAISE EXCEPTION USING errcode='42501',message='expense access required';
  END IF;
  IF nullif(trim(p_category),'') IS NULL OR p_amount IS NULL OR p_amount<=0 OR p_amount>9007199254740991 THEN
    RAISE EXCEPTION USING errcode='22023',message='expense category and positive amount are required';
  END IF;
  IF NOT EXISTS(
    SELECT 1 FROM public.branches b
    WHERE b.id=p_branch_id AND b.organization_id=v_org AND b.is_active
  ) THEN
    RAISE EXCEPTION USING errcode='P0002',message='branch not found';
  END IF;
  SELECT * INTO v_account
  FROM public.cash_accounts a
  WHERE a.id=p_cash_account_id AND a.organization_id=v_org AND a.is_active
  FOR UPDATE;
  IF NOT FOUND OR v_account.currency<>upper(trim(coalesce(p_currency,''))) THEN
    RAISE EXCEPTION USING errcode='22023',message='cash account currency mismatch';
  END IF;
  SELECT v_account.opening_balance + coalesce(sum(
    CASE WHEN t.direction='in' THEN t.amount
         WHEN t.direction='out' THEN -t.amount
         ELSE 0 END
  ),0)
  INTO v_balance
  FROM public.cash_transactions t
  WHERE t.organization_id=v_org AND t.cash_account_id=v_account.id;
  IF v_balance < p_amount THEN
    RAISE EXCEPTION USING errcode='22003',message='expense exceeds available cash balance';
  END IF;
  INSERT INTO public.expenses(
    organization_id,branch_id,cash_account_id,category,amount,currency,description,expense_date,actor_id
  )
  VALUES(
    v_org,p_branch_id,p_cash_account_id,trim(p_category),p_amount,upper(trim(p_currency)),
    nullif(trim(p_description),''),coalesce(p_expense_date,current_date),auth.uid()
  ) RETURNING * INTO v_expense;
  INSERT INTO public.cash_transactions(
    organization_id,cash_account_id,direction,amount,source_type,source_id,note,actor_id
  ) VALUES(
    v_org,p_cash_account_id,'out',p_amount,'expense',v_expense.id,v_expense.category,auth.uid()
  );
  INSERT INTO public.audit_events(
    organization_id,actor_id,action,target_type,target_id,result,metadata
  ) VALUES(
    v_org,auth.uid(),'expense.create','expense',v_expense.id,'success',
    jsonb_build_object('amount',p_amount,'category',v_expense.category)
  );
  INSERT INTO public.outbox_events(
    organization_id,aggregate_type,aggregate_id,event_type,payload
  ) VALUES(
    v_org,'expense',v_expense.id,'expense.posted',
    jsonb_build_object('expense_id',v_expense.id,'amount',p_amount)
  );
  RETURN v_expense;
END;
$$;

-- Re-assert the operational indexes as a dedicated replay-safe migration.
-- IF NOT EXISTS makes this harmless if an earlier migration already created
-- any of them, while guaranteeing a fresh source database receives all 25.
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

-- Live-schema compatibility bridge.
-- The production database already exposes the hardened 6-argument idempotent payment RPC.
-- Do not replace it with the older 5-argument source signature.
-- Keep this migration additive and replay-safe.

ALTER FUNCTION public.create_order(text,uuid,jsonb) SET search_path='';
ALTER FUNCTION public.record_payment(uuid,numeric,public.payment_method,uuid,text,text) SET search_path='';
ALTER FUNCTION public.record_expense(uuid,uuid,text,numeric,text,text,date) SET search_path='';
ALTER FUNCTION public.create_purchase_order(uuid,uuid,text,jsonb,text,text) SET search_path='';
ALTER FUNCTION public.receive_purchase_order(uuid,text,jsonb,text) SET search_path='';

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS fn
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public'
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', r.fn);
  END LOOP;
END $$;

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

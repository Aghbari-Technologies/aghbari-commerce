-- Runtime reconciliation for the operational customer/purchasing/finance surface.
-- Canonical source mirror of the already-applied live contract; intentionally idempotent.
-- This migration must remain tenant-scoped and authenticated-only.

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      ('approve_purchase_order','uuid'),
      ('create_cash_account','uuid,text,text,numeric'),
      ('create_customer','text,text,customer_tier'),
      ('create_invoice_from_order','uuid,timestamptz'),
      ('create_purchase_order','uuid,uuid,text,jsonb,text,text'),
      ('create_supplier','text,text,text,text'),
      ('get_cash_account_balances',''),
      ('receive_purchase_order','uuid,text,jsonb,text'),
      ('record_expense','uuid,uuid,text,numeric,text,text,date'),
      ('record_payment','uuid,numeric,payment_method,uuid,text'),
      ('set_customer_active','uuid,boolean'),
      ('set_customer_tier','uuid,customer_tier'),
      ('submit_purchase_order','uuid')
    ) AS x(name,args)
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%I(%s) FROM PUBLIC', r.name, r.args);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I(%s) TO authenticated', r.name, r.args);
  END LOOP;
END $$;

COMMENT ON FUNCTION public.create_cash_account(uuid,text,text,numeric) IS
'Owner/admin-only tenant-scoped cash account command; authenticated execution only.';
COMMENT ON FUNCTION public.record_expense(uuid,uuid,text,numeric,text,text,date) IS
'Owner/admin-only tenant-scoped expense command with nonnegative cash-balance enforcement and audit/outbox evidence.';

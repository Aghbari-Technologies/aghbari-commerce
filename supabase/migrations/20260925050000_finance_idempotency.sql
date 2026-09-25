-- Finance transactional idempotency.
-- Existing payment/expense rows are preserved; new writes become replay-safe per organization.

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS idempotency_key text;
UPDATE public.payments SET idempotency_key = 'legacy-payment-' || id::text WHERE idempotency_key IS NULL;
ALTER TABLE public.payments ALTER COLUMN idempotency_key SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS payments_org_idempotency_key_idx ON public.payments(organization_id,idempotency_key);

ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS idempotency_key text;
UPDATE public.expenses SET idempotency_key = 'legacy-expense-' || id::text WHERE idempotency_key IS NULL;
ALTER TABLE public.expenses ALTER COLUMN idempotency_key SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS expenses_org_idempotency_key_idx ON public.expenses(organization_id,idempotency_key);

DROP FUNCTION IF EXISTS public.record_payment(uuid,numeric,public.payment_method,uuid,text);
CREATE OR REPLACE FUNCTION public.record_payment(
  p_invoice_id uuid,
  p_amount numeric,
  p_method public.payment_method,
  p_cash_account_id uuid DEFAULT NULL,
  p_reference text DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
)
RETURNS public.payments
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_org uuid:=public.current_organization_id();
  v_role public.user_role:=public.current_role();
  v_key text:=trim(coalesce(p_idempotency_key,''));
  v_invoice public.operational_invoices%rowtype;
  v_account public.cash_accounts%rowtype;
  v_paid numeric(18,2);
  v_payment public.payments%rowtype;
  v_existing public.payments%rowtype;
BEGIN
  IF v_org IS NULL OR v_role NOT IN ('owner','admin','sales') THEN RAISE EXCEPTION USING errcode='42501',message='payment access required'; END IF;
  IF length(v_key)<16 OR length(v_key)>200 THEN RAISE EXCEPTION USING errcode='22023',message='invalid idempotency key'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(v_org::text||':payment:'||v_key,0));
  SELECT * INTO v_existing FROM public.payments WHERE organization_id=v_org AND idempotency_key=v_key;
  IF FOUND THEN
    IF v_existing.invoice_id<>p_invoice_id
       OR v_existing.amount<>p_amount
       OR v_existing.method<>p_method
       OR coalesce(v_existing.cash_account_id,'00000000-0000-0000-0000-000000000000'::uuid)<>coalesce(p_cash_account_id,'00000000-0000-0000-0000-000000000000'::uuid)
       OR coalesce(v_existing.reference,'')<>coalesce(trim(p_reference),'') THEN
      RAISE EXCEPTION USING errcode='40001',message='idempotency key payload conflict';
    END IF;
    RETURN v_existing;
  END IF;
  IF p_amount IS NULL OR p_amount<=0 THEN RAISE EXCEPTION USING errcode='22023',message='payment amount must be positive'; END IF;
  SELECT * INTO v_invoice FROM public.operational_invoices WHERE id=p_invoice_id AND organization_id=v_org FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION USING errcode='P0002',message='invoice not found'; END IF;
  IF v_invoice.status='void' THEN RAISE EXCEPTION USING errcode='22023',message='void invoice cannot receive payment'; END IF;
  SELECT coalesce(sum(amount),0) INTO v_paid FROM public.payments WHERE organization_id=v_org AND invoice_id=v_invoice.id;
  IF p_amount > v_invoice.total-v_paid THEN RAISE EXCEPTION USING errcode='22003',message='payment exceeds invoice balance'; END IF;
  IF p_method='cash' THEN
    IF p_cash_account_id IS NULL THEN RAISE EXCEPTION USING errcode='22023',message='cash account required for cash payment'; END IF;
    SELECT * INTO v_account FROM public.cash_accounts WHERE id=p_cash_account_id AND organization_id=v_org AND is_active FOR UPDATE;
    IF NOT FOUND OR v_account.currency<>v_invoice.currency THEN RAISE EXCEPTION USING errcode='22023',message='cash account mismatch'; END IF;
  ELSIF p_cash_account_id IS NOT NULL THEN
    SELECT * INTO v_account FROM public.cash_accounts WHERE id=p_cash_account_id AND organization_id=v_org AND is_active FOR UPDATE;
    IF NOT FOUND OR v_account.currency<>v_invoice.currency THEN RAISE EXCEPTION USING errcode='22023',message='cash account mismatch'; END IF;
  END IF;
  INSERT INTO public.payments(organization_id,invoice_id,cash_account_id,amount,method,reference,idempotency_key,actor_id)
  VALUES(v_org,v_invoice.id,p_cash_account_id,p_amount,p_method,nullif(trim(p_reference),''),v_key,auth.uid()) RETURNING * INTO v_payment;
  IF p_cash_account_id IS NOT NULL THEN
    INSERT INTO public.cash_transactions(organization_id,cash_account_id,direction,amount,source_type,source_id,note,actor_id)
    VALUES(v_org,p_cash_account_id,'in',p_amount,'payment',v_payment.id,nullif(trim(p_reference),''),auth.uid());
  END IF;
  SELECT coalesce(sum(amount),0) INTO v_paid FROM public.payments WHERE organization_id=v_org AND invoice_id=v_invoice.id;
  UPDATE public.operational_invoices SET status=CASE WHEN v_paid>=total THEN 'paid' ELSE 'partially_paid' END,updated_at=now() WHERE id=v_invoice.id;
  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  VALUES(v_org,auth.uid(),'payment.create','payment',v_payment.id,'success',jsonb_build_object('invoice_id',v_invoice.id,'amount',p_amount,'method',p_method,'idempotency_key',v_key));
  INSERT INTO public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload)
  VALUES(v_org,'operational_invoice',v_invoice.id,'payment.received',jsonb_build_object('invoice_id',v_invoice.id,'payment_id',v_payment.id,'amount',p_amount));
  RETURN v_payment;
END; $$;

DROP FUNCTION IF EXISTS public.record_expense(uuid,uuid,text,numeric,text,text,date);
CREATE OR REPLACE FUNCTION public.record_expense(
  p_branch_id uuid,
  p_cash_account_id uuid,
  p_category text,
  p_amount numeric,
  p_currency text DEFAULT 'YER',
  p_description text DEFAULT NULL,
  p_expense_date date DEFAULT current_date,
  p_idempotency_key text DEFAULT NULL
)
RETURNS public.expenses
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_org uuid:=public.current_organization_id();
  v_role public.user_role:=public.current_role();
  v_key text:=trim(coalesce(p_idempotency_key,''));
  v_account public.cash_accounts%rowtype;
  v_expense public.expenses%rowtype;
  v_existing public.expenses%rowtype;
  v_date date:=coalesce(p_expense_date,current_date);
BEGIN
  IF v_org IS NULL OR v_role NOT IN ('owner','admin') THEN RAISE EXCEPTION USING errcode='42501',message='expense access required'; END IF;
  IF length(v_key)<16 OR length(v_key)>200 THEN RAISE EXCEPTION USING errcode='22023',message='invalid idempotency key'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(v_org::text||':expense:'||v_key,0));
  SELECT * INTO v_existing FROM public.expenses WHERE organization_id=v_org AND idempotency_key=v_key;
  IF FOUND THEN
    IF v_existing.branch_id<>p_branch_id
       OR v_existing.cash_account_id<>p_cash_account_id
       OR v_existing.category<>trim(coalesce(p_category,''))
       OR v_existing.amount<>p_amount
       OR v_existing.currency<>upper(trim(coalesce(p_currency,'')))
       OR coalesce(v_existing.description,'')<>coalesce(trim(p_description),'')
       OR v_existing.expense_date<>v_date THEN
      RAISE EXCEPTION USING errcode='40001',message='idempotency key payload conflict';
    END IF;
    RETURN v_existing;
  END IF;
  IF nullif(trim(p_category),'') IS NULL OR p_amount IS NULL OR p_amount<=0 THEN RAISE EXCEPTION USING errcode='22023',message='expense category and positive amount are required'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.branches WHERE id=p_branch_id AND organization_id=v_org AND is_active) THEN RAISE EXCEPTION USING errcode='P0002',message='branch not found'; END IF;
  SELECT * INTO v_account FROM public.cash_accounts WHERE id=p_cash_account_id AND organization_id=v_org AND is_active FOR UPDATE;
  IF NOT FOUND OR v_account.currency<>upper(trim(coalesce(p_currency,''))) THEN RAISE EXCEPTION USING errcode='22023',message='cash account currency mismatch'; END IF;
  INSERT INTO public.expenses(organization_id,branch_id,cash_account_id,category,amount,currency,description,expense_date,idempotency_key,actor_id)
  VALUES(v_org,p_branch_id,p_cash_account_id,trim(p_category),p_amount,upper(trim(p_currency)),nullif(trim(p_description),''),v_date,v_key,auth.uid()) RETURNING * INTO v_expense;
  INSERT INTO public.cash_transactions(organization_id,cash_account_id,direction,amount,source_type,source_id,note,actor_id)
  VALUES(v_org,p_cash_account_id,'out',p_amount,'expense',v_expense.id,v_expense.category,auth.uid());
  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  VALUES(v_org,auth.uid(),'expense.create','expense',v_expense.id,'success',jsonb_build_object('amount',p_amount,'category',v_expense.category,'idempotency_key',v_key));
  INSERT INTO public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload)
  VALUES(v_org,'expense',v_expense.id,'expense.posted',jsonb_build_object('expense_id',v_expense.id,'amount',p_amount));
  RETURN v_expense;
END; $$;

REVOKE ALL ON FUNCTION public.record_payment(uuid,numeric,public.payment_method,uuid,text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_payment(uuid,numeric,public.payment_method,uuid,text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.record_payment(uuid,numeric,public.payment_method,uuid,text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.record_expense(uuid,uuid,text,numeric,text,text,date,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_expense(uuid,uuid,text,numeric,text,text,date,text) FROM anon;
GRANT EXECUTE ON FUNCTION public.record_expense(uuid,uuid,text,numeric,text,text,date,text) TO authenticated;

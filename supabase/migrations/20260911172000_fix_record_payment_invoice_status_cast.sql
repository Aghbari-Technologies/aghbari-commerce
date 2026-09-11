-- Correct the invoice status enum assignment in record_payment without changing policy/RLS behavior.
CREATE OR REPLACE FUNCTION public.record_payment(p_invoice_id uuid,p_amount numeric,p_method public.payment_method,p_cash_account_id uuid DEFAULT NULL,p_reference text DEFAULT NULL)
RETURNS public.payments LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_org uuid:=public.current_organization_id(); v_role public.user_role:=public.current_role(); v_invoice public.operational_invoices%rowtype; v_account public.cash_accounts%rowtype; v_paid numeric(18,2); v_payment public.payments%rowtype;
BEGIN
  IF v_org IS NULL OR v_role NOT IN ('owner','admin','sales') THEN RAISE EXCEPTION USING errcode='42501',message='payment access required'; END IF;
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
  INSERT INTO public.payments(organization_id,invoice_id,cash_account_id,amount,method,reference,actor_id) VALUES(v_org,v_invoice.id,p_cash_account_id,p_amount,p_method,nullif(trim(p_reference),''),auth.uid()) RETURNING * INTO v_payment;
  IF p_cash_account_id IS NOT NULL THEN INSERT INTO public.cash_transactions(organization_id,cash_account_id,direction,amount,source_type,source_id,note,actor_id) VALUES(v_org,p_cash_account_id,'in',p_amount,'payment',v_payment.id,nullif(trim(p_reference),''),auth.uid()); END IF;
  SELECT coalesce(sum(amount),0) INTO v_paid FROM public.payments WHERE organization_id=v_org AND invoice_id=v_invoice.id;
  UPDATE public.operational_invoices SET status=CASE WHEN v_paid>=total THEN 'paid'::public.invoice_status ELSE 'partially_paid'::public.invoice_status END,updated_at=now() WHERE id=v_invoice.id;
  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata) VALUES(v_org,auth.uid(),'payment.create','payment',v_payment.id,'success',jsonb_build_object('invoice_id',v_invoice.id,'amount',p_amount,'method',p_method));
  INSERT INTO public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload) VALUES(v_org,'operational_invoice',v_invoice.id,'payment.received',jsonb_build_object('invoice_id',v_invoice.id,'payment_id',v_payment.id,'amount',p_amount));
  RETURN v_payment;
END; $$;

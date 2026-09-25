-- Canonical finance payment command: server-authoritative, idempotent, auditable and atomic.
-- This closes the live six-argument record_payment contract drift and removes the
-- invalid numeric isfinite() call discovered in the current database function.
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS idempotency_key text,
  ADD COLUMN IF NOT EXISTS idempotency_payload_hash text;

CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_organization_idempotency_key
  ON public.payments(organization_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE OR REPLACE FUNCTION public.record_payment(
  p_invoice_id uuid,
  p_amount numeric,
  p_method public.payment_method,
  p_cash_account_id uuid DEFAULT NULL,
  p_reference text DEFAULT NULL,
  p_idempotency_key text
)
RETURNS public.payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_org uuid := public.current_organization_id();
  v_role public.user_role := public.current_role();
  v_invoice public.operational_invoices%rowtype;
  v_account public.cash_accounts%rowtype;
  v_payment public.payments%rowtype;
  v_existing public.payments%rowtype;
  v_paid numeric := 0;
  v_key text := nullif(pg_catalog.btrim(p_idempotency_key), '');
  v_reference text := nullif(pg_catalog.btrim(p_reference), '');
  v_payload_hash text;
BEGIN
  IF auth.uid() IS NULL OR v_org IS NULL OR v_role NOT IN ('owner','admin','sales') THEN
    RAISE EXCEPTION USING errcode='42501', message='payment access required';
  END IF;

  IF v_key IS NULL OR pg_catalog.length(v_key) < 16 OR pg_catalog.length(v_key) > 128 THEN
    RAISE EXCEPTION USING errcode='22023', message='payment idempotency key required';
  END IF;

  IF p_amount IS NULL
     OR p_amount::text IN ('Infinity','-Infinity','NaN')
     OR p_amount <= 0
     OR p_amount > 9007199254740991 THEN
    RAISE EXCEPTION USING errcode='22023', message='invalid payment amount';
  END IF;

  IF v_reference IS NOT NULL AND pg_catalog.length(v_reference) > 200 THEN
    RAISE EXCEPTION USING errcode='22023', message='payment reference too long';
  END IF;

  v_payload_hash := pg_catalog.md5(
    pg_catalog.jsonb_build_object(
      'invoice_id', p_invoice_id,
      'amount', p_amount,
      'method', p_method::text,
      'cash_account_id', p_cash_account_id,
      'reference', v_reference
    )::text
  );

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_org::text || ':payment:' || v_key, 0)
  );

  SELECT *
  INTO v_existing
  FROM public.payments p
  WHERE p.organization_id = v_org
    AND p.idempotency_key = v_key
  LIMIT 1;

  IF FOUND THEN
    IF v_existing.idempotency_payload_hash IS DISTINCT FROM v_payload_hash THEN
      RAISE EXCEPTION USING errcode='40001', message='payment idempotency payload conflict';
    END IF;
    RETURN v_existing;
  END IF;

  SELECT *
  INTO v_invoice
  FROM public.operational_invoices i
  WHERE i.id = p_invoice_id
    AND i.organization_id = v_org
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING errcode='P0002', message='invoice not found';
  END IF;

  IF v_invoice.status = 'void' THEN
    RAISE EXCEPTION USING errcode='22023', message='invoice not payable';
  END IF;

  SELECT coalesce(sum(p.amount), 0)
  INTO v_paid
  FROM public.payments p
  WHERE p.organization_id = v_org
    AND p.invoice_id = v_invoice.id;

  IF p_amount > v_invoice.total - v_paid THEN
    RAISE EXCEPTION USING errcode='22003', message='payment exceeds invoice balance';
  END IF;

  IF p_method = 'cash' AND p_cash_account_id IS NULL THEN
    RAISE EXCEPTION USING errcode='22023', message='cash account required';
  END IF;

  IF p_cash_account_id IS NOT NULL THEN
    SELECT *
    INTO v_account
    FROM public.cash_accounts a
    WHERE a.id = p_cash_account_id
      AND a.organization_id = v_org
      AND a.is_active
    FOR UPDATE;

    IF NOT FOUND OR v_account.currency <> v_invoice.currency THEN
      RAISE EXCEPTION USING errcode='22023', message='cash account unavailable or currency mismatch';
    END IF;
  END IF;

  INSERT INTO public.payments(
    organization_id, invoice_id, cash_account_id, amount, method, reference,
    actor_id, idempotency_key, idempotency_payload_hash
  )
  VALUES(
    v_org, v_invoice.id, p_cash_account_id, p_amount, p_method, v_reference,
    auth.uid(), v_key, v_payload_hash
  )
  RETURNING * INTO v_payment;

  IF p_cash_account_id IS NOT NULL THEN
    INSERT INTO public.cash_transactions(
      organization_id, cash_account_id, direction, amount, source_type,
      source_id, actor_id
    )
    VALUES(
      v_org, p_cash_account_id, 'in', p_amount, 'payment',
      v_payment.id, auth.uid()
    );
  END IF;

  UPDATE public.operational_invoices i
  SET status = CASE
    WHEN v_paid + p_amount >= i.total THEN 'paid'::public.invoice_status
    ELSE 'partially_paid'::public.invoice_status
  END,
  updated_at = pg_catalog.now()
  WHERE i.id = v_invoice.id
    AND i.organization_id = v_org;

  INSERT INTO public.audit_events(
    organization_id, actor_id, action, target_type, target_id, result, metadata
  )
  VALUES(
    v_org, auth.uid(), 'payment.create', 'payment', v_payment.id, 'success',
    pg_catalog.jsonb_build_object(
      'invoice_id', v_invoice.id,
      'amount', p_amount,
      'method', p_method::text,
      'cash_account_id', p_cash_account_id
    )
  );

  INSERT INTO public.outbox_events(
    organization_id, aggregate_type, aggregate_id, event_type, payload
  )
  VALUES(
    v_org, 'operational_invoice', v_invoice.id, 'payment.received',
    pg_catalog.jsonb_build_object(
      'invoice_id', v_invoice.id,
      'payment_id', v_payment.id,
      'amount', p_amount,
      'method', p_method::text
    )
  );

  RETURN v_payment;
END;
$$;

REVOKE ALL ON FUNCTION public.record_payment(
  uuid, numeric, public.payment_method, uuid, text, text
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.record_payment(
  uuid, numeric, public.payment_method, uuid, text, text
) TO authenticated;

COMMENT ON FUNCTION public.record_payment(
  uuid, numeric, public.payment_method, uuid, text, text
) IS
  'Atomic tenant-scoped invoice payment with mandatory idempotency, payload conflict detection, cash-account validation, audit event and outbox emission.';

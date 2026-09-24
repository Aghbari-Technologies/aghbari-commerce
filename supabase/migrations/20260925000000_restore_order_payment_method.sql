-- Restore the canonical order payment method column so fresh databases match the live
-- transactional order contract used by create_order(..., p_payment_method).
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'credit';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.orders'::regclass
      AND conname = 'orders_payment_method_chk'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_payment_method_chk
      CHECK (payment_method = ANY (ARRAY['credit','cash','transfer']));
  END IF;
END
$$;

COMMENT ON COLUMN public.orders.payment_method IS
  'Authoritative payment method selected for the order; server-side create_order validates the allowed values and checkout policy.';

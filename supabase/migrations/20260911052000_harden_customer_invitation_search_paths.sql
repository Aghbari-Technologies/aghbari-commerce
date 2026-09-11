-- Canonical invitation security hardening.
-- Customer invitation SECURITY DEFINER routines must be isolated from
-- mutable search_path state just like the rest of the public RPC surface.

ALTER FUNCTION public.create_customer_invitation(uuid,text) SET search_path = '';
ALTER FUNCTION public.get_customer_invitation_for_acceptance(text) SET search_path = '';
ALTER FUNCTION public.consume_customer_invitation(text,uuid) SET search_path = '';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef
      AND p.oid IN (
        'public.create_customer_invitation(uuid,text)'::regprocedure,
        'public.get_customer_invitation_for_acceptance(text)'::regprocedure,
        'public.consume_customer_invitation(text,uuid)'::regprocedure
      )
      AND p.proconfig @> ARRAY['search_path=public']
  ) THEN
    RAISE EXCEPTION 'customer invitation SECURITY DEFINER search_path hardening incomplete';
  END IF;
END $$;

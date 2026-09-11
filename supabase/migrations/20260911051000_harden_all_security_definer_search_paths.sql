-- Canonical final security hardening.
-- Any public SECURITY DEFINER function is isolated from mutable search_path state.
-- This forward migration closes regressions introduced by later CREATE OR REPLACE
-- definitions while preserving historical migrations unchanged.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = '''';', r.signature);
  END LOOP;
END $$;

-- Fail closed if any SECURITY DEFINER routine still carries the mutable public path.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef
      AND p.proconfig @> ARRAY['search_path=public']
  ) THEN
    RAISE EXCEPTION 'SECURITY DEFINER search_path hardening incomplete';
  END IF;
END $$;

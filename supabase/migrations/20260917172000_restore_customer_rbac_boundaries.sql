-- Restore RPCs required by the current application contract and close the
-- remaining public/anon execution drift introduced by later CREATE OR REPLACE
-- statements.

CREATE OR REPLACE FUNCTION public.update_customer(
  p_customer_id uuid,
  p_name text,
  p_phone text,
  p_tier public.customer_tier
)
RETURNS public.customers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_org uuid := public.current_organization_id();
  v_role public.user_role := public.current_role();
  v_customer public.customers%rowtype;
  v_name text := nullif(pg_catalog.btrim(p_name), '');
  v_phone text := nullif(pg_catalog.btrim(p_phone), '');
BEGIN
  IF v_org IS NULL OR v_role NOT IN ('owner','admin','sales') THEN
    RAISE EXCEPTION USING errcode='42501', message='customer management access required';
  END IF;
  IF v_name IS NULL OR pg_catalog.length(v_name) > 200
     OR (v_phone IS NOT NULL AND pg_catalog.length(v_phone) > 50) THEN
    RAISE EXCEPTION USING errcode='22023', message='invalid customer data';
  END IF;

  SELECT * INTO v_customer
  FROM public.customers
  WHERE id = p_customer_id
    AND organization_id = v_org
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING errcode='P0002', message='customer not found';
  END IF;

  UPDATE public.customers
  SET name = v_name,
      phone = v_phone,
      tier = coalesce(p_tier, tier),
      updated_at = now()
  WHERE id = v_customer.id
  RETURNING * INTO v_customer;

  INSERT INTO public.audit_events(
    organization_id, actor_id, action, target_type, target_id, result, metadata
  )
  VALUES(
    v_org, auth.uid(), 'customer.update', 'customer', v_customer.id, 'success',
    jsonb_build_object('tier', v_customer.tier)
  );

  RETURN v_customer;
END;
$$;

REVOKE ALL ON FUNCTION public.update_customer(uuid,text,text,public.customer_tier) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_customer(uuid,text,text,public.customer_tier) TO authenticated;

CREATE OR REPLACE FUNCTION public.set_organization_user_role(
  p_user_id uuid,
  p_role public.user_role
)
RETURNS public.user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_org uuid := public.current_organization_id();
  v_actor uuid := auth.uid();
  v_actor_role public.user_role := public.current_role();
  v_existing public.profiles%rowtype;
  v_owner_count integer;
BEGIN
  IF v_org IS NULL OR v_actor_role <> 'owner' THEN
    RAISE EXCEPTION USING errcode='42501', message='owner role management required';
  END IF;

  SELECT * INTO v_existing
  FROM public.profiles p
  WHERE p.id = p_user_id
    AND p.organization_id = v_org
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING errcode='P0002', message='organization user not found';
  END IF;

  IF p_role <> 'owner' AND v_existing.role = 'owner' THEN
    SELECT count(*) INTO v_owner_count
    FROM public.profiles p
    WHERE p.organization_id = v_org
      AND p.role = 'owner';
    IF v_owner_count <= 1 THEN
      RAISE EXCEPTION USING errcode='55006', message='cannot remove the last organization owner';
    END IF;
  END IF;

  UPDATE public.profiles
  SET role = p_role
  WHERE id = p_user_id
    AND organization_id = v_org;

  INSERT INTO public.audit_events(
    organization_id, actor_id, action, target_type, target_id, result, metadata
  )
  VALUES(
    v_org, v_actor, 'organization.user-role.update', 'profile', p_user_id, 'success',
    jsonb_build_object('from_role', v_existing.role, 'to_role', p_role)
  );

  RETURN p_role;
END;
$$;

REVOKE ALL ON FUNCTION public.set_organization_user_role(uuid,public.user_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_organization_user_role(uuid,public.user_role) TO authenticated;

-- Enforce the repository certification invariant after all function recreations
-- in this migration chain: no public-schema function may execute as anon.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS fn
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', r.fn);
  END LOOP;
END;
$$;

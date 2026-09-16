-- Owner-controlled staff membership and role management.
-- profiles is the canonical organization membership record; Auth identity remains in auth.users.

CREATE OR REPLACE FUNCTION public.list_organization_users()
RETURNS TABLE(user_id uuid,email text,role public.user_role,customer_id uuid,created_at timestamptz)
LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$
  SELECT p.id, u.email::text, p.role, p.customer_id, p.created_at
  FROM public.profiles p
  JOIN auth.users u ON u.id=p.id
  WHERE p.organization_id=public.current_organization_id()
    AND public.current_role() IN ('owner','admin')
  ORDER BY p.created_at, p.id;
$$;

CREATE OR REPLACE FUNCTION public.set_organization_user_role(p_user_id uuid,p_role public.user_role)
RETURNS public.user_role
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
  v_org uuid:=public.current_organization_id();
  v_actor uuid:=auth.uid();
  v_actor_role public.user_role:=public.current_role();
  v_existing public.profiles%rowtype;
  v_owner_count integer;
BEGIN
  IF v_org IS NULL OR v_actor_role<>'owner' THEN
    RAISE EXCEPTION USING errcode='42501',message='owner role management required';
  END IF;
  SELECT * INTO v_existing FROM public.profiles p
  WHERE p.id=p_user_id AND p.organization_id=v_org FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION USING errcode='P0002',message='organization user not found'; END IF;
  IF p_role='owner' AND p_user_id<>v_actor THEN
    -- Allowed: promote another user only from an existing organization member.
    NULL;
  END IF;
  IF p_role<>'owner' AND v_existing.role='owner' THEN
    SELECT count(*) INTO v_owner_count FROM public.profiles p WHERE p.organization_id=v_org AND p.role='owner';
    IF v_owner_count<=1 THEN
      RAISE EXCEPTION USING errcode='55006',message='cannot remove the last organization owner';
    END IF;
  END IF;
  UPDATE public.profiles SET role=p_role WHERE id=p_user_id AND organization_id=v_org;
  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  VALUES(v_org,v_actor,'organization.user-role.update','profile',p_user_id,'success',jsonb_build_object('from_role',v_existing.role,'to_role',p_role));
  RETURN p_role;
END;
$$;

REVOKE ALL ON FUNCTION public.list_organization_users() FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.set_organization_user_role(uuid,public.user_role) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.list_organization_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_organization_user_role(uuid,public.user_role) TO authenticated;
COMMENT ON FUNCTION public.list_organization_users() IS 'Lists only members of the caller organization; owner/admin access only.';
COMMENT ON FUNCTION public.set_organization_user_role(uuid,public.user_role) IS 'Owner-only organization role change with last-owner protection and audit evidence.';

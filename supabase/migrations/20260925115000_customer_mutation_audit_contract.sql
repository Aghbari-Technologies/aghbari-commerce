CREATE OR REPLACE FUNCTION public.set_customer_tier(
  p_customer_id uuid,
  p_tier public.customer_tier
)
RETURNS public.customers
LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE
  o uuid:=public.current_organization_id();
  r public.user_role:=public.current_role();
  c public.customers%rowtype;
BEGIN
  IF o IS NULL OR r NOT IN('owner','admin') THEN RAISE EXCEPTION USING errcode='42501'; END IF;
  SELECT * INTO c FROM public.customers WHERE id=p_customer_id AND organization_id=o FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION USING errcode='P0002'; END IF;
  UPDATE public.customers SET tier=p_tier,updated_at=now() WHERE id=c.id RETURNING * INTO c;
  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  VALUES(o,auth.uid(),'customer.tier_change','customer',c.id,'success',
         jsonb_build_object('tier',c.tier));
  RETURN c;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_customer_active(
  p_customer_id uuid,
  p_is_active boolean
)
RETURNS public.customers
LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE
  o uuid:=public.current_organization_id();
  r public.user_role:=public.current_role();
  c public.customers%rowtype;
BEGIN
  IF o IS NULL OR r NOT IN('owner','admin') THEN RAISE EXCEPTION USING errcode='42501'; END IF;
  IF p_is_active IS NULL THEN RAISE EXCEPTION USING errcode='22023'; END IF;
  SELECT * INTO c FROM public.customers WHERE id=p_customer_id AND organization_id=o FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION USING errcode='P0002'; END IF;
  UPDATE public.customers SET is_active=p_is_active,updated_at=now() WHERE id=c.id RETURNING * INTO c;
  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  VALUES(o,auth.uid(),'customer.status_change','customer',c.id,'success',
         jsonb_build_object('is_active',c.is_active));
  RETURN c;
END;
$$;

REVOKE ALL ON FUNCTION public.set_customer_tier(uuid,public.customer_tier) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.set_customer_tier(uuid,public.customer_tier) TO authenticated;
REVOKE ALL ON FUNCTION public.set_customer_active(uuid,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.set_customer_active(uuid,boolean) TO authenticated;
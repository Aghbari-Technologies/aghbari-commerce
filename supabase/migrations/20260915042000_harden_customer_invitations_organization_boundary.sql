-- Correct the legacy customer invitation surface created by 20260910090000.
-- The authoritative commerce schema uses organizations/profiles, not companies/company_memberships.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='customer_invitations' AND column_name='company_id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='customer_invitations' AND column_name='organization_id') THEN
    ALTER TABLE public.customer_invitations RENAME COLUMN company_id TO organization_id;
  END IF;
END $$;

ALTER TABLE public.customer_invitations
  DROP CONSTRAINT IF EXISTS customer_invitations_company_id_fkey,
  DROP CONSTRAINT IF EXISTS customer_invitations_organization_id_fkey;
ALTER TABLE public.customer_invitations
  ADD CONSTRAINT customer_invitations_organization_id_fkey
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE RESTRICT;

ALTER TABLE public.customer_invitations
  DROP CONSTRAINT IF EXISTS customer_invitations_customer_organization_fk;
ALTER TABLE public.customer_invitations
  ADD CONSTRAINT customer_invitations_customer_organization_fk
  FOREIGN KEY (customer_id, organization_id)
  REFERENCES public.customers (id, organization_id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS customer_invitations_organization_status_idx
  ON public.customer_invitations(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS customer_invitations_customer_organization_idx
  ON public.customer_invitations(organization_id, customer_id, created_at DESC);

DROP POLICY IF EXISTS customer_invitations_staff_select ON public.customer_invitations;
CREATE POLICY customer_invitations_staff_select
  ON public.customer_invitations FOR SELECT TO authenticated
  USING (organization_id = public.current_organization_id() AND public.current_role() IN ('owner','admin','sales'));

CREATE OR REPLACE FUNCTION public.create_customer_invitation(p_customer_id uuid,p_email text,p_expires_hours integer DEFAULT 72)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_catalog AS $$
DECLARE v_organization uuid; v_token text; v_id uuid; v_expires timestamptz; v_email text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  v_organization:=public.current_organization_id();
  IF v_organization IS NULL THEN RAISE EXCEPTION 'ORGANIZATION_NOT_FOUND'; END IF;
  IF public.current_role() NOT IN ('owner','admin','sales') THEN RAISE EXCEPTION 'NOT_AUTHORIZED'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.customers c WHERE c.id=p_customer_id AND c.organization_id=v_organization) THEN RAISE EXCEPTION 'CUSTOMER_NOT_FOUND'; END IF;
  v_email:=lower(trim(coalesce(p_email,'')));
  IF length(v_email)<5 OR length(v_email)>320 OR position('@' IN v_email)<=1 THEN RAISE EXCEPTION 'INVALID_EMAIL'; END IF;
  IF p_expires_hours IS NULL OR p_expires_hours<1 OR p_expires_hours>168 THEN RAISE EXCEPTION 'INVALID_EXPIRY'; END IF;
  UPDATE public.customer_invitations SET revoked_at=coalesce(revoked_at,now())
   WHERE organization_id=v_organization AND customer_id=p_customer_id AND accepted_at IS NULL AND revoked_at IS NULL;
  v_token:=encode(gen_random_bytes(32),'base64url'); v_expires:=now()+make_interval(hours=>p_expires_hours);
  INSERT INTO public.customer_invitations(organization_id,customer_id,email,token_hash,expires_at,invited_by)
   VALUES(v_organization,p_customer_id,v_email,encode(digest(v_token,'sha256'),'hex'),v_expires,auth.uid()) RETURNING id INTO v_id;
  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
   VALUES(v_organization,auth.uid(),'customer_invitation_created','customer_invitation',v_id,'success',jsonb_build_object('customer_id',p_customer_id,'email',v_email,'expires_at',v_expires));
  RETURN jsonb_build_object('id',v_id,'token',v_token,'expires_at',v_expires,'email',v_email);
END $$;

CREATE OR REPLACE FUNCTION public.revoke_customer_invitation(p_invitation_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_catalog AS $$
DECLARE v_organization uuid; v_updated integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  v_organization:=public.current_organization_id();
  IF public.current_role() NOT IN ('owner','admin') THEN RAISE EXCEPTION 'NOT_AUTHORIZED'; END IF;
  UPDATE public.customer_invitations SET revoked_at=now()
   WHERE id=p_invitation_id AND organization_id=v_organization AND accepted_at IS NULL AND revoked_at IS NULL;
  GET DIAGNOSTICS v_updated=row_count;
  IF v_updated=1 THEN
    INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result)
     VALUES(v_organization,auth.uid(),'customer_invitation_revoked','customer_invitation',p_invitation_id,'success');
  END IF;
  RETURN v_updated=1;
END $$;

CREATE OR REPLACE FUNCTION public.accept_customer_invitation(p_token text)
RETURNS public.customers LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_catalog AS $$
DECLARE v_inv public.customer_invitations; v_uid uuid; v_email text; v_customer public.customers;
BEGIN
  v_uid:=auth.uid(); IF v_uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  v_email:=lower(trim(coalesce(auth.jwt()->>'email','')));
  IF length(trim(coalesce(p_token,'')))<32 THEN RAISE EXCEPTION 'INVALID_INVITATION'; END IF;
  SELECT ci.* INTO v_inv FROM public.customer_invitations ci
   WHERE ci.token_hash=encode(digest(trim(p_token),'sha256'),'hex') FOR UPDATE;
  IF NOT FOUND OR v_inv.revoked_at IS NOT NULL OR v_inv.accepted_at IS NOT NULL OR v_inv.expires_at<=now() THEN RAISE EXCEPTION 'INVITATION_INVALID_OR_EXPIRED'; END IF;
  IF v_email<>lower(v_inv.email) THEN RAISE EXCEPTION 'INVITATION_EMAIL_MISMATCH'; END IF;
  IF EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=v_uid) THEN RAISE EXCEPTION 'ACCOUNT_ALREADY_LINKED'; END IF;
  SELECT c.* INTO v_customer FROM public.customers c WHERE c.id=v_inv.customer_id AND c.organization_id=v_inv.organization_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'CUSTOMER_NOT_FOUND'; END IF;
  INSERT INTO public.profiles(id,organization_id,customer_id,role) VALUES(v_uid,v_inv.organization_id,v_customer.id,'customer');
  UPDATE public.customer_invitations SET accepted_at=now() WHERE id=v_inv.id;
  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
   VALUES(v_inv.organization_id,v_uid,'customer_invitation_accepted','customer_invitation',v_inv.id,'success',jsonb_build_object('user_id',v_uid,'customer_id',v_customer.id));
  RETURN v_customer;
END $$;

REVOKE ALL ON FUNCTION public.create_customer_invitation(uuid,text,integer) FROM public;
GRANT EXECUTE ON FUNCTION public.create_customer_invitation(uuid,text,integer) TO authenticated;
REVOKE ALL ON FUNCTION public.revoke_customer_invitation(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.revoke_customer_invitation(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.accept_customer_invitation(text) FROM public;
GRANT EXECUTE ON FUNCTION public.accept_customer_invitation(text) TO authenticated;

COMMENT ON CONSTRAINT customer_invitations_customer_organization_fk ON public.customer_invitations IS 'Invitation customer and organization must be the same tenant.';

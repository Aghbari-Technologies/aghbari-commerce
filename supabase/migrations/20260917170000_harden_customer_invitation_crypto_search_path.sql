-- Harden invitation RPCs after pgcrypto was installed in the extensions schema.
-- Keep public signatures and grants unchanged while removing reliance on a mutable search_path.

create or replace function public.create_customer_invitation(p_customer_id uuid, p_email text)
returns table(invitation_id uuid, recipient_email text, expires_at timestamptz, token text)
language plpgsql security definer set search_path=''
as $$
declare
  v_org uuid := public.current_organization_id();
  v_role public.user_role := public.current_role();
  v_email text := lower(trim(p_email));
  v_token text := encode(extensions.gen_random_bytes(32), 'hex');
  v_hash text;
  v_id uuid;
  v_expires timestamptz := now() + interval '48 hours';
begin
  if v_org is null or v_role not in ('owner','admin','sales') then raise exception using errcode='42501', message='customer invitation access required'; end if;
  if p_customer_id is null or not exists (select 1 from public.customers c where c.id=p_customer_id and c.organization_id=v_org and c.is_active=true) then raise exception using errcode='P0002', message='active customer not found'; end if;
  if v_email !~* '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$' then raise exception using errcode='22023', message='valid recipient email required'; end if;
  update public.customer_invitations set revoked_at=now() where organization_id=v_org and customer_id=p_customer_id and accepted_at is null and revoked_at is null;
  v_hash := encode(extensions.digest(v_token, 'sha256'), 'hex');
  insert into public.customer_invitations(organization_id, customer_id, recipient_email, token_hash, expires_at, created_by) values(v_org, p_customer_id, v_email, v_hash, v_expires, auth.uid()) returning id into v_id;
  insert into public.audit_events(organization_id, actor_id, action, target_type, target_id, result, metadata) values(v_org, auth.uid(), 'customer.invitation.create', 'customer_invitation', v_id, 'success', jsonb_build_object('customer_id', p_customer_id, 'recipient_email', v_email, 'expires_at', v_expires));
  return query select v_id, v_email, v_expires, v_token;
end;
$$;

create or replace function public.get_customer_invitation_for_acceptance(p_token text)
returns table(invitation_id uuid, organization_id uuid, customer_id uuid, recipient_email text, expires_at timestamptz)
language plpgsql security definer set search_path=''
as $$
declare v_hash text;
begin
  if p_token is null or length(trim(p_token)) <> 64 or p_token !~ '^[0-9a-f]+$' then raise exception using errcode='22023', message='invalid invitation token'; end if;
  v_hash := encode(extensions.digest(lower(trim(p_token)), 'sha256'), 'hex');
  return query select i.id, i.organization_id, i.customer_id, i.recipient_email, i.expires_at from public.customer_invitations i where i.token_hash=v_hash and i.accepted_at is null and i.revoked_at is null and i.expires_at > now();
  if not found then raise exception using errcode='42501', message='invitation is invalid, expired, revoked or already used'; end if;
end;
$$;

create or replace function public.consume_customer_invitation(p_token text, p_user_id uuid)
returns table(invitation_id uuid, organization_id uuid, customer_id uuid, recipient_email text)
language plpgsql security definer set search_path=''
as $$
declare v_hash text; v_inv public.customer_invitations%rowtype;
begin
  if p_user_id is null then raise exception using errcode='22023', message='user id required'; end if;
  if p_token is null or length(trim(p_token)) <> 64 or p_token !~ '^[0-9a-f]+$' then raise exception using errcode='22023', message='invalid invitation token'; end if;
  v_hash := encode(extensions.digest(lower(trim(p_token)), 'sha256'), 'hex');
  select * into v_inv from public.customer_invitations where token_hash=v_hash for update;
  if not found then raise exception using errcode='42501', message='invitation not found'; end if;
  if v_inv.accepted_at is not null or v_inv.revoked_at is not null or v_inv.expires_at <= now() then raise exception using errcode='42501', message='invitation is expired, revoked or already used'; end if;
  if exists (select 1 from public.profiles p where p.id=p_user_id) then raise exception using errcode='23505', message='account already linked'; end if;
  insert into public.profiles(id, organization_id, customer_id, role) values(p_user_id, v_inv.organization_id, v_inv.customer_id, 'viewer');
  update public.customer_invitations set accepted_at=now() where id=v_inv.id and accepted_at is null and revoked_at is null;
  if not found then raise exception using errcode='40001', message='invitation acceptance race; retry'; end if;
  insert into public.audit_events(organization_id, actor_id, action, target_type, target_id, result, metadata) values(v_inv.organization_id, p_user_id, 'customer.invitation.accept', 'customer_invitation', v_inv.id, 'success', jsonb_build_object('customer_id', v_inv.customer_id, 'recipient_email', v_inv.recipient_email));
  return query select v_inv.id, v_inv.organization_id, v_inv.customer_id, v_inv.recipient_email;
exception when unique_violation then raise exception using errcode='23505', message='account already linked or invitation already accepted';
end;
$$;

revoke all on function public.create_customer_invitation(uuid,text) from public;
revoke all on function public.get_customer_invitation_for_acceptance(text) from public;
revoke all on function public.consume_customer_invitation(text,uuid) from public;
grant execute on function public.create_customer_invitation(uuid,text) to authenticated;
grant execute on function public.get_customer_invitation_for_acceptance(text) to anon, authenticated;
grant execute on function public.consume_customer_invitation(text,uuid) to service_role;

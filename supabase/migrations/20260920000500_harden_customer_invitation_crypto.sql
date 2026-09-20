-- Fix the role-split invitation consumer after 20260920000410 reintroduced an
-- unqualified pgcrypto digest call under search_path=public.
-- Keep SECURITY DEFINER hardened and preserve the service_role-only execution boundary.

create or replace function public.consume_customer_invitation(p_token text, p_user_id uuid)
returns table(invitation_id uuid, organization_id uuid, customer_id uuid, recipient_email text)
language plpgsql
security definer
set search_path=''
as $$
declare
  v_hash text;
  v_inv public.customer_invitations%rowtype;
begin
  if p_user_id is null then
    raise exception using errcode='22023', message='user id required';
  end if;
  if p_token is null or length(trim(p_token)) <> 64 or p_token !~ '^[0-9a-f]+$' then
    raise exception using errcode='22023', message='invalid invitation token';
  end if;

  v_hash := encode(extensions.digest(lower(trim(p_token)), 'sha256'), 'hex');
  select * into v_inv
  from public.customer_invitations
  where token_hash=v_hash
  for update;

  if not found then
    raise exception using errcode='42501', message='invitation not found';
  end if;
  if v_inv.accepted_at is not null or v_inv.revoked_at is not null or v_inv.expires_at <= now() then
    raise exception using errcode='42501', message='invitation is expired, revoked or already used';
  end if;
  if exists (select 1 from public.profiles p where p.id=p_user_id) then
    raise exception using errcode='23505', message='account already linked';
  end if;

  insert into public.profiles(id, organization_id, customer_id, role)
  values(p_user_id, v_inv.organization_id, v_inv.customer_id, 'customer');

  update public.customer_invitations
  set accepted_at=now()
  where id=v_inv.id
    and accepted_at is null
    and revoked_at is null;

  if not found then
    raise exception using errcode='40001', message='invitation acceptance race; retry';
  end if;

  insert into public.audit_events(
    organization_id, actor_id, action, target_type, target_id, result, metadata
  )
  values(
    v_inv.organization_id,
    p_user_id,
    'customer.invitation.accept',
    'customer_invitation',
    v_inv.id,
    'success',
    jsonb_build_object(
      'customer_id', v_inv.customer_id,
      'recipient_email', v_inv.recipient_email
    )
  );

  return query
  select v_inv.id, v_inv.organization_id, v_inv.customer_id, v_inv.recipient_email;
exception
  when unique_violation then
    raise exception using errcode='23505', message='account already linked or invitation already accepted';
end;
$$;

revoke all on function public.consume_customer_invitation(text,uuid) from public;
grant execute on function public.consume_customer_invitation(text,uuid) to service_role;

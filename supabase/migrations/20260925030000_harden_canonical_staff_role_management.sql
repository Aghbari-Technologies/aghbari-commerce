-- Canonicalize organization role management.
-- The earlier 20260925023500 migration created a duplicate RPC surface; this migration
-- retires it and hardens the pre-existing canonical functions.
drop function if exists public.list_staff_members();
drop function if exists public.set_staff_role(uuid, public.user_role);

create or replace function public.set_organization_user_role(p_user_id uuid, p_role public.user_role)
returns public.user_role
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid := public.current_organization_id();
  v_actor uuid := auth.uid();
  v_actor_role public.user_role := public.current_role();
  v_existing public.profiles%rowtype;
  v_owner_count integer;
begin
  if v_org is null or v_actor_role <> 'owner' then
    raise exception using errcode='42501', message='owner role management required';
  end if;
  if p_user_id is null or p_role is null then
    raise exception using errcode='22023', message='user and role are required';
  end if;
  if p_user_id = v_actor then
    raise exception using errcode='42501', message='cannot change your own role';
  end if;

  select * into v_existing
  from public.profiles p
  where p.id = p_user_id and p.organization_id = v_org
  for update;

  if not found then raise exception using errcode='P0002', message='organization user not found'; end if;

  if v_existing.customer_id is not null and p_role <> 'viewer' then
    raise exception using errcode='42501', message='customer accounts may only use viewer role';
  end if;

  if p_role <> 'owner' and v_existing.role = 'owner' then
    select count(*) into v_owner_count
    from public.profiles p
    where p.organization_id = v_org and p.role = 'owner';
    if v_owner_count <= 1 then
      raise exception using errcode='55006', message='cannot remove the last organization owner';
    end if;
  end if;

  update public.profiles
  set role = p_role
  where id = p_user_id and organization_id = v_org;

  insert into public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  values(v_org,v_actor,'organization.user-role.update','profile',p_user_id,'success',
         jsonb_build_object('from_role',v_existing.role,'to_role',p_role,
                            'target_kind',case when v_existing.customer_id is null then 'staff' else 'customer' end));
  return p_role;
end;
$$;

revoke all on function public.set_organization_user_role(uuid, public.user_role) from public, anon;
grant execute on function public.set_organization_user_role(uuid, public.user_role) to authenticated;

-- Secure staff directory and owner-only role management.
-- RPCs are intentionally SECURITY DEFINER because profiles are self-readable under RLS.
-- Empty search_path and explicit schema qualification prevent caller-controlled object shadowing.

create or replace function public.list_staff_members()
returns table (user_id uuid, role public.user_role, created_at timestamptz)
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_org uuid := public.current_organization_id();
  v_actor_role public.user_role := public.current_role();
begin
  if v_org is null or v_actor_role not in ('owner','admin','sales','warehouse') then
    raise exception using errcode = '42501', message = 'staff directory access required';
  end if;

  return query
    select p.id, p.role, p.created_at
    from public.profiles p
    where p.organization_id = v_org and p.customer_id is null
    order by p.created_at asc, p.id asc;
end;
$$;

create or replace function public.set_staff_role(p_user_id uuid, p_role public.user_role)
returns public.user_role
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid := public.current_organization_id();
  v_actor_role public.user_role := public.current_role();
  v_previous_role public.user_role;
  v_target_customer_id uuid;
  v_owner_count integer;
begin
  if v_org is null or v_actor_role <> 'owner' then
    raise exception using errcode = '42501', message = 'owner role required';
  end if;
  if p_user_id is null or p_role is null then
    raise exception using errcode = '22023', message = 'user and role are required';
  end if;
  if p_user_id = auth.uid() then
    raise exception using errcode = '42501', message = 'cannot change your own role';
  end if;

  select p.role, p.customer_id into v_previous_role, v_target_customer_id
  from public.profiles p
  where p.id = p_user_id and p.organization_id = v_org
  for update;

  if not found then raise exception using errcode = 'P0002', message = 'staff member not found'; end if;
  if v_target_customer_id is not null then raise exception using errcode = '42501', message = 'customer accounts are not staff accounts'; end if;

  if v_previous_role = 'owner' and p_role <> 'owner' then
    select count(*) into v_owner_count from public.profiles p
    where p.organization_id = v_org and p.customer_id is null and p.role = 'owner';
    if v_owner_count <= 1 then raise exception using errcode = '42501', message = 'cannot demote the last owner'; end if;
  end if;

  update public.profiles set role = p_role
  where id = p_user_id and organization_id = v_org and customer_id is null;
  if not found then raise exception using errcode = '40001', message = 'staff role update race; retry'; end if;

  insert into public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  values(v_org,auth.uid(),'staff.role.change','profile',p_user_id,'success',
         jsonb_build_object('previous_role',v_previous_role,'new_role',p_role));
  return p_role;
end;
$$;

revoke all on function public.list_staff_members() from public, anon;
revoke all on function public.set_staff_role(uuid, public.user_role) from public, anon;
grant execute on function public.list_staff_members() to authenticated;
grant execute on function public.set_staff_role(uuid, public.user_role) to authenticated;

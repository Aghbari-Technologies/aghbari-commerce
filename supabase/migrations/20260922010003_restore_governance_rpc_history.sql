-- Restore the governance RPC contracts to the canonical migration history.
-- Runtime semantics are intentionally identical to the currently verified live definitions.
create or replace function public.list_organization_users()
returns table(
  user_id uuid,
  email text,
  role public.user_role,
  customer_id uuid,
  created_at timestamptz
)
language sql
security definer
set search_path = ''
as $function$
  select p.id,u.email::text,p.role,p.customer_id,p.created_at
  from public.profiles p
  join auth.users u on u.id=p.id
  where p.organization_id=public.current_organization_id()
    and public.current_role() in ('owner','admin')
  order by p.created_at,p.id;
$function$;

create or replace function public.set_organization_user_role(
  p_user_id uuid,
  p_role public.user_role
)
returns public.user_role
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_org uuid:=public.current_organization_id();
  v_actor uuid:=auth.uid();
  v_actor_role public.user_role:=public.current_role();
  v_existing public.profiles%rowtype;
  v_owner_count integer;
begin
  if v_org is null or v_actor_role<>'owner' then
    raise exception using errcode='42501',message='owner role management required';
  end if;

  select * into v_existing
  from public.profiles p
  where p.id=p_user_id and p.organization_id=v_org
  for update;

  if not found then
    raise exception using errcode='P0002',message='organization user not found';
  end if;

  if p_role<>'owner' and v_existing.role='owner' then
    select count(*) into v_owner_count
    from public.profiles p
    where p.organization_id=v_org and p.role='owner';

    if v_owner_count<=1 then
      raise exception using errcode='55006',message='cannot remove the last organization owner';
    end if;
  end if;

  update public.profiles
  set role=p_role
  where id=p_user_id and organization_id=v_org;

  insert into public.audit_events(
    organization_id,actor_id,action,target_type,target_id,result,metadata
  )
  values(
    v_org,v_actor,'organization.user-role.update','profile',p_user_id,'success',
    jsonb_build_object('from_role',v_existing.role,'to_role',p_role)
  );

  return p_role;
end;
$function$;

revoke execute on function public.list_organization_users() from public,anon;
revoke execute on function public.set_organization_user_role(uuid,public.user_role) from public,anon;

grant execute on function public.list_organization_users() to authenticated;
grant execute on function public.set_organization_user_role(uuid,public.user_role) to authenticated;

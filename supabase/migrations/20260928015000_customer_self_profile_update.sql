-- Customer self-service profile update.
-- Customers may edit presentation/contact fields only; pricing tier, activation and tenant ownership remain server controlled.

create or replace function public.update_customer_self_profile(
  p_name text,
  p_phone text default null
)
returns public.customers
language plpgsql
security definer
set search_path=''
as $$
declare
  v_org uuid := public.current_organization_id();
  v_customer uuid := public.current_customer_id();
  v_customer_row public.customers%rowtype;
  v_name text := trim(coalesce(p_name,''));
  v_phone text := nullif(trim(coalesce(p_phone,'')),'');
begin
  if v_org is null or v_customer is null or public.is_staff() then
    raise exception using errcode='42501', message='customer profile update access required';
  end if;

  if v_name = '' or length(v_name) > 200 or (v_phone is not null and length(v_phone) > 40) then
    raise exception using errcode='22023', message='invalid customer profile';
  end if;

  select * into v_customer_row
    from public.customers
   where id=v_customer
     and organization_id=v_org
     and is_active=true
   for update;

  if not found then
    raise exception using errcode='P0002', message='active customer not found';
  end if;

  update public.customers
     set name=v_name,
         phone=v_phone,
         updated_at=now()
   where id=v_customer
     and organization_id=v_org
   returning * into v_customer_row;

  insert into public.audit_events(
    organization_id, actor_id, action, target_type, target_id, result, metadata
  ) values (
    v_org, auth.uid(), 'customer_profile.self_update', 'customer', v_customer_row.id, 'success',
    jsonb_build_object('changed_fields', jsonb_build_array('name','phone'))
  );

  return v_customer_row;
end;
$$;

revoke execute on function public.update_customer_self_profile(text,text) from public, anon;
grant execute on function public.update_customer_self_profile(text,text) to authenticated;

comment on function public.update_customer_self_profile(text,text) is
  'Allows a non-staff authenticated customer to update only own display name and phone. Tier, status and tenant remain server controlled.';

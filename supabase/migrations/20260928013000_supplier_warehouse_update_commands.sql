-- Canonical update commands for in-scope supplier and warehouse administration.
-- Direct business mutations remain server-authoritative and audited.

create or replace function public.update_supplier(
  p_supplier_id uuid,
  p_name text,
  p_phone text default null,
  p_email text default null,
  p_address text default null,
  p_is_active boolean default true
)
returns public.suppliers
language plpgsql
security definer
set search_path=''
as $$
declare
  v_org uuid := public.current_organization_id();
  v_role public.user_role := public.current_role();
  v_supplier public.suppliers%rowtype;
  v_name text := trim(coalesce(p_name,''));
  v_phone text := nullif(trim(coalesce(p_phone,'')),'');
  v_email text := nullif(trim(coalesce(p_email,'')),'');
  v_address text := nullif(trim(coalesce(p_address,'')),'');
begin
  if v_org is null or v_role not in ('owner','admin') then
    raise exception using errcode='42501', message='supplier update access required';
  end if;
  if p_supplier_id is null or v_name='' or length(v_name)>200 then
    raise exception using errcode='22023', message='invalid supplier update';
  end if;
  select * into v_supplier
    from public.suppliers
   where id=p_supplier_id and organization_id=v_org
   for update;
  if not found then
    raise exception using errcode='P0002', message='supplier not found';
  end if;

  update public.suppliers
     set name=v_name,
         phone=v_phone,
         email=v_email,
         address=v_address,
         is_active=coalesce(p_is_active,true),
         updated_at=now()
   where id=p_supplier_id and organization_id=v_org
   returning * into v_supplier;

  insert into public.audit_events(
    organization_id,actor_id,action,target_type,target_id,result,metadata
  ) values (
    v_org,auth.uid(),'supplier.update','supplier',v_supplier.id,'success',
    jsonb_build_object(
      'name',v_supplier.name,
      'is_active',v_supplier.is_active
    )
  );

  return v_supplier;
exception when unique_violation then
  raise exception using errcode='23505', message='supplier name already exists';
end;
$$;

create or replace function public.update_warehouse(
  p_warehouse_id uuid,
  p_name text,
  p_branch_id uuid,
  p_is_active boolean default true
)
returns public.warehouses
language plpgsql
security definer
set search_path=''
as $$
declare
  v_org uuid := public.current_organization_id();
  v_role public.user_role := public.current_role();
  v_warehouse public.warehouses%rowtype;
  v_name text := trim(coalesce(p_name,''));
begin
  if v_org is null or v_role not in ('owner','admin') then
    raise exception using errcode='42501', message='warehouse update access required';
  end if;
  if p_warehouse_id is null or p_branch_id is null or v_name='' or length(v_name)>200 then
    raise exception using errcode='22023', message='invalid warehouse update';
  end if;
  if not exists (
    select 1 from public.branches b
     where b.id=p_branch_id and b.organization_id=v_org and b.is_active=true
  ) then
    raise exception using errcode='P0002', message='branch not found or inactive';
  end if;

  select * into v_warehouse
    from public.warehouses
   where id=p_warehouse_id and organization_id=v_org
   for update;
  if not found then
    raise exception using errcode='P0002', message='warehouse not found';
  end if;

  update public.warehouses
     set name=v_name,
         branch_id=p_branch_id,
         is_active=coalesce(p_is_active,true),
         updated_at=now()
   where id=p_warehouse_id and organization_id=v_org
   returning * into v_warehouse;

  insert into public.audit_events(
    organization_id,actor_id,action,target_type,target_id,result,metadata
  ) values (
    v_org,auth.uid(),'warehouse.update','warehouse',v_warehouse.id,'success',
    jsonb_build_object(
      'name',v_warehouse.name,
      'branch_id',v_warehouse.branch_id,
      'is_active',v_warehouse.is_active
    )
  );

  return v_warehouse;
end;
$$;

revoke execute on function public.update_supplier(uuid,text,text,text,text,boolean) from public, anon;
revoke execute on function public.update_warehouse(uuid,text,uuid,boolean) from public, anon;

grant execute on function public.update_supplier(uuid,text,text,text,text,boolean) to authenticated;
grant execute on function public.update_warehouse(uuid,text,uuid,boolean) to authenticated;

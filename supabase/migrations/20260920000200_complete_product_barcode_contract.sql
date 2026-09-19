-- Complete the product barcode contract end-to-end.
-- Barcode remains optional but is unique within each organization (case-insensitive, trimmed).

update public.products
set barcode = null
where barcode is not null and trim(barcode) = '';

create unique index if not exists products_organization_barcode_key
  on public.products (organization_id, lower(trim(barcode)))
  where nullif(trim(barcode), '') is not null;

create or replace function public.upsert_product(
  p_product_id uuid,
  p_sku text,
  p_name text,
  p_unit text,
  p_category_id uuid,
  p_description text,
  p_status text,
  p_barcode text
)
returns public.products
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_org uuid := public.current_organization_id();
  v_role public.user_role := public.current_role();
  v_product public.products%rowtype;
  v_sku text := upper(trim(coalesce(p_sku,'')));
  v_name text := trim(coalesce(p_name,''));
  v_unit text := trim(coalesce(p_unit,''));
  v_barcode text := nullif(trim(coalesce(p_barcode,'')),'');
begin
  if v_org is null or v_role not in ('owner','admin','sales') then
    raise exception using errcode='42501', message='staff catalog access required';
  end if;
  if v_sku='' or v_name='' or v_unit='' then
    raise exception using errcode='22023', message='sku, name and unit are required';
  end if;
  if p_status not in ('active','inactive') then
    raise exception using errcode='22023', message='invalid product status';
  end if;
  if char_length(coalesce(v_barcode,'')) > 80 then
    raise exception using errcode='22023', message='barcode cannot exceed 80 characters';
  end if;
  if p_category_id is not null and not exists(
    select 1 from public.categories
    where id=p_category_id and organization_id=v_org and is_active
  ) then
    raise exception using errcode='22023', message='invalid category';
  end if;
  if v_barcode is not null and exists(
    select 1 from public.products
    where organization_id=v_org
      and lower(trim(barcode))=lower(v_barcode)
      and (p_product_id is null or id<>p_product_id)
  ) then
    raise exception using errcode='23505', message='Barcode already exists';
  end if;
  if p_product_id is null then
    insert into public.products(
      organization_id,category_id,sku,barcode,name,unit,description,status
    )
    values(
      v_org,p_category_id,v_sku,v_barcode,v_name,v_unit,
      nullif(trim(p_description),''),p_status
    )
    returning * into v_product;
  else
    update public.products
    set category_id=p_category_id,
        sku=v_sku,
        barcode=v_barcode,
        name=v_name,
        unit=v_unit,
        description=nullif(trim(p_description),''),
        status=p_status,
        updated_at=now()
    where id=p_product_id and organization_id=v_org
    returning * into v_product;
    if not found then
      raise exception using errcode='P0002',message='product not found';
    end if;
  end if;
  insert into public.audit_events(
    organization_id,actor_id,action,target_type,target_id,result,metadata
  )
  values(
    v_org,auth.uid(),
    case when p_product_id is null then 'product.create' else 'product.update' end,
    'product',v_product.id,'success',
    jsonb_build_object(
      'sku',v_product.sku,
      'barcode',v_product.barcode,
      'status',v_product.status
    )
  );
  return v_product;
exception when unique_violation then
  raise exception using errcode='23505',message='SKU or barcode already exists';
end;
$function$;

create or replace function public.upsert_product(
  p_product_id uuid default null,
  p_sku text default null,
  p_name text default null,
  p_unit text default null,
  p_category_id uuid default null,
  p_description text default null,
  p_status text default 'active'
)
returns public.products
language plpgsql
security definer
set search_path to ''
as $function$
begin
  return public.upsert_product(
    p_product_id,p_sku,p_name,p_unit,p_category_id,p_description,p_status,null
  );
end;
$function$;

grant execute on function public.upsert_product(uuid,text,text,text,uuid,text,text,text) to authenticated;
revoke execute on function public.upsert_product(uuid,text,text,text,uuid,text,text,text) from anon;
grant execute on function public.upsert_product(uuid,text,text,text,uuid,text,text) to authenticated;
revoke execute on function public.upsert_product(uuid,text,text,text,uuid,text,text) from anon;

create or replace function public.stage_product_import(
  p_source_name text,
  p_source_fingerprint text,
  p_rows jsonb
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_org uuid := public.current_organization_id();
  v_role public.user_role := public.current_role();
  v_job uuid;
  v_row jsonb;
  v_number integer := 1;
  v_sku text;
  v_barcode text;
  v_name text;
  v_unit text;
  v_category text;
  v_quantity numeric;
  v_retail numeric;
  v_wholesale numeric;
  v_distributor numeric;
  v_quantity_raw text;
  v_retail_raw text;
  v_wholesale_raw text;
  v_distributor_raw text;
  v_diagnostics jsonb;
  v_status text;
begin
  if v_org is null or v_role not in ('owner','admin','sales') then
    raise exception using errcode='42501', message='staff import access required';
  end if;
  if nullif(trim(p_source_name),'') is null
     or char_length(trim(p_source_name)) > 180
     or p_source_fingerprint !~ '^[0-9a-f]{64}$' then
    raise exception using errcode='22023', message='invalid import source metadata';
  end if;
  if p_rows is null or jsonb_typeof(p_rows) <> 'array'
     or jsonb_array_length(p_rows)=0 or jsonb_array_length(p_rows)>10000 then
    raise exception using errcode='22023', message='import row count must be between 1 and 10000';
  end if;

  insert into public.import_jobs(
    organization_id,source_name,source_fingerprint,status,total_rows,created_by
  )
  values(
    v_org,trim(p_source_name),lower(p_source_fingerprint),'validating',
    jsonb_array_length(p_rows),auth.uid()
  )
  on conflict (organization_id,source_fingerprint) do nothing
  returning id into v_job;
  if v_job is null then
    raise exception using errcode='23505', message='duplicate import fingerprint';
  end if;

  for v_row in select value from jsonb_array_elements(p_rows) loop
    v_sku := upper(trim(coalesce(v_row->>'sku','')));
    v_barcode := nullif(trim(coalesce(v_row->>'barcode','')),'');
    v_name := trim(coalesce(v_row->>'name',''));
    v_unit := trim(coalesce(v_row->>'unit',''));
    v_category := trim(coalesce(v_row->>'category',''));
    v_quantity_raw := nullif(trim(v_row->>'quantity'),'');
    v_retail_raw := nullif(trim(v_row #>> '{prices,retail}'),'');
    v_wholesale_raw := nullif(trim(v_row #>> '{prices,wholesale}'),'');
    v_distributor_raw := nullif(trim(v_row #>> '{prices,distributor}'),'');
    v_quantity := public.try_parse_import_numeric(v_quantity_raw);
    v_retail := public.try_parse_import_numeric(v_retail_raw);
    v_wholesale := public.try_parse_import_numeric(v_wholesale_raw);
    v_distributor := public.try_parse_import_numeric(v_distributor_raw);
    v_diagnostics := '[]'::jsonb;

    if v_sku='' then
      v_diagnostics := v_diagnostics || jsonb_build_array(
        jsonb_build_object('field','sku','message','SKU is required')
      );
    elsif char_length(v_sku)>80 then
      v_diagnostics := v_diagnostics || jsonb_build_array(
        jsonb_build_object('field','sku','message','SKU cannot exceed 80 characters')
      );
    end if;

    if v_barcode is not null and char_length(v_barcode)>80 then
      v_diagnostics := v_diagnostics || jsonb_build_array(
        jsonb_build_object('field','barcode','message','Barcode cannot exceed 80 characters')
      );
    elsif v_barcode is not null and exists(
      select 1
      from public.import_rows ir
      where ir.import_job_id=v_job
        and lower(trim(ir.normalized_data->>'barcode'))=lower(v_barcode)
    ) then
      v_diagnostics := v_diagnostics || jsonb_build_array(
        jsonb_build_object('field','barcode','message','Duplicate barcode in file')
      );
    elsif v_barcode is not null and exists(
      select 1
      from public.products p
      where p.organization_id=v_org
        and lower(trim(p.barcode))=lower(v_barcode)
        and p.sku<>v_sku
    ) then
      v_diagnostics := v_diagnostics || jsonb_build_array(
        jsonb_build_object('field','barcode','message','Barcode already exists')
      );
    end if;

    if v_name='' then
      v_diagnostics := v_diagnostics || jsonb_build_array(
        jsonb_build_object('field','name','message','Name is required')
      );
    elsif char_length(v_name)>240 then
      v_diagnostics := v_diagnostics || jsonb_build_array(
        jsonb_build_object('field','name','message','Name cannot exceed 240 characters')
      );
    end if;

    if v_unit='' then
      v_diagnostics := v_diagnostics || jsonb_build_array(
        jsonb_build_object('field','unit','message','Unit is required')
      );
    elsif char_length(v_unit)>80 then
      v_diagnostics := v_diagnostics || jsonb_build_array(
        jsonb_build_object('field','unit','message','Unit cannot exceed 80 characters')
      );
    end if;

    if v_category='' then
      v_diagnostics := v_diagnostics || jsonb_build_array(
        jsonb_build_object('field','category','message','Category is required')
      );
    elsif char_length(v_category)>120 then
      v_diagnostics := v_diagnostics || jsonb_build_array(
        jsonb_build_object('field','category','message','Category cannot exceed 120 characters')
      );
    end if;

    if v_quantity_raw is null or v_quantity is null or v_quantity<0
       or v_quantity<>trunc(v_quantity) or v_quantity>10000 then
      v_diagnostics := v_diagnostics || jsonb_build_array(
        jsonb_build_object('field','quantity','message','Quantity must be a non-negative integer not exceeding 10000')
      );
    end if;

    if v_retail_raw is null or v_retail is null or v_retail<0
       or v_retail>90071992547409.91 or round(v_retail,2)<>v_retail then
      v_diagnostics := v_diagnostics || jsonb_build_array(
        jsonb_build_object('field','price.retail','message','Retail price must be a finite non-negative amount with at most 2 decimals within the safe client range')
      );
    end if;

    if v_wholesale_raw is null or v_wholesale is null or v_wholesale<0
       or v_wholesale>90071992547409.91 or round(v_wholesale,2)<>v_wholesale then
      v_diagnostics := v_diagnostics || jsonb_build_array(
        jsonb_build_object('field','price.wholesale','message','Wholesale price must be a finite non-negative amount with at most 2 decimals within the safe client range')
      );
    end if;

    if v_distributor_raw is null or v_distributor is null or v_distributor<0
       or v_distributor>90071992547409.91 or round(v_distributor,2)<>v_distributor then
      v_diagnostics := v_diagnostics || jsonb_build_array(
        jsonb_build_object('field','price.distributor','message','Distributor price must be a finite non-negative amount with at most 2 decimals within the safe client range')
      );
    end if;

    v_status := case when jsonb_array_length(v_diagnostics)=0 then 'valid' else 'invalid' end;

    insert into public.import_rows(
      organization_id,import_job_id,row_number,raw_data,normalized_data,status,diagnostics
    )
    values(
      v_org,v_job,v_number,v_row,
      jsonb_build_object(
        'sku',v_sku,
        'name',v_name,
        'unit',v_unit,
        'category',v_category,
        'quantity',v_quantity,
        'prices',jsonb_build_object(
          'retail',v_retail,'wholesale',v_wholesale,'distributor',v_distributor
        )
      ) || case
        when v_barcode is not null then jsonb_build_object('barcode',v_barcode)
        else '{}'::jsonb
      end,
      v_status,v_diagnostics
    );
    v_number := v_number+1;
  end loop;

  update public.import_jobs
  set status='preview',
      valid_rows=(
        select count(*) from public.import_rows
        where import_job_id=v_job and status='valid'
      ),
      invalid_rows=(
        select count(*) from public.import_rows
        where import_job_id=v_job and status='invalid'
      ),
      error_summary=coalesce(
        (
          select jsonb_agg(diagnostics)
          from public.import_rows
          where import_job_id=v_job and status='invalid'
        ),
        '[]'::jsonb
      )
  where id=v_job and organization_id=v_org;

  insert into public.audit_events(
    organization_id,actor_id,action,target_type,target_id,result,metadata
  )
  values(
    v_org,auth.uid(),'import.stage','import_job',v_job,'success',
    jsonb_build_object('source_name',p_source_name,'rows',jsonb_array_length(p_rows))
  );
  return v_job;
end;
$function$;

create or replace function public.commit_product_import(
  p_import_job_id uuid,
  p_warehouse_id uuid
)
returns table(
  imported_rows integer,
  products_created integer,
  products_updated integer,
  inventory_changed integer
)
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_org uuid:=public.current_organization_id();
  v_role public.user_role:=public.current_role();
  v_job public.import_jobs%rowtype;
  v_row record;
  v_product public.products%rowtype;
  v_category_id uuid;
  v_price_list_id uuid;
  v_old_qty integer:=0;
  v_new_qty integer;
  v_delta integer;
  v_created integer:=0;
  v_updated integer:=0;
  v_inventory_changed integer:=0;
  v_count integer:=0;
  v_slug text;
  v_effective_at timestamptz;
  v_barcode text;
begin
  if v_org is null or v_role not in ('owner','admin','sales') then
    raise exception using errcode='42501',message='staff import access required';
  end if;
  select * into v_job
  from public.import_jobs
  where id=p_import_job_id and organization_id=v_org
  for update;
  if not found then
    raise exception using errcode='P0002',message='import job not found';
  end if;
  if v_job.status<>'preview' or v_job.invalid_rows<>0 then
    raise exception using errcode='P0001',message='import is not ready for atomic commit';
  end if;
  if not exists(
    select 1 from public.warehouses
    where id=p_warehouse_id and organization_id=v_org and is_active
  ) then
    raise exception using errcode='42501',message='warehouse not available';
  end if;

  insert into public.price_lists(organization_id,tier,name,currency)
  values
    (v_org,'retail','تجزئة','YER'),
    (v_org,'wholesale','جملة','YER'),
    (v_org,'distributor','موزع','YER')
  on conflict(organization_id,tier) do nothing;

  update public.import_jobs set status='committing' where id=v_job.id;

  for v_row in
    select * from public.import_rows
    where import_job_id=v_job.id
      and organization_id=v_org
      and status='valid'
    order by row_number
    for update
  loop
    v_barcode := nullif(trim(v_row.normalized_data->>'barcode'),'');
    select id into v_category_id
    from public.categories
    where organization_id=v_org
      and name=v_row.normalized_data->>'category'
      and is_active
    order by created_at
    limit 1;
    if v_category_id is null then
      v_slug := 'import-'||substr(
        md5(lower(trim(v_row.normalized_data->>'category'))),1,16
      );
      insert into public.categories(organization_id,name,slug)
      values(
        v_org,
        trim(v_row.normalized_data->>'category'),
        v_slug
      )
      on conflict(organization_id,slug)
      do update set name=excluded.name
      returning id into v_category_id;
    end if;

    select * into v_product
    from public.products
    where organization_id=v_org
      and sku=v_row.normalized_data->>'sku'
    for update;

    if found then
      if v_row.normalized_data ? 'barcode' and v_barcode is not null then
        update public.products
        set name=v_row.normalized_data->>'name',
            unit=v_row.normalized_data->>'unit',
            category_id=v_category_id,
            barcode=v_barcode,
            updated_at=now(),
            status='active'
        where id=v_product.id
        returning * into v_product;
      else
        update public.products
        set name=v_row.normalized_data->>'name',
            unit=v_row.normalized_data->>'unit',
            category_id=v_category_id,
            updated_at=now(),
            status='active'
        where id=v_product.id
        returning * into v_product;
      end if;
      v_updated:=v_updated+1;
    else
      insert into public.products(
        organization_id,category_id,sku,barcode,name,unit,status
      )
      values(
        v_org,
        v_category_id,
        v_row.normalized_data->>'sku',
        v_barcode,
        v_row.normalized_data->>'name',
        v_row.normalized_data->>'unit',
        'active'
      )
      returning * into v_product;
      v_created:=v_created+1;
    end if;

    v_effective_at:=clock_timestamp();
    for v_price_list_id in
      select id
      from public.price_lists
      where organization_id=v_org
        and tier in('retail','wholesale','distributor')
      order by tier
    loop
      update public.product_prices
      set valid_to=v_effective_at
      where organization_id=v_org
        and price_list_id=v_price_list_id
        and product_id=v_product.id
        and valid_from<v_effective_at
        and (valid_to is null or valid_to>v_effective_at);

      insert into public.product_prices(
        organization_id,price_list_id,product_id,amount,valid_from
      )
      values(
        v_org,
        v_price_list_id,
        v_product.id,
        case (select tier from public.price_lists where id=v_price_list_id)
          when 'retail' then (v_row.normalized_data #>> '{prices,retail}')::numeric
          when 'wholesale' then (v_row.normalized_data #>> '{prices,wholesale}')::numeric
          when 'distributor' then (v_row.normalized_data #>> '{prices,distributor}')::numeric
        end,
        v_effective_at
      );
    end loop;

    v_new_qty:=(v_row.normalized_data->>'quantity')::integer;
    select quantity into v_old_qty
    from public.inventory_balances
    where organization_id=v_org
      and warehouse_id=p_warehouse_id
      and product_id=v_product.id
    for update;
    v_old_qty:=coalesce(v_old_qty,0);

    insert into public.inventory_balances(
      organization_id,warehouse_id,product_id,quantity
    )
    values(v_org,p_warehouse_id,v_product.id,v_new_qty)
    on conflict(warehouse_id,product_id)
    do update set quantity=excluded.quantity,updated_at=now();

    v_delta:=v_new_qty-v_old_qty;
    if v_delta<>0 then
      insert into public.inventory_movements(
        organization_id,warehouse_id,product_id,delta,source_type,source_id,actor_id
      )
      values(
        v_org,p_warehouse_id,v_product.id,v_delta,'import',v_job.id,auth.uid()
      );
      v_inventory_changed:=v_inventory_changed+1;
    end if;

    update public.import_rows set status='committed' where id=v_row.id;
    v_count:=v_count+1;
  end loop;

  update public.import_jobs
  set status='completed',completed_at=clock_timestamp()
  where id=v_job.id;

  insert into public.audit_events(
    organization_id,actor_id,action,target_type,target_id,result,metadata
  )
  values(
    v_org,auth.uid(),'import.commit','import_job',v_job.id,'success',
    jsonb_build_object(
      'rows',v_count,
      'created',v_created,
      'updated',v_updated,
      'inventory_changed',v_inventory_changed
    )
  );

  return query select v_count,v_created,v_updated,v_inventory_changed;
end;
$function$;

create or replace function public.get_catalog_with_barcode(
  p_search text default null,
  p_category_id uuid default null,
  p_limit integer default 24,
  p_offset integer default 0,
  p_warehouse_id uuid default null
)
returns table(
  id uuid,
  sku text,
  barcode text,
  name text,
  unit text,
  category_id uuid,
  description text,
  status text,
  available_quantity integer,
  image_path text,
  authorized_price numeric,
  currency text
)
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
  v_org uuid:=public.current_organization_id();
  v_customer uuid:=public.current_customer_id();
  v_tier public.customer_tier;
  v_warehouse uuid:=p_warehouse_id;
begin
  if v_org is null or v_customer is null then
    raise exception using errcode='42501',message='authenticated customer context required';
  end if;
  if p_limit<1 or p_limit>100 or p_offset<0 then
    raise exception using errcode='22023',message='invalid pagination';
  end if;
  if v_warehouse is null then
    select w.id into v_warehouse
    from public.warehouses w
    where w.organization_id=v_org and w.is_active
    order by w.created_at,w.id
    limit 1;
  end if;
  if v_warehouse is null or not exists(
    select 1 from public.warehouses w
    where w.id=v_warehouse and w.organization_id=v_org and w.is_active
  ) then
    raise exception using errcode='42501',message='warehouse not available';
  end if;

  select c.tier into v_tier
  from public.customers c
  where c.id=v_customer and c.organization_id=v_org and c.is_active;
  if v_tier is null then
    raise exception using errcode='42501',message='active customer required';
  end if;

  return query
  select
    p.id,
    p.sku,
    p.barcode,
    p.name,
    p.unit,
    p.category_id,
    p.description,
    p.status,
    coalesce((
      select ib.quantity
      from public.inventory_balances ib
      where ib.organization_id=v_org
        and ib.product_id=p.id
        and ib.warehouse_id=v_warehouse
      order by ib.updated_at desc
      limit 1
    ),0),
    (
      select pm.storage_path
      from public.product_media pm
      where pm.organization_id=v_org and pm.product_id=p.id
      order by pm.sort_order,pm.created_at
      limit 1
    ),
    (
      select pp.amount
      from public.product_prices pp
      join public.price_lists pl on pl.id=pp.price_list_id
      where pp.organization_id=v_org
        and pp.product_id=p.id
        and pl.organization_id=v_org
        and pl.tier=v_tier
        and pl.is_active
        and pp.valid_from<=now()
        and (pp.valid_to is null or pp.valid_to>now())
      order by pp.valid_from desc
      limit 1
    ),
    coalesce((
      select pl.currency
      from public.price_lists pl
      where pl.organization_id=v_org
        and pl.tier=v_tier
        and pl.is_active
      limit 1
    ),'YER')
  from public.products p
  where p.organization_id=v_org
    and p.status='active'
    and (p_category_id is null or p.category_id=p_category_id)
    and (
      p_search is null
      or trim(p_search)=''
      or p.name ilike '%'||trim(p_search)||'%'
      or p.sku ilike '%'||trim(p_search)||'%'
      or lower(trim(coalesce(p.barcode,'')))=lower(trim(p_search))
    )
  order by p.name,p.id
  limit p_limit offset p_offset;
end;
$function$;

grant execute on function public.get_catalog_with_barcode(text,uuid,integer,integer,uuid) to authenticated;
revoke execute on function public.get_catalog_with_barcode(text,uuid,integer,integer,uuid) from anon;

comment on function public.get_catalog_with_barcode(text,uuid,integer,integer,uuid)
is 'Server-authoritative customer catalog projection including the organization-scoped product barcode.';

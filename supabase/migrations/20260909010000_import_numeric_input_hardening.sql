-- Harden the server-side import parser against malformed numeric text.
-- Invalid numeric cells must become row diagnostics, not abort the entire import transaction.

create or replace function public.try_parse_import_numeric(p_value text)
returns numeric
language plpgsql
immutable
as $$
begin
  if p_value is null or btrim(p_value) = '' then
    return null;
  end if;
  if btrim(p_value) !~ '^[+-]?(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)$' then
    return null;
  end if;
  return btrim(p_value)::numeric;
exception when numeric_value_out_of_range or invalid_text_representation then
  return null;
end;
$$;

revoke execute on function public.try_parse_import_numeric(text) from public, anon, authenticated;

grant execute on function public.try_parse_import_numeric(text) to service_role;

create or replace function public.stage_product_import(
  p_source_name text,
  p_source_fingerprint text,
  p_rows jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid := public.current_organization_id();
  v_role public.user_role := public.current_role();
  v_job uuid;
  v_row jsonb;
  v_number integer := 1;
  v_sku text;
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

  if nullif(trim(p_source_name),'') is null or char_length(trim(p_source_name)) > 180
     or p_source_fingerprint !~ '^[0-9a-f]{64}$' then
    raise exception using errcode='22023', message='invalid import source metadata';
  end if;

  if p_rows is null or jsonb_typeof(p_rows) <> 'array'
     or jsonb_array_length(p_rows) = 0 or jsonb_array_length(p_rows) > 10000 then
    raise exception using errcode='22023', message='import row count must be between 1 and 10000';
  end if;

  insert into public.import_jobs(organization_id,source_name,source_fingerprint,status,total_rows,created_by)
  values(v_org,trim(p_source_name),lower(p_source_fingerprint),'validating',jsonb_array_length(p_rows),auth.uid())
  on conflict (organization_id,source_fingerprint) do nothing
  returning id into v_job;
  if v_job is null then
    raise exception using errcode='23505', message='duplicate import fingerprint';
  end if;

  for v_row in select value from jsonb_array_elements(p_rows) loop
    v_sku := upper(trim(coalesce(v_row->>'sku','')));
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

    if v_sku = '' then
      v_diagnostics := v_diagnostics || jsonb_build_array(jsonb_build_object('field','sku','message','SKU is required'));
    elsif char_length(v_sku) > 80 then
      v_diagnostics := v_diagnostics || jsonb_build_array(jsonb_build_object('field','sku','message','SKU cannot exceed 80 characters'));
    end if;

    if v_name = '' then
      v_diagnostics := v_diagnostics || jsonb_build_array(jsonb_build_object('field','name','message','Name is required'));
    elsif char_length(v_name) > 240 then
      v_diagnostics := v_diagnostics || jsonb_build_array(jsonb_build_object('field','name','message','Name cannot exceed 240 characters'));
    end if;

    if v_unit = '' then
      v_diagnostics := v_diagnostics || jsonb_build_array(jsonb_build_object('field','unit','message','Unit is required'));
    elsif char_length(v_unit) > 80 then
      v_diagnostics := v_diagnostics || jsonb_build_array(jsonb_build_object('field','unit','message','Unit cannot exceed 80 characters'));
    end if;

    if v_category = '' then
      v_diagnostics := v_diagnostics || jsonb_build_array(jsonb_build_object('field','category','message','Category is required'));
    elsif char_length(v_category) > 120 then
      v_diagnostics := v_diagnostics || jsonb_build_array(jsonb_build_object('field','category','message','Category cannot exceed 120 characters'));
    end if;

    if v_quantity_raw is null or v_quantity is null or v_quantity < 0 or v_quantity <> trunc(v_quantity) or v_quantity > 10000 then
      v_diagnostics := v_diagnostics || jsonb_build_array(jsonb_build_object('field','quantity','message','Quantity must be a non-negative integer not exceeding 10000'));
    end if;

    if v_retail_raw is null or v_retail is null or v_retail < 0 or v_retail > 90071992547409.91 or round(v_retail,2) <> v_retail then
      v_diagnostics := v_diagnostics || jsonb_build_array(jsonb_build_object('field','price.retail','message','Retail price must be a finite non-negative amount with at most 2 decimals within the safe client range'));
    end if;
    if v_wholesale_raw is null or v_wholesale is null or v_wholesale < 0 or v_wholesale > 90071992547409.91 or round(v_wholesale,2) <> v_wholesale then
      v_diagnostics := v_diagnostics || jsonb_build_array(jsonb_build_object('field','price.wholesale','message','Wholesale price must be a finite non-negative amount with at most 2 decimals within the safe client range'));
    end if;
    if v_distributor_raw is null or v_distributor is null or v_distributor < 0 or v_distributor > 90071992547409.91 or round(v_distributor,2) <> v_distributor then
      v_diagnostics := v_diagnostics || jsonb_build_array(jsonb_build_object('field','price.distributor','message','Distributor price must be a finite non-negative amount with at most 2 decimals within the safe client range'));
    end if;

    if exists (
      select 1 from public.import_rows ir
      where ir.import_job_id=v_job and ir.normalized_data->>'sku'=v_sku
    ) then
      v_diagnostics := v_diagnostics || jsonb_build_array(jsonb_build_object('field','sku','message','Duplicate SKU in file'));
    end if;

    v_status := case when jsonb_array_length(v_diagnostics)=0 then 'valid' else 'invalid' end;
    insert into public.import_rows(organization_id,import_job_id,row_number,raw_data,normalized_data,status,diagnostics)
    values(
      v_org,v_job,v_number,v_row,
      jsonb_build_object(
        'sku',v_sku,'name',v_name,'unit',v_unit,'category',v_category,'quantity',v_quantity,
        'prices',jsonb_build_object('retail',v_retail,'wholesale',v_wholesale,'distributor',v_distributor)
      ),
      v_status,v_diagnostics
    );
    v_number := v_number + 1;
  end loop;

  update public.import_jobs
  set status='preview',
      valid_rows=(select count(*) from public.import_rows where import_job_id=v_job and status='valid'),
      invalid_rows=(select count(*) from public.import_rows where import_job_id=v_job and status='invalid'),
      error_summary=coalesce((select jsonb_agg(diagnostics) from public.import_rows where import_job_id=v_job and status='invalid'),'[]'::jsonb)
  where id=v_job and organization_id=v_org;

  insert into public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  values(v_org,auth.uid(),'import.stage','import_job',v_job,'success',jsonb_build_object('source_name',p_source_name,'rows',jsonb_array_length(p_rows)));

  return v_job;
end;
$$;

grant execute on function public.stage_product_import(text,text,jsonb) to authenticated;
revoke execute on function public.stage_product_import(text,text,jsonb) from anon;

comment on function public.stage_product_import(text,text,jsonb) is 'Server-validates and stages a bounded XLSX-derived product dataset without mutating canonical product data; malformed numeric cells become row diagnostics instead of aborting the entire import.';

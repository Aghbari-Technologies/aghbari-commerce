-- R7 executable import commit boundary: staged rows become canonical data only through an explicit atomic command.
create or replace function app.commit_product_import(p_job_id uuid)
returns table(committed_rows integer, job_status text)
language plpgsql security definer set search_path=app,public as $$
declare v_org uuid:=app.current_organization_id(); v_actor uuid:=app.current_actor_id(); v_job app.import_jobs%rowtype; v_row record; v_count integer:=0; v_category uuid;
begin
  if v_org is null or v_actor is null then raise exception 'authentication context required' using errcode='28000'; end if;
  if not exists(select 1 from app.user_roles ur join app.roles r on r.id=ur.role_id where ur.user_id=v_actor and ur.organization_id=v_org and r.code in ('admin','catalog_manager','import_manager')) then raise exception 'forbidden' using errcode='42501'; end if;
  select * into v_job from app.import_jobs where id=p_job_id and organization_id=v_org for update;
  if not found then raise exception 'import job not found' using errcode='P0002'; end if;
  if v_job.status <> 'preview_ready' then raise exception 'import job is not ready for commit' using errcode='22000'; end if;
  if v_job.invalid_row_count > 0 then raise exception 'invalid rows prevent atomic commit' using errcode='22023'; end if;
  update app.import_jobs set status='committing' where id=p_job_id;
  for v_row in select id,row_number,normalized_data from app.import_rows where import_job_id=p_job_id and organization_id=v_org and row_status='valid' order by row_number for update loop
    v_category:=nullif(v_row.normalized_data->>'category_id','')::uuid;
    if v_category is not null and not exists(select 1 from app.categories c where c.id=v_category and c.organization_id=v_org) then raise exception 'invalid category scope' using errcode='42501'; end if;
    insert into app.products(organization_id,category_id,sku,name,description,unit)
    values(v_org,v_category,upper(trim(v_row.normalized_data->>'sku')),coalesce(nullif(trim(v_row.normalized_data->>'name'),''),'Unnamed'),coalesce(v_row.normalized_data->>'description',''),coalesce(nullif(trim(v_row.normalized_data->>'unit'),''),'unit'))
    on conflict (organization_id,sku) do update set category_id=excluded.category_id,name=excluded.name,description=excluded.description,unit=excluded.unit,updated_at=now();
    update app.import_rows set row_status='committed' where id=v_row.id; v_count:=v_count+1;
  end loop;
  update app.import_jobs set status='completed',valid_row_count=v_count,completed_at=now() where id=p_job_id;
  return query select v_count,'completed'::text;
end; $$;
revoke execute on function app.commit_product_import(uuid) from public;
do $$ begin if exists(select 1 from pg_roles where rolname='authenticated') then execute 'grant execute on function app.commit_product_import(uuid) to authenticated'; end if; end $$;

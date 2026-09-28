create or replace function public.save_order_template(
  p_name text,
  p_lines jsonb,
  p_branch_label text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid := public.current_organization_id();
  v_customer uuid := public.current_customer_id();
  v_template uuid;
  v_line jsonb;
  v_product uuid;
  v_qty integer;
  v_max_templates integer := 50;
begin
  if v_org is null or v_customer is null then raise exception using errcode='42501', message='authenticated customer context required'; end if;
  if not exists (select 1 from public.customers where id=v_customer and organization_id=v_org and is_active) then raise exception using errcode='42501', message='active customer required'; end if;
  if p_name is null or char_length(trim(p_name)) not between 1 and 120 then raise exception using errcode='22023', message='template name is invalid'; end if;
  if jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) < 1 or jsonb_array_length(p_lines) > 100 then raise exception using errcode='22023', message='template lines are invalid'; end if;
  v_max_templates := coalesce((select greatest(1, least(coalesce((config->>'maxTemplates')::integer, 50), 500)) from public.client_ui_settings where organization_id=v_org), 50);
  if (select count(*) from public.order_templates where organization_id=v_org and customer_id=v_customer) >= v_max_templates then raise exception using errcode='P0001', message='template limit reached'; end if;
  insert into public.order_templates(organization_id, customer_id, name, branch_label, lines) values(v_org, v_customer, trim(p_name), nullif(trim(p_branch_label), ''), '[]'::jsonb) returning id into v_template;
  for v_line in select value from jsonb_array_elements(p_lines) loop
    v_product := nullif(v_line->>'product_id','')::uuid;
    v_qty := (v_line->>'quantity')::integer;
    if v_product is null or v_qty is null or v_qty < 1 or v_qty > 1000000 then raise exception using errcode='22023', message='template line is invalid'; end if;
    if exists (select 1 from public.order_template_lines where template_id=v_template and product_id=v_product) then raise exception using errcode='22023', message='duplicate product in template'; end if;
    if not exists (select 1 from public.products where id=v_product and organization_id=v_org) then raise exception using errcode='42501', message='template product is outside organization'; end if;
    insert into public.order_template_lines(organization_id, template_id, product_id, quantity) values(v_org, v_template, v_product, v_qty);
  end loop;
  update public.order_templates set lines=(select coalesce(jsonb_agg(jsonb_build_object('product_id',product_id,'quantity',quantity) order by created_at),'[]'::jsonb) from public.order_template_lines where template_id=v_template), updated_at=now() where id=v_template;
  return v_template;
end;
$$;
revoke all on function public.save_order_template(text,jsonb,text) from public, anon;
grant execute on function public.save_order_template(text,jsonb,text) to authenticated;

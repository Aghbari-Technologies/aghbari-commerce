create or replace function public.complete_operation_idempotency(p_id uuid, p_status text, p_response_reference uuid default null::uuid)
returns public.operation_idempotency
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_org uuid:=public.current_organization_id();
  v_role public.user_role:=public.current_role();
  v_row public.operation_idempotency%rowtype;
begin
  if v_org is null or v_role not in ('owner','admin','sales','warehouse') then
    raise exception using errcode='42501',message='idempotency completion access required';
  end if;
  if p_status not in ('completed','failed') then
    raise exception using errcode='22023',message='invalid idempotency completion';
  end if;
  update public.operation_idempotency
  set status=p_status,response_reference=coalesce(p_response_reference,response_reference)
  where id=p_id and organization_id=v_org
  returning * into v_row;
  if not found then
    raise exception using errcode='P0002',message='idempotency record not found';
  end if;
  return v_row;
end;
$function$;

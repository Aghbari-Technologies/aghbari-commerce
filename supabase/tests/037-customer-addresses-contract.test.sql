-- Customer delivery-address contract checks.
-- Static contract only; destructive/runtime proof remains in the exact migration workflow.

do $$
declare
  v_cols integer;
  v_rls boolean;
  v_force boolean;
  v_default boolean;
  v_audit_trigger boolean;
  v_create_auth boolean;
  v_create_anon boolean;
  v_update_auth boolean;
  v_update_anon boolean;
  v_delete_auth boolean;
  v_delete_anon boolean;
  v_save_auth boolean;
  v_fk boolean;
begin
  select count(*) into v_cols
  from information_schema.columns
  where table_schema='public' and table_name='customer_addresses';

  if v_cols < 14 then
    raise exception 'customer_addresses incomplete: % columns', v_cols;
  end if;

  select c.relrowsecurity, c.relforcerowsecurity
  into v_rls, v_force
  from pg_class c
  join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname='customer_addresses';

  if not coalesce(v_rls,false) or not coalesce(v_force,false) then
    raise exception 'customer_addresses RLS/force-RLS contract is missing';
  end if;

  select exists(
    select 1 from pg_indexes
    where schemaname='public'
      and tablename='customer_addresses'
      and indexname='customer_addresses_one_default_idx'
  ) into v_default;

  if not v_default then
    raise exception 'single-default address index is missing';
  end if;

  select exists(
    select 1
    from pg_trigger t
    join pg_class c on c.oid=t.tgrelid
    join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public'
      and c.relname='customer_addresses'
      and t.tgname='customer_addresses_audit'
      and not t.tgisinternal
  ) into v_audit_trigger;

  if not v_audit_trigger then
    raise exception 'customer_addresses audit trigger is missing';
  end if;

  select exists(
    select 1
    from information_schema.table_constraints
    where constraint_schema='public'
      and table_name='customer_addresses'
      and constraint_name='customer_addresses_customer_org_fk'
  ) into v_fk;

  if not v_fk then
    raise exception 'tenant/customer composite FK is missing';
  end if;

  select has_function_privilege('authenticated','public.create_customer_address(text,text,text,text,text,text,text,text,boolean)','execute'),
         has_function_privilege('anon','public.create_customer_address(text,text,text,text,text,text,text,text,boolean)','execute')
  into v_create_auth, v_create_anon;

  select has_function_privilege('authenticated','public.update_customer_address(uuid,text,text,text,text,text,text,text,text,boolean)','execute'),
         has_function_privilege('anon','public.update_customer_address(uuid,text,text,text,text,text,text,text,text,boolean)','execute')
  into v_update_auth, v_update_anon;

  select has_function_privilege('authenticated','public.delete_customer_address(uuid)','execute'),
         has_function_privilege('anon','public.delete_customer_address(uuid)','execute')
  into v_delete_auth, v_delete_anon;

  select has_function_privilege('authenticated','public.save_customer_address(uuid,uuid,text,text,text,text,text,text,text,text,boolean)','execute')
  into v_save_auth;

  if not v_create_auth or v_create_anon or not v_update_auth or v_update_anon
     or not v_delete_auth or v_delete_anon or v_save_auth then
    raise exception 'customer-address RPC privilege boundary is invalid';
  end if;
end $$;

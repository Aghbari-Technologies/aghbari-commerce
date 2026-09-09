do $$
declare
  legacy_catalog_oid oid := to_regprocedure('public.get_catalog(text,uuid,integer,integer)');
begin
  if legacy_catalog_oid is not null then
    execute format('revoke execute on function %s from authenticated', legacy_catalog_oid::regprocedure);
    execute format('revoke execute on function %s from anon', legacy_catalog_oid::regprocedure);
    execute format('revoke execute on function %s from public', legacy_catalog_oid::regprocedure);
  end if;
end;
$$;

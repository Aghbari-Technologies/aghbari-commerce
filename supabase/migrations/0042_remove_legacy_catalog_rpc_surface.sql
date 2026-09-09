do $$
declare
  legacy_catalog regprocedure := to_regprocedure('public.get_catalog(text,uuid,integer,integer)');
begin
  if legacy_catalog is not null then
    execute format('revoke execute on function %s from authenticated, anon, public', legacy_catalog);
  end if;
end;
$$;

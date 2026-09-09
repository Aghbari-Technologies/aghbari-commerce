do $$
begin
  if to_regprocedure('public.get_catalog(text,uuid,integer,integer)') is not null then
    execute 'revoke execute on function public.get_catalog(text,uuid,integer,integer) from authenticated, anon, public';
  end if;
end;
$$;

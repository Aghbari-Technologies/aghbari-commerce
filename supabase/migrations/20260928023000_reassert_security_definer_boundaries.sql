-- Forward hardening to match the reviewed production security boundary.
-- Do not alter authenticated application privileges; remove anonymous exposure
-- and pin every existing public SECURITY DEFINER routine to an empty search_path.
begin;

do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure::text as routine
    from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.prosecdef
  loop
    execute format('alter function %s set search_path = ''''', r.routine);
    execute format('revoke execute on function %s from anon, public', r.routine);
  end loop;
end $$;

commit;

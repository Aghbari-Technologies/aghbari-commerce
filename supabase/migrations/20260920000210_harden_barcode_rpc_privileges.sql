-- Harden the new barcode RPC boundary against PostgreSQL's implicit PUBLIC EXECUTE.
-- Keep authenticated/service_role access explicit; no anonymous/public execution.

revoke execute on function public.get_catalog_with_barcode(text,uuid,integer,integer,uuid) from public, anon;
revoke execute on function public.upsert_product(uuid,text,text,text,uuid,text,text,text) from public, anon;
revoke execute on function public.upsert_product(uuid,text,text,text,uuid,text,text) from public, anon;

grant execute on function public.get_catalog_with_barcode(text,uuid,integer,integer,uuid) to authenticated;
grant execute on function public.upsert_product(uuid,text,text,text,uuid,text,text,text) to authenticated;
grant execute on function public.upsert_product(uuid,text,text,text,uuid,text,text) to authenticated;

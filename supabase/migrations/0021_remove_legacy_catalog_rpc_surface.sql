-- The warehouse-aware 5-argument catalog RPC is now the canonical application boundary.
-- Remove direct authenticated access to the legacy 4-argument SECURITY DEFINER API path.
revoke execute on function public.get_catalog(text,uuid,integer,integer) from authenticated;
revoke execute on function public.get_catalog(text,uuid,integer,integer) from anon;
revoke execute on function public.get_catalog(text,uuid,integer,integer) from public;

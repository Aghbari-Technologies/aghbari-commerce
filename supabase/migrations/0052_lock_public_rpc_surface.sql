revoke execute on function public.clear_cart() from public;
-- The legacy 4-argument get_catalog overload was removed by 0042_remove_legacy_catalog_rpc_surface.
-- Do not revoke/grant that removed signature here; the live catalog RPC is the 5-argument overload.
grant execute on function public.clear_cart() to authenticated;

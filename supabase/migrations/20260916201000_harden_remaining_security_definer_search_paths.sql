-- Final security hardening for exposed SECURITY DEFINER RPCs that were
-- recreated after the earlier hardening migrations. Keep the public signatures
-- unchanged and pin execution to an empty search_path.
ALTER FUNCTION public.get_catalog(text, uuid, integer, integer, uuid) SET search_path = '';
ALTER FUNCTION public.stage_product_import(text, text, jsonb) SET search_path = '';
ALTER FUNCTION public.commit_product_import(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.save_order_template(text, jsonb, text) SET search_path = '';
ALTER FUNCTION public.apply_order_template(uuid, uuid, text) SET search_path = '';
ALTER FUNCTION public.set_stock_threshold(uuid, uuid, integer, integer, integer) SET search_path = '';
ALTER FUNCTION public.register_product_media(uuid, text, text, integer, integer, bigint) SET search_path = '';

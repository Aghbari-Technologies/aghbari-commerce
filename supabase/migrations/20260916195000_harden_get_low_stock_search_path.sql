-- Security hardening: pin the exposed read RPC to an empty search_path.
-- The function body already schema-qualifies all referenced objects.
ALTER FUNCTION public.get_low_stock() SET search_path='';

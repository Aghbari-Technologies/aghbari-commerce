ALTER FUNCTION public.save_order_template(text, jsonb, text) SET search_path = '';
ALTER FUNCTION public.apply_order_template(uuid, uuid, text) SET search_path = '';
ALTER FUNCTION public.set_stock_threshold(uuid, uuid, integer, integer, integer) SET search_path = '';

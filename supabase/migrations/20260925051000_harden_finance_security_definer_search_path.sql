-- Harden finance SECURITY DEFINER functions with the same empty search_path contract
-- used by the rest of the transactional authorization boundary.

ALTER FUNCTION public.record_payment(uuid,numeric,public.payment_method,uuid,text,text) SET search_path = '';
ALTER FUNCTION public.record_expense(uuid,uuid,text,numeric,text,text,date,text) SET search_path = '';

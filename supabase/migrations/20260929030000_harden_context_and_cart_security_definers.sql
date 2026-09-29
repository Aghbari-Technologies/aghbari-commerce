-- Finalize security hardening for legacy customer/cart context helpers.
-- These functions are server-authoritative helpers for authenticated customer/session flows.
-- Invitation acceptance is routed through the customer-invitations Edge Function,
-- so the direct token lookup RPC is not exposed to anonymous clients.

ALTER FUNCTION public.current_customer_id() SET search_path='';
ALTER FUNCTION public.current_organization_id() SET search_path='';
ALTER FUNCTION public."current_role"() SET search_path='';
ALTER FUNCTION public.is_staff() SET search_path='';
ALTER FUNCTION public.get_or_create_cart() SET search_path='';
ALTER FUNCTION public.get_cart() SET search_path='';
ALTER FUNCTION public.set_cart_item(uuid,integer) SET search_path='';
ALTER FUNCTION public.clear_cart() SET search_path='';

REVOKE EXECUTE ON FUNCTION public.current_customer_id() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.current_organization_id() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public."current_role"() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.get_or_create_cart() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.get_cart() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.set_cart_item(uuid,integer) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.clear_cart() FROM public, anon;

GRANT EXECUTE ON FUNCTION public.current_customer_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public."current_role"() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_cart() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cart() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_cart_item(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_cart() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_customer_invitation_for_acceptance(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_customer_invitation_for_acceptance(text) TO service_role;

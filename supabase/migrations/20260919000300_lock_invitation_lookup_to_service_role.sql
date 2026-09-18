-- The browser accepts invitations through the customer-invitations Edge Function.
-- The Edge Function performs invitation lookup/consumption with service_role.
-- No anonymous or signed-in client should call the invitation lookup RPC directly.
REVOKE ALL ON FUNCTION public.get_customer_invitation_for_acceptance(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_customer_invitation_for_acceptance(text) TO service_role;

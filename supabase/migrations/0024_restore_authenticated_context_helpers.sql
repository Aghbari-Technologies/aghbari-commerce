-- RLS policies invoke these SECURITY DEFINER context helpers under the caller role.
-- Keep anonymous/public execution denied, but allow authenticated callers so RLS
-- evaluation can resolve tenant/customer/role context without permission errors.
revoke execute on function public.current_organization_id() from public;
revoke execute on function public.current_customer_id() from public;
revoke execute on function public.current_role() from public;
revoke execute on function public.is_staff() from public;

grant execute on function public.current_organization_id() to authenticated;
grant execute on function public.current_customer_id() to authenticated;
grant execute on function public.current_role() to authenticated;
grant execute on function public.is_staff() to authenticated;

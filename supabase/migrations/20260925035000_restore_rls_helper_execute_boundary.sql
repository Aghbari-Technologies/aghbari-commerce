-- RLS helper functions are called directly by row-level security policies.
-- Their EXECUTE privilege for authenticated users is therefore required for policy evaluation.
-- Keep the helpers SECURITY DEFINER + empty search_path; do not expose them to anon/public.

grant execute on function public.current_role() to authenticated;
grant execute on function public.current_customer_id() to authenticated;
grant execute on function public.current_organization_id() to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_staff_reader() to authenticated;

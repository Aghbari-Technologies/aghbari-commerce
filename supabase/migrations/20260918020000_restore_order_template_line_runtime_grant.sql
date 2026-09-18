-- Restore the authenticated read grant required by the customer template runtime.
-- RLS remains the authorization boundary; anon/public remain blocked.
revoke all on table public.order_template_lines from public, anon;
grant select on table public.order_template_lines to authenticated;

-- B2B runtime grants: allow authenticated customer sessions to pass through RLS.
-- RLS remains the authorization boundary; this migration does not bypass it.
grant select on table public.carts to authenticated;
grant select on table public.cart_items to authenticated;
grant select on table public.orders to authenticated;
grant select on table public.order_items to authenticated;
grant select on table public.customer_ledger_entries to authenticated;
grant select on table public.customer_credit_accounts to authenticated;
grant select on table public.customer_price_tiers to authenticated;
grant select on table public.client_ui_settings to authenticated;

-- B2B customer runtime persistence/security compatibility gate.
-- The operational/customer/order engine is canonical in earlier migrations.
-- This migration MUST NOT create a second schema using company_id or shadow core tables.

-- Fail fast if the canonical tenant model is missing or drifted.
do $$
begin
  if not exists (select 1 from information_schema.tables where table_schema='public' and table_name='profiles') then
    raise exception 'canonical table public.profiles is missing';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='organization_id') then
    raise exception 'public.profiles.organization_id is required';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='customers' and column_name='organization_id') then
    raise exception 'public.customers.organization_id is required';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='organization_id') then
    raise exception 'public.orders.organization_id is required';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='cart_items' and column_name='organization_id') then
    raise exception 'public.cart_items.organization_id is required';
  end if;
end;
$$;

-- Customer-owned portal tables are already created canonically by 0053.
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.customer_price_tiers enable row level security;
alter table public.order_templates enable row level security;
alter table public.customer_credit_accounts enable row level security;
alter table public.customer_ledger_entries enable row level security;
alter table public.client_ui_settings enable row level security;

-- Keep the authenticated RPC surface on the canonical functions only.
grant execute on function public.current_customer_id() to authenticated;
grant execute on function public.current_organization_id() to authenticated;
grant execute on function public.get_cart() to authenticated;
grant execute on function public.set_cart_item(uuid,integer) to authenticated;
grant execute on function public.remove_cart_item(uuid) to authenticated;
grant execute on function public.clear_cart() to authenticated;
grant execute on function public.create_order(text,uuid,jsonb) to authenticated;

comment on table public.customer_price_tiers is 'Canonical B2B customer-specific pricing tiers; tenant derived from customer ownership.';
comment on table public.order_templates is 'Canonical B2B customer-owned order templates; no parallel company-scoped table.';
comment on table public.customer_credit_accounts is 'Canonical B2B customer credit account; financial truth remains server/ERP owned.';
comment on table public.customer_ledger_entries is 'Canonical B2B customer ledger projection; read-only for customer users.';
comment on table public.client_ui_settings is 'Canonical organization-scoped B2B client UI configuration.';

-- B2B Customer Portal v3 persistence.
-- All customer-owned records are protected by authenticated profile.customer_id RLS.

create table if not exists public.customer_price_tiers (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  min_quantity integer not null check (min_quantity >= 1),
  unit_price numeric(18,2) not null check (unit_price >= 0),
  currency text not null default 'YER' check (char_length(currency) = 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, product_id, min_quantity)
);
create index if not exists idx_customer_price_tiers_customer_product on public.customer_price_tiers(customer_id, product_id, min_quantity);

create table if not exists public.order_templates (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  branch_label text,
  lines jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_order_templates_customer_updated on public.order_templates(customer_id, updated_at desc);

create table if not exists public.customer_credit_accounts (
  customer_id uuid primary key references public.customers(id) on delete cascade,
  currency text not null default 'YER' check (char_length(currency) = 3),
  credit_limit numeric(18,2) not null default 0 check (credit_limit >= 0),
  outstanding_balance numeric(18,2) not null default 0 check (outstanding_balance >= 0),
  available_credit numeric(18,2) not null default 0 check (available_credit >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  reference text,
  description text not null,
  debit numeric(18,2) not null default 0 check (debit >= 0),
  credit numeric(18,2) not null default 0 check (credit >= 0),
  due_date date,
  status text not null default 'open' check (status in ('open','paid','overdue','pending')),
  created_at timestamptz not null default now()
);
create index if not exists idx_customer_ledger_customer_date on public.customer_ledger_entries(customer_id, created_at desc);

create table if not exists public.client_ui_settings (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  config jsonb not null default '{"showSearch":true,"showCategories":true,"showExcel":true,"showCredit":true,"showTemplates":true,"showInventory":true,"showRetailPrice":false,"showQuickOrder":true}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.customer_price_tiers enable row level security;
alter table public.order_templates enable row level security;
alter table public.customer_credit_accounts enable row level security;
alter table public.customer_ledger_entries enable row level security;
alter table public.client_ui_settings enable row level security;

-- Customer data is scoped through the authenticated profile; clients cannot choose another customer id.
drop policy if exists customer_price_tiers_select_own on public.customer_price_tiers;
create policy customer_price_tiers_select_own on public.customer_price_tiers for select to authenticated using (customer_id = (select customer_id from public.profiles where id = auth.uid()));
drop policy if exists order_templates_select_own on public.order_templates;
create policy order_templates_select_own on public.order_templates for select to authenticated using (customer_id = (select customer_id from public.profiles where id = auth.uid()));
drop policy if exists order_templates_insert_own on public.order_templates;
create policy order_templates_insert_own on public.order_templates for insert to authenticated with check (customer_id = (select customer_id from public.profiles where id = auth.uid()));
drop policy if exists order_templates_update_own on public.order_templates;
create policy order_templates_update_own on public.order_templates for update to authenticated using (customer_id = (select customer_id from public.profiles where id = auth.uid())) with check (customer_id = (select customer_id from public.profiles where id = auth.uid()));
drop policy if exists order_templates_delete_own on public.order_templates;
create policy order_templates_delete_own on public.order_templates for delete to authenticated using (customer_id = (select customer_id from public.profiles where id = auth.uid()));
drop policy if exists customer_credit_accounts_select_own on public.customer_credit_accounts;
create policy customer_credit_accounts_select_own on public.customer_credit_accounts for select to authenticated using (customer_id = (select customer_id from public.profiles where id = auth.uid()));
drop policy if exists customer_ledger_entries_select_own on public.customer_ledger_entries;
create policy customer_ledger_entries_select_own on public.customer_ledger_entries for select to authenticated using (customer_id = (select customer_id from public.profiles where id = auth.uid()));
drop policy if exists client_ui_settings_select_staff on public.client_ui_settings;
create policy client_ui_settings_select_staff on public.client_ui_settings for select to authenticated using (organization_id = (select organization_id from public.profiles where id = auth.uid()) and public.is_staff());
drop policy if exists client_ui_settings_write_staff on public.client_ui_settings;
create policy client_ui_settings_write_staff on public.client_ui_settings for all to authenticated using (organization_id = (select organization_id from public.profiles where id = auth.uid()) and public.is_staff()) with check (organization_id = (select organization_id from public.profiles where id = auth.uid()) and public.is_staff());

-- Financial truth remains server/ERP owned; customers have read-only access.

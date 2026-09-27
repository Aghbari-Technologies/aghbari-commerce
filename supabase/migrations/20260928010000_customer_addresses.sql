-- Canonical customer delivery addresses.
-- Customer-owned saved addresses are tenant/customer scoped.
create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text not null,
  recipient_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  district text,
  notes text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(label)) between 1 and 80),
  check (length(trim(recipient_name)) between 1 and 120),
  check (length(trim(phone)) between 3 and 40),
  check (length(trim(address_line1)) between 1 and 240),
  check (address_line2 is null or length(trim(address_line2)) <= 240),
  check (length(trim(city)) between 1 and 100),
  check (district is null or length(trim(district)) <= 120),
  check (notes is null or length(trim(notes)) <= 300),
  unique (organization_id, id)
);

create index if not exists customer_addresses_customer_idx
  on public.customer_addresses(customer_id, is_default desc, created_at desc);

create index if not exists customer_addresses_org_customer_idx
  on public.customer_addresses(organization_id, customer_id, created_at desc);

create unique index if not exists customer_addresses_one_default_idx
  on public.customer_addresses(customer_id)
  where is_default = true;

alter table public.customer_addresses enable row level security;

drop policy if exists customer_addresses_select_own on public.customer_addresses;
create policy customer_addresses_select_own
  on public.customer_addresses
  for select
  to authenticated
  using (
    organization_id = public.current_organization_id()
    and customer_id = public.current_customer_id()
  );

revoke all on public.customer_addresses from anon, authenticated;
grant select on public.customer_addresses to authenticated;

comment on table public.customer_addresses is
  'Canonical customer-owned delivery addresses; tenant/customer scoped and not an alternate transactional truth.';

-- Aghbari operational core, first executable schema slice.
-- This migration is intentionally forward-only and remains a candidate until
-- Batch-3 reconciliation. It contains no analytical/BI tables.

create extension if not exists pgcrypto;

create type public.customer_status as enum ('PENDING', 'APPROVED', 'BLOCKED', 'SUSPENDED');
create type public.product_status as enum ('ACTIVE', 'INACTIVE', 'ARCHIVED');
create type public.order_status as enum ('NEW', 'CONFIRMED', 'IN_PROGRESS', 'PREPARED', 'DELIVERED', 'CANCELLED');
create type public.inventory_movement_type as enum ('RECEIPT', 'SALE', 'ADJUSTMENT', 'RESERVATION', 'RELEASE', 'RETURN', 'TRANSFER');
create type public.outbox_status as enum ('PENDING', 'PROCESSING', 'DELIVERED', 'RETRYABLE', 'DEAD_LETTER');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  next_order_number bigint not null default 1 check (next_order_number > 0),
  created_at timestamptz not null default now()
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  name text not null,
  code text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, code)
);

create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  branch_id uuid not null references public.branches(id),
  name text not null,
  code text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (branch_id, code)
);

create index branches_organization_id_idx on public.branches(organization_id);
create index warehouses_organization_branch_idx on public.warehouses(organization_id, branch_id);

create table public.users (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  external_auth_id uuid unique,
  display_name text not null,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  code text not null,
  name text not null,
  unique (organization_id, code)
);

create table public.user_roles (
  user_id uuid not null references public.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  branch_id uuid references public.branches(id),
  warehouse_id uuid references public.warehouses(id),
  primary key (user_id, role_id, branch_id, warehouse_id)
);

create table public.customer_tiers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  code text not null,
  name text not null,
  unique (organization_id, code)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  user_id uuid unique references public.users(id),
  tier_id uuid not null references public.customer_tiers(id),
  status public.customer_status not null default 'PENDING',
  name text not null,
  phone text,
  email text,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_organization_status_idx on public.customers(organization_id, status);
create index customers_tier_idx on public.customers(tier_id);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  parent_id uuid references public.categories(id),
  name text not null,
  slug text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  code text not null,
  name text not null,
  unique (organization_id, code)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  category_id uuid references public.categories(id),
  unit_id uuid references public.units(id),
  sku text not null,
  name text not null,
  description text,
  status public.product_status not null default 'ACTIVE',
  track_lots boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, sku)
);

create table public.product_identifiers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  product_id uuid not null references public.products(id) on delete cascade,
  identifier_type text not null check (identifier_type in ('SKU', 'BARCODE', 'ITEM_NUMBER')),
  value text not null,
  unique (organization_id, identifier_type, value)
);

create index products_category_status_idx on public.products(organization_id, category_id, status);
create index product_identifiers_lookup_idx on public.product_identifiers(organization_id, value);

create table public.price_lists (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  tier_id uuid not null references public.customer_tiers(id),
  code text not null,
  name text not null,
  active boolean not null default true,
  unique (organization_id, code)
);

create table public.product_prices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  price_list_id uuid not null references public.price_lists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  unit_price numeric(14,2) not null check (unit_price >= 0),
  effective_from timestamptz not null,
  effective_to timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (effective_to is null or effective_to > effective_from)
);

create index product_prices_resolution_idx on public.product_prices(
  organization_id, price_list_id, product_id, active, effective_from desc
);

create table public.inventory_balances (
  organization_id uuid not null references public.organizations(id),
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null default 0 check (quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0 and reserved_quantity <= quantity),
  version integer not null default 1 check (version > 0),
  updated_at timestamptz not null default now(),
  primary key (warehouse_id, product_id)
);

create index inventory_balances_org_product_idx on public.inventory_balances(organization_id, product_id, warehouse_id);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  warehouse_id uuid not null references public.warehouses(id),
  product_id uuid not null references public.products(id),
  movement_type public.inventory_movement_type not null,
  quantity_delta integer not null check (quantity_delta <> 0),
  source_type text not null,
  source_id text not null,
  operation_id uuid not null,
  actor_user_id uuid references public.users(id),
  reason text not null,
  occurred_at timestamptz not null default now(),
  unique (organization_id, operation_id)
);

create index inventory_movements_lookup_idx on public.inventory_movements(organization_id, warehouse_id, product_id, occurred_at desc);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  customer_id uuid not null references public.customers(id),
  branch_id uuid not null references public.branches(id),
  warehouse_id uuid not null references public.warehouses(id),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index carts_one_active_per_customer_idx
  on public.carts(organization_id, customer_id) where active;

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  customer_id uuid not null references public.customers(id),
  branch_id uuid not null references public.branches(id),
  warehouse_id uuid not null references public.warehouses(id),
  order_number text not null,
  operation_id uuid not null,
  payload_hash text not null,
  status public.order_status not null default 'NEW',
  subtotal numeric(14,2) not null default 0 check (subtotal >= 0),
  total numeric(14,2) not null default 0 check (total >= 0),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, order_number),
  unique (organization_id, operation_id)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(14,2) not null check (unit_price >= 0),
  line_total numeric(14,2) not null check (line_total >= 0),
  pricing_context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (order_id, product_id)
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  actor_user_id uuid references public.users(id),
  correlation_id uuid,
  created_at timestamptz not null default now()
);

create index orders_action_queue_idx on public.orders(organization_id, status, created_at desc);
create index orders_customer_history_idx on public.orders(organization_id, customer_id, created_at desc);

create table public.outbox_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  event_type text not null,
  event_version integer not null default 1 check (event_version > 0),
  aggregate_type text not null,
  aggregate_id uuid not null,
  operation_id uuid not null,
  correlation_id uuid not null,
  payload_hash text not null,
  payload jsonb not null,
  status public.outbox_status not null default 'PENDING',
  attempts integer not null default 0 check (attempts >= 0),
  next_attempt_at timestamptz,
  last_error text,
  occurred_at timestamptz not null default now(),
  delivered_at timestamptz,
  unique (organization_id, operation_id)
);

create index outbox_retry_queue_idx on public.outbox_events(status, next_attempt_at, occurred_at);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  actor_user_id uuid references public.users(id),
  action text not null,
  target_type text not null,
  target_id uuid,
  correlation_id uuid,
  result text not null check (result in ('SUCCESS', 'REJECTED', 'FAILED')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_events_entity_time_idx on public.audit_events(organization_id, target_type, target_id, created_at desc);

comment on table public.orders is 'Canonical operational order; financial facts are server-calculated and immutable per accepted version.';
comment on table public.inventory_balances is 'Transactional inventory projection; mutations must go through controlled domain operations.';
comment on table public.outbox_events is 'Durable post-transaction integration boundary; external delivery is at-least-once and idempotent.';

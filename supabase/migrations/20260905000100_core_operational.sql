create extension if not exists pgcrypto;

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  status text not null default 'active' check (status in ('active','suspended','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  name text not null,
  code text not null,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  created_at timestamptz not null default now(),
  unique (organization_id, code)
);
create index if not exists branches_org_idx on branches(organization_id, status);

create table if not exists warehouses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  branch_id uuid not null references branches(id),
  name text not null,
  code text not null,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  created_at timestamptz not null default now(),
  unique (organization_id, code)
);
create index if not exists warehouses_branch_idx on warehouses(branch_id, status);

create table if not exists users (
  id uuid primary key,
  organization_id uuid not null references organizations(id),
  branch_id uuid references branches(id),
  display_name text not null,
  status text not null default 'active' check (status in ('pending','active','suspended','disabled')),
  created_at timestamptz not null default now()
);
create index if not exists users_org_idx on users(organization_id, status);

create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  name text not null,
  unique (organization_id, name)
);

create table if not exists user_roles (
  user_id uuid not null references users(id) on delete cascade,
  role_id uuid not null references roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table if not exists customer_tiers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  name text not null,
  rank integer not null check (rank >= 0),
  unique (organization_id, name)
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  account_user_id uuid references users(id),
  tier_id uuid not null references customer_tiers(id),
  branch_id uuid references branches(id),
  name text not null,
  phone text,
  status text not null default 'pending' check (status in ('pending','active','blocked','archived')),
  version bigint not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists customers_org_status_idx on customers(organization_id, status);
create index if not exists customers_user_idx on customers(account_user_id);

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  name text not null,
  phone text,
  status text not null default 'active' check (status in ('active','blocked','archived')),
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  parent_id uuid references categories(id),
  name text not null,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  name text not null,
  code text not null,
  precision_scale integer not null default 0 check (precision_scale between 0 and 6),
  unique (organization_id, code)
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  category_id uuid references categories(id),
  unit_id uuid not null references units(id),
  sku text not null,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  version bigint not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, sku)
);
create index if not exists products_org_status_idx on products(organization_id, status);
create index if not exists products_category_idx on products(category_id, status);

create table if not exists product_identifiers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  product_id uuid not null references products(id) on delete cascade,
  identifier_type text not null,
  identifier_value text not null,
  unique (organization_id, identifier_type, identifier_value)
);
create index if not exists product_identifiers_product_idx on product_identifiers(product_id);

create table if not exists price_lists (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  customer_tier_id uuid references customer_tiers(id),
  name text not null,
  currency text not null default 'YER',
  status text not null default 'active' check (status in ('active','inactive','archived')),
  unique (organization_id, name)
);

create table if not exists product_prices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  price_list_id uuid not null references price_lists(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  unit_price numeric(20,4) not null check (unit_price >= 0),
  effective_from timestamptz not null,
  effective_to timestamptz,
  version bigint not null default 1 check (version > 0),
  check (effective_to is null or effective_to > effective_from)
);
create index if not exists product_prices_lookup_idx on product_prices(price_list_id, product_id, effective_from desc);

create table if not exists inventory_balances (
  warehouse_id uuid not null references warehouses(id),
  product_id uuid not null references products(id),
  available numeric(20,4) not null default 0 check (available >= 0),
  reserved numeric(20,4) not null default 0 check (reserved >= 0),
  version bigint not null default 1 check (version > 0),
  updated_at timestamptz not null default now(),
  primary key (warehouse_id, product_id)
);

create table if not exists inventory_movements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  warehouse_id uuid not null references warehouses(id),
  product_id uuid not null references products(id),
  movement_type text not null check (movement_type in ('receive','sale','reservation','release','adjustment','transfer_in','transfer_out','return')),
  quantity numeric(20,4) not null check (quantity > 0),
  source_type text not null,
  source_id text not null,
  actor_id uuid,
  correlation_id text not null,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, idempotency_key)
);
create index if not exists inventory_movements_lookup_idx on inventory_movements(warehouse_id, product_id, created_at desc);

create table if not exists carts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  customer_id uuid not null references customers(id),
  branch_id uuid not null references branches(id),
  warehouse_id uuid not null references warehouses(id),
  status text not null default 'active' check (status in ('active','checked_out','abandoned')),
  version bigint not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists carts_one_active_per_customer on carts(customer_id) where status = 'active';

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity numeric(20,4) not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_id)
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  customer_id uuid not null references customers(id),
  branch_id uuid not null references branches(id),
  warehouse_id uuid not null references warehouses(id),
  order_number text not null,
  status text not null default 'pending' check (status in ('draft','pending','confirmed','preparing','ready','delivered','cancelled')),
  subtotal numeric(20,4) not null check (subtotal >= 0),
  total numeric(20,4) not null check (total >= 0),
  idempotency_key text not null,
  version bigint not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, order_number),
  unique (organization_id, customer_id, idempotency_key)
);
create index if not exists orders_customer_time_idx on orders(customer_id, created_at desc);
create index if not exists orders_scope_status_time_idx on orders(organization_id, branch_id, status, created_at desc);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity numeric(20,4) not null check (quantity > 0),
  unit_price numeric(20,4) not null check (unit_price >= 0),
  line_total numeric(20,4) not null check (line_total >= 0),
  pricing_context jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists order_items_order_idx on order_items(order_id);

create table if not exists order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  actor_id uuid,
  correlation_id text not null,
  created_at timestamptz not null default now()
);
create index if not exists order_status_history_order_time_idx on order_status_history(order_id, created_at desc);

create table if not exists outbox_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  event_type text not null,
  event_version integer not null default 1 check (event_version > 0),
  aggregate_type text not null,
  aggregate_id uuid not null,
  correlation_id text not null,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending','processing','delivered','failed','dead_letter')),
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists outbox_retry_idx on outbox_events(status, available_at);
create index if not exists outbox_aggregate_idx on outbox_events(aggregate_type, aggregate_id, created_at);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  actor_id uuid,
  action text not null,
  target_type text not null,
  target_id uuid,
  correlation_id text not null,
  result text not null check (result in ('success','failure','denied')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_entity_time_idx on audit_events(organization_id, target_type, target_id, created_at desc);
create index if not exists audit_time_idx on audit_events(organization_id, created_at desc);

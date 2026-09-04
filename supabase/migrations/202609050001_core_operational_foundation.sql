begin;

create extension if not exists pgcrypto;

create type public.order_status as enum (
  'DRAFT', 'PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED'
);

create type public.inventory_movement_type as enum (
  'RECEIPT', 'SALE', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'RESERVATION', 'RELEASE', 'RETURN'
);

create type public.delivery_status as enum (
  'PENDING', 'PROCESSING', 'DELIVERED', 'RETRY', 'FAILED', 'DLQ'
);

create type public.import_status as enum (
  'UPLOADED', 'QUARANTINED', 'VALIDATING', 'PREVIEW_READY', 'COMMITTING', 'COMMITTED', 'FAILED'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_code_key unique (code),
  constraint organizations_name_nonempty check (length(trim(name)) > 0)
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  name text not null,
  code text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint branches_org_code_key unique (organization_id, code),
  constraint branches_name_nonempty check (length(trim(name)) > 0)
);

create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  branch_id uuid not null references public.branches(id),
  name text not null,
  code text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint warehouses_org_code_key unique (organization_id, code)
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  name text not null,
  code text not null,
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint roles_org_code_key unique (organization_id, code)
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id),
  display_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references public.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  branch_id uuid references public.branches(id),
  warehouse_id uuid references public.warehouses(id),
  created_at timestamptz not null default now(),
  primary key (user_id, role_id, branch_id, warehouse_id)
);

create table public.customer_tiers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  code text not null,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint customer_tiers_org_code_key unique (organization_id, code)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  customer_code text not null,
  name text not null,
  tier_id uuid not null references public.customer_tiers(id),
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_org_code_key unique (organization_id, customer_code)
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  supplier_code text not null,
  name text not null,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint suppliers_org_code_key unique (organization_id, supplier_code)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  parent_id uuid references public.categories(id),
  name text not null,
  code text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint categories_org_code_key unique (organization_id, code)
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  code text not null,
  name text not null,
  precision_digits smallint not null default 0,
  created_at timestamptz not null default now(),
  constraint units_org_code_key unique (organization_id, code),
  constraint units_precision_check check (precision_digits between 0 and 6)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  category_id uuid references public.categories(id),
  unit_id uuid not null references public.units(id),
  sku text not null,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_org_sku_key unique (organization_id, sku)
);

create table public.product_identifiers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  product_id uuid not null references public.products(id) on delete cascade,
  identifier_type text not null,
  identifier_value text not null,
  created_at timestamptz not null default now(),
  constraint product_identifiers_scope_key unique (organization_id, identifier_type, identifier_value),
  constraint product_identifier_type_check check (identifier_type in ('SKU', 'BARCODE', 'ITEM_NUMBER'))
);

create table public.product_media (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  constraint product_media_sort_check check (sort_order >= 0)
);

create unique index product_media_one_primary_idx
  on public.product_media(product_id) where is_primary;

create table public.price_lists (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  tier_id uuid not null references public.customer_tiers(id),
  code text not null,
  name text not null,
  currency char(3) not null,
  valid_from timestamptz not null default now(),
  valid_to timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint price_lists_org_code_key unique (organization_id, code),
  constraint price_lists_dates_check check (valid_to is null or valid_to > valid_from)
);

create table public.product_prices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  price_list_id uuid not null references public.price_lists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  unit_price numeric(18,4) not null,
  valid_from timestamptz not null default now(),
  valid_to timestamptz,
  created_at timestamptz not null default now(),
  constraint product_prices_amount_check check (unit_price >= 0),
  constraint product_prices_dates_check check (valid_to is null or valid_to > valid_from)
);

create index product_prices_resolution_idx
  on public.product_prices(organization_id, product_id, price_list_id, valid_from desc);

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  code text not null,
  name text not null,
  priority integer not null default 0,
  valid_from timestamptz not null,
  valid_to timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint promotions_org_code_key unique (organization_id, code),
  constraint promotions_dates_check check (valid_to > valid_from)
);

create table public.promotion_rules (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions(id) on delete cascade,
  product_id uuid references public.products(id),
  minimum_quantity numeric(18,4),
  discount_amount numeric(18,4),
  discount_percent numeric(7,4),
  created_at timestamptz not null default now(),
  constraint promotion_rules_qty_check check (minimum_quantity is null or minimum_quantity > 0),
  constraint promotion_rules_discount_check check (
    (discount_amount is not null and discount_amount >= 0 and discount_percent is null)
    or (discount_percent is not null and discount_percent between 0 and 100 and discount_amount is null)
    or (discount_amount is null and discount_percent is null)
  )
);

create table public.inventory_balances (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  warehouse_id uuid not null references public.warehouses(id),
  product_id uuid not null references public.products(id),
  quantity numeric(18,4) not null default 0,
  reserved_quantity numeric(18,4) not null default 0,
  updated_at timestamptz not null default now(),
  constraint inventory_balance_scope_key unique (warehouse_id, product_id),
  constraint inventory_balance_qty_check check (quantity >= 0),
  constraint inventory_reserved_check check (reserved_quantity >= 0 and reserved_quantity <= quantity)
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  warehouse_id uuid not null references public.warehouses(id),
  product_id uuid not null references public.products(id),
  movement_type public.inventory_movement_type not null,
  quantity numeric(18,4) not null,
  source_type text not null,
  source_id text not null,
  actor_user_id uuid references public.users(id),
  correlation_id uuid not null,
  created_at timestamptz not null default now(),
  constraint inventory_movement_qty_check check (quantity <> 0)
);

create index inventory_movements_lookup_idx
  on public.inventory_movements(warehouse_id, product_id, created_at desc);

create table public.inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  warehouse_id uuid not null references public.warehouses(id),
  product_id uuid not null references public.products(id),
  order_id uuid,
  quantity numeric(18,4) not null,
  status text not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  released_at timestamptz,
  constraint inventory_reservation_qty_check check (quantity > 0),
  constraint inventory_reservation_status_check check (status in ('ACTIVE', 'RELEASED', 'CONSUMED', 'CANCELLED'))
);

create index inventory_reservations_active_idx
  on public.inventory_reservations(warehouse_id, product_id) where status = 'ACTIVE';

create table public.stock_thresholds (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  warehouse_id uuid not null references public.warehouses(id),
  product_id uuid not null references public.products(id),
  low_stock_threshold numeric(18,4) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stock_threshold_key unique (warehouse_id, product_id),
  constraint stock_threshold_value_check check (low_stock_threshold >= 0)
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  customer_id uuid not null references public.customers(id),
  status text not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint carts_status_check check (status in ('ACTIVE', 'CHECKED_OUT', 'ABANDONED'))
);

create unique index carts_one_active_customer_idx
  on public.carts(customer_id) where status = 'ACTIVE';

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity numeric(18,4) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_item_qty_check check (quantity > 0),
  constraint cart_product_unique unique (cart_id, product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  branch_id uuid not null references public.branches(id),
  warehouse_id uuid not null references public.warehouses(id),
  customer_id uuid not null references public.customers(id),
  order_number bigint generated always as identity,
  operation_id uuid not null,
  correlation_id uuid not null,
  status public.order_status not null default 'PENDING',
  currency char(3) not null,
  subtotal numeric(18,4) not null,
  discount_total numeric(18,4) not null default 0,
  grand_total numeric(18,4) not null,
  committed_at timestamptz not null default now(),
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  constraint orders_operation_key unique (organization_id, operation_id),
  constraint orders_amounts_check check (subtotal >= 0 and discount_total >= 0 and grand_total >= 0)
);

create index orders_status_time_idx on public.orders(organization_id, status, created_at desc);
create index orders_customer_time_idx on public.orders(customer_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity numeric(18,4) not null,
  unit_price numeric(18,4) not null,
  line_subtotal numeric(18,4) not null,
  discount_amount numeric(18,4) not null default 0,
  line_total numeric(18,4) not null,
  pricing_context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint order_item_qty_check check (quantity > 0),
  constraint order_item_price_check check (unit_price >= 0),
  constraint order_item_amount_check check (line_subtotal >= 0 and discount_amount >= 0 and line_total >= 0)
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  actor_user_id uuid references public.users(id),
  correlation_id uuid not null,
  reason text,
  created_at timestamptz not null default now()
);

create index order_status_history_idx
  on public.order_status_history(order_id, created_at desc);

create table public.order_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  order_id uuid not null references public.orders(id) on delete cascade,
  author_user_id uuid references public.users(id),
  note text not null,
  created_at timestamptz not null default now(),
  constraint order_notes_nonempty check (length(trim(note)) > 0)
);

create table public.operational_invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  order_id uuid not null references public.orders(id),
  invoice_number text not null,
  currency char(3) not null,
  subtotal numeric(18,4) not null,
  discount_total numeric(18,4) not null,
  grand_total numeric(18,4) not null,
  snapshot jsonb not null,
  issued_at timestamptz not null default now(),
  constraint operational_invoices_org_number_key unique (organization_id, invoice_number),
  constraint operational_invoices_order_key unique (order_id)
);

create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  branch_id uuid not null references public.branches(id),
  supplier_id uuid not null references public.suppliers(id),
  purchase_number bigint generated always as identity,
  status text not null default 'DRAFT',
  currency char(3) not null,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint purchase_orders_status_check check (status in ('DRAFT', 'SENT', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'))
);

create table public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity numeric(18,4) not null,
  unit_cost numeric(18,4) not null,
  created_at timestamptz not null default now(),
  constraint purchase_item_qty_check check (quantity > 0),
  constraint purchase_item_cost_check check (unit_cost >= 0)
);

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  purchase_order_id uuid references public.purchase_orders(id),
  warehouse_id uuid not null references public.warehouses(id),
  supplier_reference text,
  received_by uuid references public.users(id),
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.receipt_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  receipt_id uuid not null references public.receipts(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity numeric(18,4) not null,
  unit_cost numeric(18,4) not null default 0,
  created_at timestamptz not null default now(),
  constraint receipt_item_qty_check check (quantity > 0),
  constraint receipt_item_cost_check check (unit_cost >= 0)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  recipient_user_id uuid references public.users(id),
  recipient_customer_id uuid references public.customers(id),
  channel text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint notifications_recipient_check check ((recipient_user_id is not null) <> (recipient_customer_id is not null))
);

create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  status public.delivery_status not null default 'PENDING',
  attempt_count integer not null default 0,
  provider_reference text,
  last_error text,
  next_attempt_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notification_attempts_check check (attempt_count >= 0)
);

create table public.outbox_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  aggregate_type text not null,
  aggregate_id uuid not null,
  event_type text not null,
  event_version text not null default '1.0',
  idempotency_key uuid not null,
  correlation_id uuid not null,
  payload jsonb not null,
  published_at timestamptz,
  attempt_count integer not null default 0,
  next_attempt_at timestamptz,
  terminal_error text,
  created_at timestamptz not null default now(),
  constraint outbox_idempotency_key unique (organization_id, idempotency_key),
  constraint outbox_attempts_check check (attempt_count >= 0)
);

create index outbox_retry_idx
  on public.outbox_events(next_attempt_at, created_at)
  where published_at is null and terminal_error is null;

create table public.integration_deliveries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  outbox_event_id uuid not null references public.outbox_events(id) on delete cascade,
  target_system text not null,
  external_idempotency_key uuid not null,
  status public.delivery_status not null default 'PENDING',
  attempt_count integer not null default 0,
  provider_reference text,
  correlation_id uuid not null,
  last_error text,
  next_attempt_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  constraint integration_delivery_idempotency unique (organization_id, target_system, external_idempotency_key)
);

create index integration_retry_idx
  on public.integration_deliveries(next_attempt_at, created_at)
  where status in ('PENDING', 'RETRY');

create table public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  source_type text not null,
  contract_version text not null,
  status public.import_status not null default 'UPLOADED',
  idempotency_key uuid not null,
  uploaded_by uuid references public.users(id),
  row_count integer not null default 0,
  accepted_row_count integer not null default 0,
  rejected_row_count integer not null default 0,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint import_job_idempotency unique (organization_id, idempotency_key),
  constraint import_counts_check check (row_count >= 0 and accepted_row_count >= 0 and rejected_row_count >= 0 and accepted_row_count + rejected_row_count <= row_count)
);

create table public.import_rows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  import_job_id uuid not null references public.import_jobs(id) on delete cascade,
  row_number integer not null,
  raw_data jsonb not null,
  normalized_data jsonb,
  validation_errors jsonb not null default '[]'::jsonb,
  is_accepted boolean,
  created_at timestamptz not null default now(),
  constraint import_row_number_check check (row_number > 0),
  constraint import_job_row_key unique (import_job_id, row_number)
);

create table public.export_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  export_type text not null,
  contract_version text not null,
  requested_by uuid references public.users(id),
  status public.delivery_status not null default 'PENDING',
  storage_path text,
  row_count integer not null default 0,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint export_row_count_check check (row_count >= 0)
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  actor_user_id uuid references public.users(id),
  action text not null,
  target_type text not null,
  target_id text,
  branch_id uuid references public.branches(id),
  warehouse_id uuid references public.warehouses(id),
  correlation_id uuid not null,
  result text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_result_check check (result in ('SUCCESS', 'REJECTED', 'FAILED'))
);

create index audit_entity_time_idx
  on public.audit_events(organization_id, target_type, target_id, created_at desc);

create index branches_org_active_idx on public.branches(organization_id, is_active);
create index warehouses_branch_active_idx on public.warehouses(branch_id, is_active);
create index customers_org_tier_idx on public.customers(organization_id, tier_id, is_active);
create index products_org_category_idx on public.products(organization_id, category_id, is_active);
create index product_identifiers_lookup_idx on public.product_identifiers(organization_id, identifier_value);
create index carts_customer_status_idx on public.carts(customer_id, status);
create index purchase_orders_supplier_time_idx on public.purchase_orders(supplier_id, created_at desc);
create index receipts_warehouse_time_idx on public.receipts(warehouse_id, received_at desc);

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.organization_id = target_org
      and u.is_active
  );
$$;

create or replace function public.has_org_permission(target_org uuid, permission text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users u
    join public.user_roles ur on ur.user_id = u.id
    join public.roles r on r.id = ur.role_id
    where u.id = auth.uid()
      and u.organization_id = target_org
      and u.is_active
      and coalesce((r.permissions ->> permission)::boolean, false)
  );
$$;

alter table public.organizations enable row level security;
alter table public.branches enable row level security;
alter table public.warehouses enable row level security;
alter table public.roles enable row level security;
alter table public.users enable row level security;
alter table public.user_roles enable row level security;
alter table public.customer_tiers enable row level security;
alter table public.customers enable row level security;
alter table public.suppliers enable row level security;
alter table public.categories enable row level security;
alter table public.units enable row level security;
alter table public.products enable row level security;
alter table public.product_identifiers enable row level security;
alter table public.product_media enable row level security;
alter table public.price_lists enable row level security;
alter table public.product_prices enable row level security;
alter table public.promotions enable row level security;
alter table public.promotion_rules enable row level security;
alter table public.inventory_balances enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.inventory_reservations enable row level security;
alter table public.stock_thresholds enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.order_notes enable row level security;
alter table public.operational_invoices enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.receipts enable row level security;
alter table public.receipt_items enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_deliveries enable row level security;
alter table public.outbox_events enable row level security;
alter table public.integration_deliveries enable row level security;
alter table public.import_jobs enable row level security;
alter table public.import_rows enable row level security;
alter table public.export_jobs enable row level security;
alter table public.audit_events enable row level security;

create policy org_member_select on public.organizations for select to authenticated using (public.is_org_member(id));

create policy branch_member_select on public.branches for select to authenticated using (public.is_org_member(organization_id));
create policy warehouse_member_select on public.warehouses for select to authenticated using (public.is_org_member(organization_id));
create policy tier_member_select on public.customer_tiers for select to authenticated using (public.is_org_member(organization_id));
create policy supplier_member_select on public.suppliers for select to authenticated using (public.is_org_member(organization_id));
create policy category_member_select on public.categories for select to authenticated using (public.is_org_member(organization_id));
create policy unit_member_select on public.units for select to authenticated using (public.is_org_member(organization_id));
create policy product_member_select on public.products for select to authenticated using (public.is_org_member(organization_id));
create policy identifier_member_select on public.product_identifiers for select to authenticated using (public.is_org_member(organization_id));
create policy media_member_select on public.product_media for select to authenticated using (public.is_org_member(organization_id));
create policy price_member_select on public.product_prices for select to authenticated using (public.is_org_member(organization_id));
create policy price_list_member_select on public.price_lists for select to authenticated using (public.is_org_member(organization_id));
create policy promotion_member_select on public.promotions for select to authenticated using (public.is_org_member(organization_id));
create policy promotion_rule_member_select on public.promotion_rules for select to authenticated using (exists (select 1 from public.promotions p where p.id = promotion_id and public.is_org_member(p.organization_id)));

create policy customer_self_select on public.customers for select to authenticated using (
  public.is_org_member(organization_id)
  and exists (select 1 from public.users u where u.id = auth.uid() and u.organization_id = customers.organization_id)
);

create policy inventory_member_select on public.inventory_balances for select to authenticated using (public.is_org_member(organization_id));
create policy movement_member_select on public.inventory_movements for select to authenticated using (public.is_org_member(organization_id));
create policy reservation_member_select on public.inventory_reservations for select to authenticated using (public.is_org_member(organization_id));
create policy threshold_member_select on public.stock_thresholds for select to authenticated using (public.is_org_member(organization_id));
create policy cart_customer_select on public.carts for select to authenticated using (
  public.is_org_member(organization_id)
  and exists (select 1 from public.customers c where c.id = customer_id and c.organization_id = carts.organization_id)
);
create policy cart_item_member_select on public.cart_items for select to authenticated using (public.is_org_member(organization_id));
create policy order_member_select on public.orders for select to authenticated using (public.is_org_member(organization_id));
create policy order_item_member_select on public.order_items for select to authenticated using (public.is_org_member(organization_id));
create policy order_history_member_select on public.order_status_history for select to authenticated using (public.is_org_member(organization_id));
create policy order_note_member_select on public.order_notes for select to authenticated using (public.is_org_member(organization_id));
create policy invoice_member_select on public.operational_invoices for select to authenticated using (public.is_org_member(organization_id));
create policy purchase_member_select on public.purchase_orders for select to authenticated using (public.is_org_member(organization_id));
create policy purchase_item_member_select on public.purchase_order_items for select to authenticated using (public.is_org_member(organization_id));
create policy receipt_member_select on public.receipts for select to authenticated using (public.is_org_member(organization_id));
create policy receipt_item_member_select on public.receipt_items for select to authenticated using (public.is_org_member(organization_id));
create policy notification_member_select on public.notifications for select to authenticated using (public.is_org_member(organization_id));
create policy notification_delivery_member_select on public.notification_deliveries for select to authenticated using (public.is_org_member(organization_id));
create policy outbox_member_select on public.outbox_events for select to authenticated using (public.has_org_permission(organization_id, 'outbox.read'));
create policy integration_delivery_member_select on public.integration_deliveries for select to authenticated using (public.has_org_permission(organization_id, 'integration.read'));
create policy import_job_member_select on public.import_jobs for select to authenticated using (public.is_org_member(organization_id));
create policy import_row_member_select on public.import_rows for select to authenticated using (public.is_org_member(organization_id));
create policy export_job_member_select on public.export_jobs for select to authenticated using (public.is_org_member(organization_id));
create policy audit_member_select on public.audit_events for select to authenticated using (public.has_org_permission(organization_id, 'audit.read'));

-- Writes are intentionally absent from generic table policies. Operational mutations
-- will be exposed through validated domain commands/RPCs or server services so clients
-- cannot bypass pricing, inventory, idempotency, state-machine, or audit invariants.

revoke all on all tables in schema public from anon;
grant select on all tables in schema public to authenticated;

grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_permission(uuid, text) to authenticated;

commit;

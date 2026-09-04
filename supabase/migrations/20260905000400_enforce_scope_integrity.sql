-- Defense-in-depth ownership constraints.
-- Client-supplied scope IDs must never create cross-organization relationships.

alter table public.organizations
  add constraint organizations_id_unique unique (id);

alter table public.branches
  add constraint branches_org_id_unique unique (organization_id, id);

alter table public.warehouses
  add constraint warehouses_org_id_unique unique (organization_id, id),
  add constraint warehouses_org_branch_fk
    foreign key (organization_id, branch_id)
    references public.branches(organization_id, id);

alter table public.users
  add constraint users_org_id_unique unique (organization_id, id);

alter table public.roles
  add constraint roles_org_id_unique unique (organization_id, id);

-- Branch/warehouse are intentionally nullable for organization-wide role assignments.
alter table public.user_roles drop constraint user_roles_pkey;
alter table public.user_roles alter column branch_id drop not null;
alter table public.user_roles alter column warehouse_id drop not null;
alter table public.user_roles add column if not exists id uuid default gen_random_uuid();
update public.user_roles set id = gen_random_uuid() where id is null;
alter table public.user_roles alter column id set not null;
alter table public.user_roles add constraint user_roles_pkey primary key (id);
alter table public.user_roles add constraint user_roles_org_user_fk
    foreign key (organization_id, user_id) references public.users(organization_id, id);
alter table public.user_roles add constraint user_roles_org_role_fk
    foreign key (organization_id, role_id) references public.roles(organization_id, id);
alter table public.user_roles add constraint user_roles_org_branch_fk
    foreign key (organization_id, branch_id) references public.branches(organization_id, id);
alter table public.user_roles add constraint user_roles_org_warehouse_fk
    foreign key (organization_id, warehouse_id) references public.warehouses(organization_id, id);
create unique index user_roles_assignment_unique_idx on public.user_roles(
  organization_id, user_id, role_id,
  coalesce(branch_id, '00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(warehouse_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

alter table public.customer_tiers
  add constraint customer_tiers_org_id_unique unique (organization_id, id);

alter table public.customers
  add constraint customers_org_id_unique unique (organization_id, id),
  add constraint customers_org_tier_fk
    foreign key (organization_id, tier_id) references public.customer_tiers(organization_id, id);

alter table public.categories
  add constraint categories_org_id_unique unique (organization_id, id),
  add constraint categories_org_parent_fk
    foreign key (organization_id, parent_id) references public.categories(organization_id, id);

alter table public.units
  add constraint units_org_id_unique unique (organization_id, id);

alter table public.products
  add constraint products_org_id_unique unique (organization_id, id),
  add constraint products_org_category_fk
    foreign key (organization_id, category_id) references public.categories(organization_id, id),
  add constraint products_org_unit_fk
    foreign key (organization_id, unit_id) references public.units(organization_id, id);

alter table public.product_identifiers
  add constraint product_identifiers_org_product_fk
    foreign key (organization_id, product_id) references public.products(organization_id, id);

alter table public.price_lists
  add constraint price_lists_org_id_unique unique (organization_id, id),
  add constraint price_lists_org_tier_fk
    foreign key (organization_id, tier_id) references public.customer_tiers(organization_id, id);

alter table public.product_prices
  add constraint product_prices_org_list_fk
    foreign key (organization_id, price_list_id) references public.price_lists(organization_id, id),
  add constraint product_prices_org_product_fk
    foreign key (organization_id, product_id) references public.products(organization_id, id);

alter table public.inventory_balances
  add column if not exists organization_id uuid;
update public.inventory_balances ib
set organization_id = w.organization_id
from public.warehouses w
where w.id = ib.warehouse_id and ib.organization_id is null;

alter table public.inventory_balances
  alter column organization_id set not null,
  add constraint inventory_balances_org_warehouse_fk
    foreign key (organization_id, warehouse_id) references public.warehouses(organization_id, id),
  add constraint inventory_balances_org_product_fk
    foreign key (organization_id, product_id) references public.products(organization_id, id);

alter table public.inventory_movements
  add constraint inventory_movements_org_warehouse_fk
    foreign key (organization_id, warehouse_id) references public.warehouses(organization_id, id),
  add constraint inventory_movements_org_product_fk
    foreign key (organization_id, product_id) references public.products(organization_id, id);

alter table public.carts
  add constraint carts_org_customer_fk
    foreign key (organization_id, customer_id) references public.customers(organization_id, id),
  add constraint carts_org_branch_fk
    foreign key (organization_id, branch_id) references public.branches(organization_id, id),
  add constraint carts_org_warehouse_fk
    foreign key (organization_id, warehouse_id) references public.warehouses(organization_id, id);

alter table public.orders
  add constraint orders_org_customer_fk
    foreign key (organization_id, customer_id) references public.customers(organization_id, id),
  add constraint orders_org_branch_fk
    foreign key (organization_id, branch_id) references public.branches(organization_id, id),
  add constraint orders_org_warehouse_fk
    foreign key (organization_id, warehouse_id) references public.warehouses(organization_id, id);

alter table public.order_status_history
  add constraint order_status_history_org_order_fk
    foreign key (organization_id, order_id) references public.orders(organization_id, id);

-- Outbox aggregate types are intentionally generic: future integrations can publish
-- product/customer/inventory events without changing this boundary.
-- Audit targets are also generic by design and therefore cannot use a polymorphic FK.

create index if not exists user_roles_scope_idx on public.user_roles(organization_id, branch_id, warehouse_id, user_id);
create index if not exists inventory_balances_org_product_idx on public.inventory_balances(organization_id, product_id);

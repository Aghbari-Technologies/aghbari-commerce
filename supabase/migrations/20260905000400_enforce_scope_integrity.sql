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

alter table public.user_roles
  add column if not exists organization_id uuid;

update public.user_roles ur
set organization_id = u.organization_id
from public.users u
where u.id = ur.user_id and ur.organization_id is null;

alter table public.user_roles
  alter column organization_id set not null,
  add constraint user_roles_org_user_fk
    foreign key (organization_id, user_id)
    references public.users(organization_id, id),
  add constraint user_roles_org_role_fk
    foreign key (organization_id, role_id)
    references public.roles(organization_id, id),
  add constraint user_roles_org_branch_fk
    foreign key (organization_id, branch_id)
    references public.branches(organization_id, id),
  add constraint user_roles_org_warehouse_fk
    foreign key (organization_id, warehouse_id)
    references public.warehouses(organization_id, id);

alter table public.customer_tiers
  add constraint customer_tiers_org_id_unique unique (organization_id, id);

alter table public.customers
  add constraint customers_org_id_unique unique (organization_id, id),
  add constraint customers_org_tier_fk
    foreign key (organization_id, tier_id)
    references public.customer_tiers(organization_id, id);

alter table public.categories
  add constraint categories_org_id_unique unique (organization_id, id),
  add constraint categories_org_parent_fk
    foreign key (organization_id, parent_id)
    references public.categories(organization_id, id);

alter table public.units
  add constraint units_org_id_unique unique (organization_id, id);

alter table public.products
  add constraint products_org_id_unique unique (organization_id, id),
  add constraint products_org_category_fk
    foreign key (organization_id, category_id)
    references public.categories(organization_id, id),
  add constraint products_org_unit_fk
    foreign key (organization_id, unit_id)
    references public.units(organization_id, id);

alter table public.product_identifiers
  add constraint product_identifiers_org_product_fk
    foreign key (organization_id, product_id)
    references public.products(organization_id, id);

alter table public.price_lists
  add constraint price_lists_org_id_unique unique (organization_id, id),
  add constraint price_lists_org_tier_fk
    foreign key (organization_id, tier_id)
    references public.customer_tiers(organization_id, id);

alter table public.product_prices
  add constraint product_prices_org_list_fk
    foreign key (organization_id, price_list_id)
    references public.price_lists(organization_id, id),
  add constraint product_prices_org_product_fk
    foreign key (organization_id, product_id)
    references public.products(organization_id, id);

alter table public.inventory_balances
  add column if not exists organization_id uuid;

update public.inventory_balances ib
set organization_id = w.organization_id
from public.warehouses w
where w.id = ib.warehouse_id and ib.organization_id is null;

alter table public.inventory_balances
  alter column organization_id set not null,
  add constraint inventory_balances_org_warehouse_fk
    foreign key (organization_id, warehouse_id)
    references public.warehouses(organization_id, id),
  add constraint inventory_balances_org_product_fk
    foreign key (organization_id, product_id)
    references public.products(organization_id, id);

alter table public.inventory_movements
  add constraint inventory_movements_org_warehouse_fk
    foreign key (organization_id, warehouse_id)
    references public.warehouses(organization_id, id),
  add constraint inventory_movements_org_product_fk
    foreign key (organization_id, product_id)
    references public.products(organization_id, id);

alter table public.carts
  add constraint carts_org_customer_fk
    foreign key (organization_id, customer_id)
    references public.customers(organization_id, id),
  add constraint carts_org_branch_fk
    foreign key (organization_id, branch_id)
    references public.branches(organization_id, id),
  add constraint carts_org_warehouse_fk
    foreign key (organization_id, warehouse_id)
    references public.warehouses(organization_id, id);

alter table public.orders
  add constraint orders_org_customer_fk
    foreign key (organization_id, customer_id)
    references public.customers(organization_id, id),
  add constraint orders_org_branch_fk
    foreign key (organization_id, branch_id)
    references public.branches(organization_id, id),
  add constraint orders_org_warehouse_fk
    foreign key (organization_id, warehouse_id)
    references public.warehouses(organization_id, id);

alter table public.order_status_history
  add constraint order_status_history_org_order_fk
    foreign key (organization_id, order_id)
    references public.orders(organization_id, id);

alter table public.outbox_events
  add constraint outbox_events_org_aggregate_fk
    foreign key (organization_id, aggregate_id)
    references public.orders(organization_id, id)
    deferrable initially deferred;

alter table public.audit_events
  add constraint audit_events_org_target_fk
    foreign key (organization_id, target_id)
    references public.orders(organization_id, id)
    deferrable initially deferred;

create index if not exists user_roles_scope_idx on public.user_roles(organization_id, branch_id, warehouse_id, user_id);
create index if not exists inventory_balances_org_product_idx on public.inventory_balances(organization_id, product_id);

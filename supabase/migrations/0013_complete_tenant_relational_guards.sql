-- Complete the remaining cross-tenant relational guards missed by the first integrity pass.
-- These constraints make tenant ownership explicit at every tenant-owned relationship boundary.

alter table public.branches
  add constraint branches_id_organization_unique unique (id, organization_id);

alter table public.categories
  add constraint categories_id_organization_unique unique (id, organization_id);

alter table public.warehouses
  add constraint warehouses_id_organization_unique unique (id, organization_id);

alter table public.products
  add constraint products_id_organization_unique unique (id, organization_id);

alter table public.customers
  add constraint customers_id_organization_unique unique (id, organization_id);

alter table public.price_lists
  add constraint price_lists_id_organization_unique unique (id, organization_id);

alter table public.carts
  add constraint carts_id_organization_unique unique (id, organization_id);

alter table public.orders
  add constraint orders_id_organization_unique unique (id, organization_id);

alter table public.order_items
  add constraint order_items_id_organization_unique unique (id, organization_id);

alter table public.order_status_history
  add constraint order_status_history_id_organization_unique unique (id, organization_id);

alter table public.warehouses
  add constraint warehouses_branch_org_fk
  foreign key (branch_id, organization_id)
  references public.branches (id, organization_id)
  on delete restrict;

alter table public.categories
  add constraint categories_parent_org_fk
  foreign key (parent_id, organization_id)
  references public.categories (id, organization_id)
  on delete restrict;

alter table public.products
  add constraint products_category_org_fk
  foreign key (category_id, organization_id)
  references public.categories (id, organization_id)
  on delete restrict;

alter table public.profiles
  add constraint profiles_customer_org_fk
  foreign key (customer_id, organization_id)
  references public.customers (id, organization_id)
  on delete restrict;

comment on constraint warehouses_branch_org_fk on public.warehouses is 'Warehouse branch must belong to the same organization as the warehouse.';
comment on constraint categories_parent_org_fk on public.categories is 'Category hierarchy cannot reference a parent from another organization.';
comment on constraint products_category_org_fk on public.products is 'Product category must belong to the same organization as the product.';
comment on constraint profiles_customer_org_fk on public.profiles is 'Authenticated profile cannot bind to a customer from another organization.';

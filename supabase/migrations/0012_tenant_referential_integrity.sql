-- Enforce organization ownership at the relational layer, not only through RLS/RPC predicates.
-- Constraints are NOT VALID so existing installations can be upgraded safely; new writes are
-- enforced immediately. Release certification must validate them against the live database.

create unique index if not exists branches_id_org_uidx on public.branches(id, organization_id);
create unique index if not exists categories_id_org_uidx on public.categories(id, organization_id);
create unique index if not exists products_id_org_uidx on public.products(id, organization_id);
create unique index if not exists customers_id_org_uidx on public.customers(id, organization_id);
create unique index if not exists price_lists_id_org_uidx on public.price_lists(id, organization_id);
create unique index if not exists carts_id_org_uidx on public.carts(id, organization_id);
create unique index if not exists orders_id_org_uidx on public.orders(id, organization_id);

-- Branch/warehouse ownership.
alter table public.warehouses
  add constraint warehouses_branch_same_org_fk
  foreign key (branch_id, organization_id) references public.branches(id, organization_id)
  on delete restrict not valid;

-- User/customer binding must never cross organizations.
alter table public.profiles
  add constraint profiles_customer_same_org_fk
  foreign key (customer_id, organization_id) references public.customers(id, organization_id)
  on delete restrict not valid;

-- Category hierarchy cannot cross organization boundaries.
alter table public.categories
  add constraint categories_parent_same_org_fk
  foreign key (parent_id, organization_id) references public.categories(id, organization_id)
  on delete restrict not valid;

-- Product/category ownership must agree.
alter table public.products
  add constraint products_category_same_org_fk
  foreign key (category_id, organization_id) references public.categories(id, organization_id)
  on delete restrict not valid;

-- Media must belong to the same organization as its product.
alter table public.product_media
  add constraint product_media_product_same_org_fk
  foreign key (product_id, organization_id) references public.products(id, organization_id)
  on delete cascade not valid;

-- Price rows must belong to the same organization as both their list and product.
alter table public.product_prices
  add constraint product_prices_list_same_org_fk
  foreign key (price_list_id, organization_id) references public.price_lists(id, organization_id)
  on delete restrict not valid;

alter table public.product_prices
  add constraint product_prices_product_same_org_fk
  foreign key (product_id, organization_id) references public.products(id, organization_id)
  on delete restrict not valid;

-- Inventory rows cannot point at a warehouse/product from another organization.
alter table public.inventory_balances
  add constraint inventory_balances_warehouse_same_org_fk
  foreign key (warehouse_id, organization_id) references public.warehouses(id, organization_id)
  on delete restrict not valid;

alter table public.inventory_balances
  add constraint inventory_balances_product_same_org_fk
  foreign key (product_id, organization_id) references public.products(id, organization_id)
  on delete restrict not valid;

alter table public.inventory_movements
  add constraint inventory_movements_warehouse_same_org_fk
  foreign key (warehouse_id, organization_id) references public.warehouses(id, organization_id)
  on delete restrict not valid;

alter table public.inventory_movements
  add constraint inventory_movements_product_same_org_fk
  foreign key (product_id, organization_id) references public.products(id, organization_id)
  on delete restrict not valid;

-- Cart ownership must be consistent with its customer/product rows.
alter table public.carts
  add constraint carts_customer_same_org_fk
  foreign key (customer_id, organization_id) references public.customers(id, organization_id)
  on delete restrict not valid;

alter table public.cart_items
  add constraint cart_items_cart_same_org_fk
  foreign key (cart_id, organization_id) references public.carts(id, organization_id)
  on delete cascade not valid;

alter table public.cart_items
  add constraint cart_items_product_same_org_fk
  foreign key (product_id, organization_id) references public.products(id, organization_id)
  on delete restrict not valid;

-- Orders and all order children are organization-bound at the database layer.
alter table public.orders
  add constraint orders_customer_same_org_fk
  foreign key (customer_id, organization_id) references public.customers(id, organization_id)
  on delete restrict not valid;

alter table public.orders
  add constraint orders_warehouse_same_org_fk
  foreign key (warehouse_id, organization_id) references public.warehouses(id, organization_id)
  on delete restrict not valid;

alter table public.order_items
  add constraint order_items_order_same_org_fk
  foreign key (order_id, organization_id) references public.orders(id, organization_id)
  on delete cascade not valid;

alter table public.order_items
  add constraint order_items_product_same_org_fk
  foreign key (product_id, organization_id) references public.products(id, organization_id)
  on delete restrict not valid;

alter table public.order_status_history
  add constraint order_status_history_order_same_org_fk
  foreign key (order_id, organization_id) references public.orders(id, organization_id)
  on delete cascade not valid;

comment on constraint warehouses_branch_same_org_fk on public.warehouses is 'Prevents warehouses from referencing another organization branch.';
comment on constraint profiles_customer_same_org_fk on public.profiles is 'Prevents authenticated users from being bound to a customer in another organization.';
comment on constraint categories_parent_same_org_fk on public.categories is 'Prevents category hierarchy from crossing organization boundaries.';
comment on constraint products_category_same_org_fk on public.products is 'Prevents products from referencing another organization category.';
comment on constraint product_media_product_same_org_fk on public.product_media is 'Prevents product media from crossing organization boundaries.';
comment on constraint product_prices_list_same_org_fk on public.product_prices is 'Prevents price rows from referencing another organization price list.';
comment on constraint product_prices_product_same_org_fk on public.product_prices is 'Prevents price rows from referencing another organization product.';
comment on constraint inventory_balances_warehouse_same_org_fk on public.inventory_balances is 'Prevents inventory balances from crossing organization boundaries.';
comment on constraint inventory_balances_product_same_org_fk on public.inventory_balances is 'Prevents inventory balances from referencing another organization product.';
comment on constraint inventory_movements_warehouse_same_org_fk on public.inventory_movements is 'Prevents inventory movements from crossing organization boundaries.';
comment on constraint inventory_movements_product_same_org_fk on public.inventory_movements is 'Prevents inventory movements from referencing another organization product.';
comment on constraint carts_customer_same_org_fk on public.carts is 'Prevents carts from referencing another organization customer.';
comment on constraint cart_items_cart_same_org_fk on public.cart_items is 'Prevents cart items from crossing cart organization boundaries.';
comment on constraint cart_items_product_same_org_fk on public.cart_items is 'Prevents cart items from referencing another organization product.';
comment on constraint orders_customer_same_org_fk on public.orders is 'Prevents orders from referencing another organization customer.';
comment on constraint orders_warehouse_same_org_fk on public.orders is 'Prevents orders from referencing another organization warehouse.';
comment on constraint order_items_order_same_org_fk on public.order_items is 'Prevents order items from crossing order organization boundaries.';
comment on constraint order_items_product_same_org_fk on public.order_items is 'Prevents order items from referencing another organization product.';
comment on constraint order_status_history_order_same_org_fk on public.order_status_history is 'Prevents order history from crossing order organization boundaries.';

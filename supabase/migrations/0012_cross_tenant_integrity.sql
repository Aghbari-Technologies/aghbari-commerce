-- Enforce organization consistency across tenant-owned foreign keys.
-- RLS protects visibility; these composite foreign keys protect data integrity even when
-- privileged server-side commands mutate rows directly.

alter table public.branches
  add constraint branches_org_id_unique unique (id, organization_id);

alter table public.categories
  add constraint categories_org_id_unique unique (id, organization_id);

alter table public.products
  add constraint products_org_id_unique unique (id, organization_id);

alter table public.price_lists
  add constraint price_lists_org_id_unique unique (id, organization_id);

alter table public.carts
  add constraint carts_org_id_unique unique (id, organization_id);

alter table public.orders
  add constraint orders_org_id_unique unique (id, organization_id);

alter table public.order_items
  add constraint order_items_org_id_unique unique (id, organization_id);

alter table public.order_status_history
  add constraint order_status_history_org_id_unique unique (id, organization_id);

alter table public.inventory_balances
  add constraint inventory_balances_warehouse_org_fk
  foreign key (warehouse_id, organization_id)
  references public.warehouses (id, organization_id)
  on delete restrict;

alter table public.inventory_balances
  add constraint inventory_balances_product_org_fk
  foreign key (product_id, organization_id)
  references public.products (id, organization_id)
  on delete restrict;

alter table public.inventory_movements
  add constraint inventory_movements_warehouse_org_fk
  foreign key (warehouse_id, organization_id)
  references public.warehouses (id, organization_id)
  on delete restrict;

alter table public.inventory_movements
  add constraint inventory_movements_product_org_fk
  foreign key (product_id, organization_id)
  references public.products (id, organization_id)
  on delete restrict;

alter table public.product_media
  add constraint product_media_product_org_fk
  foreign key (product_id, organization_id)
  references public.products (id, organization_id)
  on delete cascade;

alter table public.product_prices
  add constraint product_prices_product_org_fk
  foreign key (product_id, organization_id)
  references public.products (id, organization_id)
  on delete restrict;

alter table public.product_prices
  add constraint product_prices_price_list_org_fk
  foreign key (price_list_id, organization_id)
  references public.price_lists (id, organization_id)
  on delete restrict;

alter table public.carts
  add constraint carts_customer_org_fk
  foreign key (customer_id, organization_id)
  references public.customers (id, organization_id)
  on delete restrict;

alter table public.cart_items
  add constraint cart_items_cart_org_fk
  foreign key (cart_id, organization_id)
  references public.carts (id, organization_id)
  on delete cascade;

alter table public.cart_items
  add constraint cart_items_product_org_fk
  foreign key (product_id, organization_id)
  references public.products (id, organization_id)
  on delete restrict;

alter table public.orders
  add constraint orders_customer_org_fk
  foreign key (customer_id, organization_id)
  references public.customers (id, organization_id)
  on delete restrict;

alter table public.orders
  add constraint orders_warehouse_org_fk
  foreign key (warehouse_id, organization_id)
  references public.warehouses (id, organization_id)
  on delete restrict;

alter table public.order_items
  add constraint order_items_order_org_fk
  foreign key (order_id, organization_id)
  references public.orders (id, organization_id)
  on delete cascade;

alter table public.order_items
  add constraint order_items_product_org_fk
  foreign key (product_id, organization_id)
  references public.products (id, organization_id)
  on delete restrict;

alter table public.order_status_history
  add constraint order_status_history_order_org_fk
  foreign key (order_id, organization_id)
  references public.orders (id, organization_id)
  on delete cascade;

alter table public.audit_events
  add constraint audit_events_actor_same_org_fk
  foreign key (actor_id)
  references auth.users(id)
  on delete set null;

comment on constraint inventory_balances_product_org_fk on public.inventory_balances is 'Prevents inventory from referencing a product owned by another organization.';
comment on constraint product_prices_price_list_org_fk on public.product_prices is 'Prevents a price row from mixing a price list from another organization.';
comment on constraint order_items_order_org_fk on public.order_items is 'Prevents order items from crossing organization boundaries.';

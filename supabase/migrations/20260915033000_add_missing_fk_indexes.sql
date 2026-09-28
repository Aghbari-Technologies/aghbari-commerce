create index if not exists customer_price_tiers_product_id_idx on public.customer_price_tiers(product_id);
create index if not exists order_template_apply_operations_cart_id_idx on public.order_template_apply_operations(cart_id);
create index if not exists order_template_apply_operations_customer_id_idx on public.order_template_apply_operations(customer_id);
create index if not exists order_template_apply_operations_template_id_idx on public.order_template_apply_operations(template_id);
create index if not exists order_template_lines_product_id_idx on public.order_template_lines(product_id);
create index if not exists stock_count_lines_product_org_id_idx on public.stock_count_lines(product_id, organization_id);
create index if not exists stock_count_lines_session_org_id_idx on public.stock_count_lines(session_id, organization_id);
create index if not exists stock_count_sessions_started_by_idx on public.stock_count_sessions(started_by);
create index if not exists stock_count_sessions_warehouse_org_id_idx on public.stock_count_sessions(warehouse_id, organization_id);

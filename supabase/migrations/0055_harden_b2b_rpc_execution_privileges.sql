-- Prevent unauthenticated RPC execution and direct client-side order/cart writes.
revoke all on function public.current_customer_id() from public, anon;
revoke all on function public.current_customer_company_id() from public, anon;
revoke all on function public.get_cart() from public, anon;
revoke all on function public.set_cart_item(uuid, integer) from public, anon;
revoke all on function public.remove_cart_item(uuid) from public, anon;
revoke all on function public.clear_cart() from public, anon;
revoke all on function public.create_order(text, uuid, jsonb) from public, anon;
grant execute on function public.current_customer_id() to authenticated;
grant execute on function public.current_customer_company_id() to authenticated;
grant execute on function public.get_cart() to authenticated;
grant execute on function public.set_cart_item(uuid, integer) to authenticated;
grant execute on function public.remove_cart_item(uuid) to authenticated;
grant execute on function public.clear_cart() to authenticated;
grant execute on function public.create_order(text, uuid, jsonb) to authenticated;

-- Orders are created only through the server-authoritative RPC.
revoke insert, update, delete on public.orders from authenticated;
revoke insert, update, delete on public.order_items from authenticated;
revoke insert, update, delete on public.carts from authenticated;
revoke insert, update, delete on public.cart_items from authenticated;

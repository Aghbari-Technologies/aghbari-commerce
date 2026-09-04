create extension if not exists btree_gist;

alter table product_prices
  add constraint product_prices_no_overlap
  exclude using gist (
    price_list_id with =,
    product_id with =,
    tstzrange(effective_from, coalesce(effective_to, 'infinity'::timestamptz), '[)') with &&
  );

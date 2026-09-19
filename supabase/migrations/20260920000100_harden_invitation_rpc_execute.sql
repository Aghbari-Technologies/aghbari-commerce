-- Reproducible hardening recorded after direct live revocation.
-- Existing 7-argument product upsert remains the compatibility entrypoint.
-- Barcode is now returned by catalog and matched by customer quick-order flows.
revoke execute on function public.consume_customer_invitation(text, uuid) from authenticated, anon;

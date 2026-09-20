-- Performance hardening: cover both foreign keys on customer_invitations.
-- The existing (organization_id, customer_id, created_at) index does not cover
-- customer_id as a standalone FK key because organization_id is the leading column.
create index if not exists customer_invitations_customer_id_fk_idx
  on public.customer_invitations (customer_id);

create index if not exists customer_invitations_created_by_fk_idx
  on public.customer_invitations (created_by);

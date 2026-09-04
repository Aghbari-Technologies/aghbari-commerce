-- Tighten object-path parsing so policy expressions never cast arbitrary path fragments to UUID.
-- This is a follow-up safety migration to the product binding introduced in 0011/0012.

drop policy if exists product_media_select on storage.objects;
drop policy if exists product_media_insert on storage.objects;
drop policy if exists product_media_update on storage.objects;
drop policy if exists product_media_delete on storage.objects;

create policy product_media_select on storage.objects for select to authenticated
using (
  bucket_id = 'product-media'
  and name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/[^/]+[.](webp|png|jpe?g)$'
  and split_part(name,'/',1)::uuid = public.current_organization_id()
  and exists (select 1 from public.products p where p.id=split_part(name,'/',2)::uuid and p.organization_id=public.current_organization_id() and p.status='active')
);

create policy product_media_insert on storage.objects for insert to authenticated
with check (
  bucket_id='product-media'
  and public.is_staff()
  and name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/[^/]+[.](webp|png|jpe?g)$'
  and split_part(name,'/',1)::uuid=public.current_organization_id()
  and exists (select 1 from public.products p where p.id=split_part(name,'/',2)::uuid and p.organization_id=public.current_organization_id())
);

create policy product_media_update on storage.objects for update to authenticated
using (
  bucket_id='product-media' and public.is_staff()
  and name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/[^/]+[.](webp|png|jpe?g)$'
  and split_part(name,'/',1)::uuid=public.current_organization_id()
  and exists (select 1 from public.products p where p.id=split_part(name,'/',2)::uuid and p.organization_id=public.current_organization_id())
)
with check (
  bucket_id='product-media' and public.is_staff()
  and name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/[^/]+[.](webp|png|jpe?g)$'
  and split_part(name,'/',1)::uuid=public.current_organization_id()
  and exists (select 1 from public.products p where p.id=split_part(name,'/',2)::uuid and p.organization_id=public.current_organization_id())
);

create policy product_media_delete on storage.objects for delete to authenticated
using (
  bucket_id='product-media' and public.is_staff()
  and name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/[^/]+[.](webp|png|jpe?g)$'
  and split_part(name,'/',1)::uuid=public.current_organization_id()
  and exists (select 1 from public.products p where p.id=split_part(name,'/',2)::uuid and p.organization_id=public.current_organization_id())
);

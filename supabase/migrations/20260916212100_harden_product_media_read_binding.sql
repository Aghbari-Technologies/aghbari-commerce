-- Storage reads require both tenant and a real product binding; orphan objects are not enumerable.
drop policy if exists product_media_select on storage.objects;
create policy product_media_select on storage.objects for select to authenticated
using (
  bucket_id='product-media'
  and split_part(name,'/',1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and split_part(name,'/',2) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and split_part(name,'/',1)::uuid=public.current_organization_id()
  and exists (select 1 from public.products p where p.id=split_part(name,'/',2)::uuid and p.organization_id=public.current_organization_id())
);

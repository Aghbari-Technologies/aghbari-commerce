drop policy if exists client_ui_settings_insert_staff on public.client_ui_settings;
drop policy if exists client_ui_settings_update_staff on public.client_ui_settings;
drop policy if exists client_ui_settings_delete_staff on public.client_ui_settings;

create policy client_ui_settings_insert_admin
on public.client_ui_settings
for insert
to authenticated
with check (
  organization_id = public.current_organization_id()
  and public.current_role() in ('owner','admin')
);

create policy client_ui_settings_update_admin
on public.client_ui_settings
for update
to authenticated
using (
  organization_id = public.current_organization_id()
  and public.current_role() in ('owner','admin')
)
with check (
  organization_id = public.current_organization_id()
  and public.current_role() in ('owner','admin')
);

create policy client_ui_settings_delete_admin
on public.client_ui_settings
for delete
to authenticated
using (
  organization_id = public.current_organization_id()
  and public.current_role() in ('owner','admin')
);
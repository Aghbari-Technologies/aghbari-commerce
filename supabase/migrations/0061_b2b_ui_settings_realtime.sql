-- Allow customer clients to receive admin UI-setting changes without a redeploy.
alter publication supabase_realtime add table public.client_ui_settings;

-- Product-media Storage UPDATE is intentionally unsupported.
-- The application replacement path is delete + insert; direct UPDATE must not
-- remain a callable database capability for anon or authenticated clients.
REVOKE UPDATE ON TABLE storage.objects FROM PUBLIC;
REVOKE UPDATE ON TABLE storage.objects FROM anon, authenticated;

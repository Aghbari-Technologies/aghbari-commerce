# Closure Next Actions

1. Re-run exact-head GitHub quality/migration/domain workflows on the current release candidate after the closure branches are reconciled.
2. Run authenticated browser E2E with real test credentials; fail closed when credentials are absent.
3. Execute tenant-A/tenant-B browser adversarial flows and sensitive RPC runtime abuse tests.
4. Verify invitation, RBAC, finance statements, outbox retries, offline recovery, import/export, and dynamic-admin behavior on the same candidate SHA.
5. Verify Vercel deployment SHA/READY/runtime and run production browser smoke.
6. Configure leaked-password protection in Supabase.
7. Freeze the release candidate and certify only when every release-critical gate is evidenced on one exact SHA.

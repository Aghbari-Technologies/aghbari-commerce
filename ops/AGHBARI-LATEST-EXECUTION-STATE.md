# 🔴 AGHBARI LATEST EXECUTION STATE

Project: Aghbari Commerce | الأغبري
Branch: `execution/purchase-receipt-idempotency-128-20260927`
Current Git HEAD: `07533793040a9c935a946e84a7af407bcfb27349`
Base lineage: `main` merge-base `52c3ce9a52600e056ecfb6a6f847326693123cfd`
Production: HOLD / NO TOUCH
Certification: NOT CLAIMED

## Current reality
- Source migration now normalizes both `create_purchase_order` and `receive_purchase_order` from 16..200 to 16..128.
- Client purchase/receipt validation is 16..128; receipt tests explicitly cover 128 accepted / 129 rejected.
- pgTAP coverage locks signature, canonical 128 maximum, removal of legacy 200 maximum, authenticated-only execution and retained SECURITY DEFINER posture.
- Production database was not mutated; live read-only verification still shows both RPCs at the legacy 200 bound, confirming the intended release drift remains controlled.

## Exact proof status
- Source implementation: VERIFIED at exact branch HEAD `07533793040a9c935a946e84a7af407bcfb27349`.
- Live read-only drift proof: VERIFIED — both production RPCs still expose legacy 200; anon EXECUTE is false for both.
- Exact-SHA CI: QUEUED/PENDING; no PASS claimed.
- Migration proof / concurrency proof / Test-the-Test / runtime / browser: NOT_PROVEN for this SHA.

## OPEN GAPS
- Complete exact-SHA CI and affected proof workflows.
- Resolve any real migration/concurrency/test failure once; do not loop unchanged failures.
- Only after exact proof, apply the controlled production migration in the approved release path.

## NEXT EXECUTABLE ACTION
Inspect exact-SHA `supabase-migration-proof`, `concurrency-proof`, `test-the-test`, application-quality and affected test results for `07533793040a9c935a946e84a7af407bcfb27349`; fix the first material failure and re-check only affected proof.

## DO NOT REPEAT
Do not transfer evidence across SHAs. Do not mutate production directly. Do not retry unchanged Vercel build-rate-limit/protection. Do not reopen the already-closed customer routing, quick-order, order-template or security-contract work.

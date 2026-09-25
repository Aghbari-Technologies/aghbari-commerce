# AGHBARI LATEST EXECUTION STATE

Last verified working code HEAD: 2bccf4585ced4858b3cc29b02e7afef0123c12a0
Actual verified Git HEAD: 598216bcb5afe29c8be4354622eae2a97538370e
Execution branch: execution/ui-closure-20260925
Production: NO TOUCH
Certification: NOT CLAIMED

## CURRENT REALITY

- Current executable branch contains the full Admin/Staff operational UI expansion plus Customer Portal catalog, checkout, orders, account, finance, templates, notifications and invitation paths.
- Shared record-level progressive disclosure is now used across purchasing, receiving, inventory activity/history, finance, pricing, suppliers and warehouses.
- Inventory movement history now has movement-level detail disclosure using existing tenant-scoped data.
- Governance, notifications and organization access use bounded pagination with search/filter/tab resets.
- The Fresh DB migration path now defines `is_staff_reader()` before privilege hardening, matching live RLS policy usage. Authenticated EXECUTE is deliberately restored in the following migration because RLS policies call the helper; anon/PUBLIC remain denied.
- Security regression coverage now explicitly tests the `is_staff_reader()` privilege boundary.

## EXACT-SHA PROOF

- Current implementation HEAD: `598216bcb5afe29c8be4354622eae2a97538370e`.
- Current-SHA GitHub Actions are queued; no PASS is claimed for this HEAD yet.
- Historical PASS evidence from earlier SHAs is not transferred.
- The latest prior exact-SHA failures that triggered this repair were TypeScript JSX parse errors and the Fresh DB missing-helper migration error; those root causes are now patched in code but await current-SHA verification.
- Vercel remains an external hosted gate due deployment rate limiting/protection; no hosted browser PASS is claimed.

## OPEN UI FRONTIER

- Customer: mobile/accessibility refinement and only profile fields backed by existing contracts.
- Admin/Staff: deeper recovery/detail actions for governance/outbox, receiving and reconciliation only where existing service/RPC contracts expose a real mutation path.
- Catalog/pricing: richer history/edit flows only through existing authoritative service/RPC contracts.

## OPEN CORE / SECURITY / RELEASE

- Exact-SHA application-quality, migration, security, domain, concurrency, Test-the-Test and browser proof for current HEAD.
- Individual SECURITY DEFINER classification; current Supabase advisor observed 62 authenticated-executable findings plus one external leaked-password-protection warning.
- 50/50 legacy Markdown semantic consolidation and stale-reference verification.
- Hosted runtime/browser proof and final candidate certification.
- Production remains HOLD / NO TOUCH.

## CURRENT RESUME POINTER

START FROM ACTUAL EXECUTION HEAD `598216bcb5afe29c8be4354622eae2a97538370e`.

UI FRONT:
Inventory Ledger → movement detail/accessibility polish; then Receiving/Purchasing nested recovery and Pricing/Finance detail only through existing contracts.

CORE FRONT:
Consume exact-SHA CI results. First priority is application-quality + Fresh Supabase migration proof; next repair any exact-SHA security/domain/concurrency/Test-the-Test failure without weakening RLS/RPC boundaries.

PROOF:
Bind every PASS to `598216bcb5afe29c8be4354622eae2a97538370e` or a newer exact SHA. Run local-production browser E2E on the same proven SHA; do not transfer evidence across commits.

HOSTING:
Vercel rate-limit/protection remains external. Existing Netlify project `aghbari-commerce-web` is available as a zero-cost fallback, but do not treat its historical deploy as proof for the current SHA.

DO NOT REOPEN:
Checkout payment contract, canonical role-management RPC boundary, tenant/RLS helper boundary, offline queue foundation, or other previously proven flows unless current exact-SHA evidence demonstrates regression.

## WRITE-BACK INVARIANT

This state file is the resumable checkpoint. The next programmer must use the actual Git HEAD first, then this pointer. No older SHA or historical log may override current repository reality.

## RUN-2026-09-22-EXECUTE-NOW — MERGED PRODUCT / FRESH RELEASE PROOF
- Active development source was `execution/customer-ui-completion-20260920`.
- Exact proven pre-merge product SHA: `e804e1f345b9628cfc0c31bf9664abd0618e2c4a`.
- PR #100 was promoted from draft only after all ten required exact-SHA gates were terminal SUCCESS, then merged with expected head `e804e1f...`.
- **NEW MERGE SHA: `365e560e3cd434fac35e9a15b0905f69e0961879`.** This is now the only valid source identity for the post-merge release verification unit.
- Fresh verification lane created: PR #102, `verification/exact-365e560e` → `main`, draft, source exactly `365e560e...`. This PR is verification-only and does not authorize Candidate promotion or Production.

### Fresh exact-SHA verification — 365e560e
- Application Quality run `35771771679` #3603 — IN_PROGRESS.
- Security Audit run `35771771669` #3293 — SUCCESS.
- G1 Domain Proof run `35771771501` #3560 — IN_PROGRESS.
- Order Workflow run `35771771947` #1808 — SUCCESS.
- Concurrency run `35771771508` #811 — IN_PROGRESS.
- Supabase Migration Proof run `35771771695` #3577 — IN_PROGRESS.
- Test-the-Test run `35771771801` #944 — IN_PROGRESS.
- Browser Fresh Local Supabase run `35771771510` #638 — IN_PROGRESS.
- Browser Local Production Artifact run `35771771585` #643 — IN_PROGRESS.
- UI Visual Review run `35771771546` #185 — IN_PROGRESS.
- No post-merge overall PASS or certification claim is made while any exact-SHA gate is non-terminal.

### Current reality
- Live Supabase project `mrcyqezbhpncuvaehwgf` is ACTIVE_HEALTHY, PostgreSQL 17.6.1.
- Current public schema has 60 tables and 60/60 have RLS enabled; supplier bills/ledger tables are present.
- Security advisor remains the known intentional authenticated SECURITY DEFINER warning class plus external `auth_leaked_password_protection`; no paid upgrade and no production-side weakening was performed.
- Vercel project `aghbari-commerce-web4` has no deployment for `365e560e...` in the observed deployment list; therefore no Vercel deployment/browser PASS is inferred.
- Candidate `1685836f4226fdcb3250a60eba7430ecf3e8f080` remains frozen/untouched.
- Production remains **HOLD / NO TOUCH**.
- No transactional/business data was deleted for resource preservation.

### Proven product scope carried into merge
- Customer B2B portal: catalog/discovery, product detail, cart, orders, templates, finance, responsive/mobile states.
- Staff/Admin: flagship workspace, permission-aware navigation, orders, customers/customer detail, inventory, purchasing/supplier accounting, finance, exports, settings/governance/audit.
- Real workflows remain backed by existing transactional RPC/data contracts; no placeholder buttons or synthetic operational metrics were introduced.
- Exact visual proof on the pre-merge SHA covered authentication, customer portal, cart/orders/templates/finance/product detail, staff/admin operational surfaces, customer detail, supplier detail/accounting, desktop/mobile.

### RELEASE SAFETY
- Never transfer `e804e1f...` evidence to `365e560e...`.
- Do not merge PR #102, promote Candidate, or touch Production until the fresh exact-SHA evidence set is terminal and reconciled.

### CURRENT RESUME POINTER
**Poll PR #102 exact-SHA verification for `365e560e3cd434fac35e9a15b0905f69e0961879` to terminal. Inspect only exact-SHA failed jobs/logs; repair concrete root causes on a new SHA if needed. When all gates are terminal SUCCESS, inspect exact visual/browser artifacts and perform separate Candidate-promotion reconciliation. Do not reopen completed product/UI fronts unless fresh evidence identifies a concrete regression.**

Historical execution evidence remains preserved in Git history; this file is the authoritative current router.
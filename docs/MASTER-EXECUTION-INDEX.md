# Aghbari — Master Execution Index

**Canonical status ledger.** Updated after every meaningful execution boundary.

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch under execution: `implementation/order-domain-foundation`
- Base exact HEAD: **`f7be8d752049e503e9e6aed650aacab3d9db65b4`**
- Current execution boundary: **typed domain/order foundation implemented**
- Latest independently verified G1 domain-proof boundary: **`6b0759f3ae10e01ea6953268ac2eea9897863771`**
- Latest PostgreSQL G1: **PROVEN** at `6b0759f3ae10e01ea6953268ac2eea9897863771`; run `33890218264`, job `101079788325`
- Latest order-workflow proof: **PASS** at `6b0759f3ae10e01ea6953268ac2eea9897863771`; run `33890218212`, job `101079787892`
- Latest intelligence-contract proof: **PASS** at `486ee2940193b36a1a57d152b9c9fa53654c9b6b`; run `33890297796`, job `101080048316`

## Standing execution command
**`1` = CONTINUE / EXECUTE AUTONOMOUSLY / DEEPEN / TEST / VERIFY / DOCUMENT / SELF-IMPROVE.**

## Current certification state
| Stage | State |
|---|---|
| BUILT | **IN PROGRESS — first reusable typed domain slice now exists** |
| INTEGRATED | NOT PROVEN — branch work not merged |
| VERIFIED | G1 domain + PostgreSQL G1 + order workflow + intelligence contract proof proven; new typed slice awaits CI evidence |
| RUNTIME PROVEN | BLOCKED — no connected production application/runtime or Supabase target yet |
| PRODUCTION CERTIFIED | NOT PROVEN |

## Current phase
**PHASE 1 — IMPLEMENTATION VERTICAL SLICES STARTED.**

## New implementation boundary
The first production-oriented, framework-neutral domain slice has been added under `src/domain/`:
- `orders.ts` — typed order command model, canonical order status machine, role-aware transition authorization, scope validation, and duplicate-line rejection.
- `pricing.ts` — server-authoritative effective-price resolution and canonical monetary total calculation.
- `orders.test.ts` — executable tests for duplicate lines, authorized tier/effective-date pricing, client-total non-authority, legal/illegal workflow transitions, terminal states, and versioning.
- `package.json` + strict `tsconfig.json` — deterministic TypeScript verification baseline.
- `.github/workflows/domain-unit-proof.yml` — CI gate for typecheck + domain tests.

This is intentionally framework-neutral while the final application framework remains proof-gated. It does not freeze the architecture and does not claim runtime certification.

## Preserved foundations
- Product identity and strict operational/analytical boundary.
- Owner-Level Protocol and autonomous `1` shorthand.
- Engineering Requirements Baseline.
- Data Ownership & Transactional Invariants.
- API & Integration Contracts baseline.
- Security/RBAC/RLS baseline.
- Offline/Cache/Sync baseline.
- Operational Command Center IA.
- Canonical Operational Data Model V1.
- Certification Traceability Matrix V1.
- Technology Evaluation V1.
- Database & Migration Strategy V1.
- Consolidated Architecture Decision Log.
- Physical Schema Contract V1.
- Phase-0 Consistency Audit V1.
- Candidate Migration Skeleton V1.
- Domain/API Contract Map V1.
- Adversarial Architecture Review V1.
- Candidate RBAC/RLS Policy Matrix V1.
- Technology Proof Gates V1.
- Final Offline / Weak-Network Sync Contract V1.
- Architecture Enhancements V2: food-grade lot/expiry traceability, FEFO policy support, explicit order state machine, consumer-side idempotency, deterministic cursor sync, scan-first warehouse UX, operational exception center, and release-gated infrastructure complexity.
- Intelligence Integration V1.

## Evidence rules
- Existing G1 evidence remains valid only for the exact commits on which it was produced.
- New implementation is **IMPLEMENTED, NOT YET CI-VERIFIED** until its new workflow executes successfully on the exact branch HEAD.
- No runtime, Supabase/RLS, deployment, or production PASS is inferred from these unit/domain changes.

## Pending execution — next highest-value work
1. Obtain CI evidence for the new typed domain slice and repair any failures.
2. Continue the order vertical slice into transactional persistence without violating server-authoritative pricing/inventory/idempotency invariants.
3. Implement the durable outbox boundary and delivery state model.
4. Build the catalog/customer/pricing/inventory vertical slices around the same typed domain contracts.
5. Implement direct-request authorization + RLS once a real Supabase target is available.
6. Implement offline/sync, import/export, observability, performance, deployment/recovery, and runtime E2E evidence.
7. Reconcile Batch 3 requirements before architecture/schema freeze.
8. Finish Exact-HEAD certification only after all release-critical capabilities have runtime evidence.

## Product boundary — non-negotiable
Aghbari owns operational truth. Report-Advisor owns analytics/intelligence. The allowed direction is:

`Aghbari → Intelligence Integration Gateway → Canonical Analytical Dataset → Report-Advisor`.

Aghbari must not duplicate BI/forecasting/Decision Intelligence. External analytics must not become an operational writer.

## No-false-closure
Documentation PASS means design consistency only. A domain-harness PASS does not prove database, runtime, security, deployment, or production. A contract type does not prove runtime enforcement. A queued integration is not a delivered integration. A migration applied once is not proof of upgrade safety. A commit existing on GitHub is not evidence that runtime behavior is correct.

**NEXT:** CI-verify the newly implemented typed domain slice, then immediately continue the next unblocked implementation boundary.

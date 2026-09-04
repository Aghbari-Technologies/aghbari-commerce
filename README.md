# بوابة الأغبري للمواد الغذائية

Operational B2B commerce platform for **بوابة الأغبري للمواد الغذائية**.

## Product boundary

**الأغبري is the operational system of record.** It owns operational commerce workflows and reliable canonical data: catalog, pricing, customers, suppliers, orders, inventory, branches/warehouses, offers, users/permissions, imports/exports, operational notifications, auditability, and integrations.

**Analytics and decision intelligence are intentionally external to this operational application.** Aghbari must not duplicate analytical/reporting workloads that belong to the dedicated reporting layer.

## Engineering standard

This repository follows an Owner-Level / Evidence-First completion protocol:

`READ → RESCAN → DISCOVER → CLASSIFY → DESIGN → IMPLEMENT → TEST → TEST THE TEST → BYPASS SEARCH → REPAIR → REGRESSION → VERIFY → EXACT-HEAD CHECK → EVIDENCE → UPDATE INDEX → REPEAT`

No feature is considered production-ready merely because it exists in code. Completion progresses through:

`BUILT → INTEGRATED → VERIFIED → RUNTIME PROVEN → PRODUCTION CERTIFIED`

The architecture is a living artifact: when evidence exposes a better boundary, security weakness, unnecessary duplication, or reliability risk, the architecture and protocol are revised before implementation continues.

## Current phase

**PHASE 1 — Executable Commerce & Release Hardening.** The repository now contains the executable React/Vite/TypeScript application, operational Supabase migrations/RPCs, import and offline primitives, security boundaries, and executable proof gates. The remaining work is evidence-driven hardening and real-runtime verification; implementation presence is not treated as runtime certification.

The existing architecture is being evolved, not discarded. Business requirements are mined, challenged, and re-engineered rather than copied blindly from legacy assumptions. The final release boundary remains evidence-gated until runtime and production gates are proven.

## Source-of-truth documents

- `docs/MASTER-EXECUTION-INDEX.md` — canonical progress ledger
- `docs/OWNER-LEVEL-PROTOCOL.md` — execution, evidence, and certification protocol
- `docs/ARCHITECTURE-BOUNDARIES.md` — operational and integration boundaries

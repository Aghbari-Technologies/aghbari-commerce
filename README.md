# بوابة الأغبري للمواد الغذائية

Operational B2B commerce platform for **بوابة الأغبري للمواد الغذائية**.

## Product boundary

**الأغبري is the operational system of record.** It owns operational commerce workflows and reliable canonical data: catalog, pricing, customers, suppliers, orders, inventory, branches/warehouses, offers, users/permissions, imports/exports, operational notifications, auditability, and integrations.

**Report-Advisor is the analytics and decision layer.** Analytics, BI, advanced reporting, forecasting, decision intelligence, analytical alerts, and recommendations belong there and must not be duplicated inside الأغبري.

## Engineering standard

This repository follows an Owner-Level / Evidence-First completion protocol:

`READ → RESCAN → DISCOVER → CLASSIFY → DESIGN → IMPLEMENT → TEST → TEST THE TEST → BYPASS SEARCH → REPAIR → REGRESSION → VERIFY → EXACT-HEAD CHECK → EVIDENCE → UPDATE INDEX → REPEAT`

No feature is considered production-ready merely because it exists in code. Completion progresses through:

`BUILT → INTEGRATED → VERIFIED → RUNTIME PROVEN → PRODUCTION CERTIFIED`

The architecture is a living artifact: when evidence exposes a better boundary, security weakness, unnecessary duplication, or reliability risk, the architecture and protocol are revised before implementation continues.

## Current phase

**PHASE 0 — Architecture & Requirements Forensics**

The existing الأغبري architecture is being evolved, not discarded. The old العامري application is reference material only. Its useful business requirements are mined, challenged, and re-engineered; its branding, implementation limitations, unnecessary AI/reporting duplication, and legacy technical assumptions are not binding.

The final architecture is intentionally not frozen until all supplied requirement batches have been incorporated.

## Source-of-truth documents

- `docs/MASTER-EXECUTION-INDEX.md` — canonical progress ledger
- `docs/OWNER-LEVEL-PROTOCOL.md` — execution, evidence, and certification protocol
- `docs/ARCHITECTURE-BOUNDARIES.md` — operational/analytical and integration boundaries

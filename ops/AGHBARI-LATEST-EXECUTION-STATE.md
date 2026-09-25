# AGHBARI LATEST EXECUTION STATE

Last verified working code HEAD: 2bccf4585ced4858b3cc29b02e7afef0123c12a0
Actual verified code HEAD before this documentation checkpoint: 68947aa307aa1359083859adc4c0073295e87c23
Execution branch: execution/ui-closure-20260925
Production: NO TOUCH
Certification: NOT CLAIMED

## CURRENT REALITY

- Aghbari Commerce only; Report-Advisor remains outside operational scope.
- Admin/Staff has real operational workspaces for orders, customers, catalog/products, categories, pricing, purchasing, receiving, inventory, warehouses, suppliers, finance, exports, notifications, governance and access control, with shared record detail disclosure where contracts permit.
- Customer Portal is the active `AppV3Fixed` surface with catalog search/filter/categories, server-backed catalog pagination, product detail, cart, checkout/payment selection, order history/detail/tracking/reorder, templates/quick order/Excel, finance, account, notifications, invitation acceptance, offline/recovery primitives.
- Latest UI accessibility closure added focus trapping and restoration to the shared operational detail drawer.
- Inventory movement ledger now supports row-level operational details.

## EXACT-SHA PROOF

- Current code checkpoint SHA: `68947aa307aa1359083859adc4c0073295e87c23`.
- Current-SHA GitHub Actions are queued; no PASS is claimed for this SHA.
- Historical PASS evidence is not transferred.
- The current Fresh DB migration fix addresses the previously observed missing `is_staff_reader()` function failure by defining the helper before privilege hardening; current exact-SHA migration proof is still pending.
- Vercel hosted proof remains externally gated by deployment rate limiting/protection; no hosted browser PASS is claimed.
- Live Supabase authorization-helper inspection is verified separately and does not constitute application-CI or browser proof.

## OPEN UI FRONTIER

- Customer: mobile/accessibility refinement and profile actions only where backed by existing contracts.
- Admin/Staff: deeper recovery actions for governance/outbox, receiving and reconciliation only when an existing service/RPC mutation exists.
- Catalog/Pricing: richer history/edit detail only through current service/RPC contracts.

## OPEN CORE / SECURITY / RELEASE

- Exact-SHA application-quality, migration, security, domain, concurrency, Test-the-Test and browser evidence for `68947aa307aa1359083859adc4c0073295e87c23`.
- Individual SECURITY DEFINER classification; live advisor currently shows 62 authenticated-executable findings plus the external leaked-password warning. Do not blanket revoke required application/RLS helpers.
- 50/50 legacy Markdown semantic consolidation/reference verification.
- Hosted runtime/browser/candidate certification path.
- Production remains HOLD / NO TOUCH.

## CURRENT RESUME POINTER

START FROM THE CURRENT EXECUTION BRANCH HEAD, then identify the code checkpoint `68947aa307aa1359083859adc4c0073295e87c23` and any later documentation-only checkpoint.

UI FRONT:
Customer mobile/accessibility states → Admin Receiving/Purchasing nested recovery → Inventory reconciliation detail/recovery → Pricing/Finance detail, only where existing contracts expose real behavior.

CORE FRONT:
Consume the exact-SHA CI queue first. Priority order: application-quality and Fresh Supabase migration proof, then security/domain/concurrency/Test-the-Test/browser. Fix the first exact-SHA failure and re-run only affected gates where possible.

PROOF:
No PASS transfer. Bind every result to the exact SHA under test. Browser proof must cover real route, interaction, persistence, refresh/re-open and responsive/RTL/accessibility checks.

HOSTING:
Do not weaken Vercel Deployment Protection. Existing Netlify site `aghbari-commerce-web` is an available zero-cost fallback, but its historical deploy `6aaf1c861e08e126409753e0` is NOT proof for the current SHA.

DO NOT REOPEN:
checkout payment contract, canonical role-management RPC boundary, RLS helper execution boundary, offline queue foundation, or previously proven transaction invariants unless exact current evidence shows regression.

## WRITE-BACK NOTE

This documentation checkpoint records the latest verified code checkpoint before the write-back. The next session must inspect the actual branch ref first; documentation commits never override the repository's actual HEAD.


## 2026-09-25 — Latest implementation checkpoint
- Current implementation SHA: `1ca0af47aeee5ab670c690794c8da5843c2840e4`.
- Multi-line purchasing, receiving and inventory transfer workflows are now exposed through existing atomic contracts.
- Staff order detail, receiving detail and finance invoice detail expose persisted line-level records.
- Finance payment/expense writes now carry idempotency keys with replay/conflict semantics.
- Exact-SHA verification for this SHA is queued/not proven. No PASS transfer.
- Production remains NO TOUCH.
- Next resume: inspect actual branch HEAD first, consume current-SHA workflows, then repair the first demonstrated failure before further proof.

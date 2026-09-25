# 🔴 AGHBARI LATEST EXECUTION STATE

**Actual verified Git HEAD:** `be396f7a3d5edf12ef77a93456887ad137485600`
**Last functional code SHA:** `eff8b07f625e57bb41648bfad8a682050cc92223`
**Branch:** `main`
**Production:** NO TOUCH
**Certification:** NOT CLAIMED

## Current Reality
- The repository HEAD is newer than all stale historical state references; execution has continued from actual `main` and no older SHA was used as the implementation baseline.
- The current functional code line closes customer identifier resolution, portal navigation persistence, modal accessibility, and quick-order service input boundaries.
- Commerce remains the transactional source of truth. Report-Advisor is outside the operating scope of this repository.
- Promotions is still not fabricated because the canonical schema/business contract is incomplete.

## What Changed In The Current Wave
- `src/AppV3Fixed.tsx`
  - Customer section state is URL-hash resumable for catalog/orders/finance/templates/account/notifications.
  - Browser Back/Forward synchronizes section state.
  - Escape closes the top safe modal/drawer.
  - Customer product detail and cart drawer now expose explicit dialog semantics and close-button labels.
  - Quick Order resolves exact SKU or exact barcode via the canonical barcode-aware catalog service.
  - Excel quick-order review resolves exact SKU or exact barcode using the same canonical contract.
  - Order submission and template application now use the same navigation path, keeping URL state aligned with visible state.
- `src/services/catalog.ts`
  - Customer catalog now consumes `get_catalog_with_barcode` and includes `barcode` in the catalog result contract.
- `src/services/quickOrder.ts`
  - Added explicit UUID, idempotency-key, quantity, line-count and duplicate-product validation before `apply_quick_order`.
- `src/services/quickOrder.test.ts`
  - Added boundary tests for normalization and rejection of malformed identifiers, quantities and duplicate products.

## Exact Verification
| Evidence | Result | Bound |
|---|---|---|
| Git HEAD verification | PROVEN | `main` == `eff8b07f...` before documentation write-back; documentation write-back advanced HEAD only |
| Quick-order isolated TypeScript check | PASS | exact fetched `quickOrder.ts` logic, TypeScript 5.8.3, stubbed Supabase dependency; not a full app build |
| Live barcode-aware RPC existence | PROVEN | Supabase project `mrcyqezbhpncuvaehwgf` |
| Live RPC privilege boundary | PROVEN | `get_catalog_with_barcode`: authenticated EXECUTE=true, anon EXECUTE=false, empty `search_path` |
| GitHub CI status | NOT_PROVEN | current exact head has no reported status entries |
| Browser/runtime on current exact SHA | NOT_PROVEN | no current exact-SHA browser artifact consumed |
| Hosted deployment for current exact SHA | NOT_PROVEN | latest observed production deployment is behind current source HEAD |
| Supabase Security Advisor | OPEN QUEUE | 62 authenticated-executable SECURITY DEFINER findings + leaked-password-protection warning |

## Hosting Reality
- Verified Vercel project for the Aghbari repository: `aghbari-commerce-c2dd`.
- Latest observed READY production deployment is exactly `24a6e33ccf8fe39fd1a2e55476764ce1dba88252`; no evidence is transferred to `eff8b07f...` or the documentation HEAD.
- Do not promote or manufacture a production proof from an older deployment.
- Historical `aghbari-commerce-web4` project metadata points at the wrong GitHub organization lineage; it is not an authority for this repository and is not used for current certification.

## Open Fronts
1. Fresh exact-SHA application-quality, security, domain, migration, concurrency and Test-the-Test evidence for the functional code SHA.
2. Fresh exact-SHA browser/runtime evidence for the deployed source SHA.
3. Individual SECURITY DEFINER classification; no blanket revoke of transactional RPCs.
4. Full semantic consolidation/reference audit of the legacy Markdown corpus before retirement.
5. Review current Vercel Git-connected deployment lineage only when it serves exact-SHA proof; avoid duplicate/manual deploys.

## CURRENT RESUME POINTER
START FROM ACTUAL CURRENT `main` HEAD.

UI FRONT:
`src/AppV3Fixed.tsx` + `src/services/catalog.ts` + `src/services/quickOrder.ts`
- Verify portal hash persistence with refresh and Back/Forward.
- Verify Quick Order with exact SKU, exact barcode, unauthorized identifier, out-of-stock quantity and lookup failure.
- Verify Excel review with exact SKU and exact barcode.

CORE / SECURITY FRONT:
`src/services/quickOrder.ts` and live `apply_quick_order` boundary.
- Run exact-SHA unit/application tests and security workflow.
- Inspect the canonical `get_catalog_with_barcode` / `apply_quick_order` authorization contract without weakening RLS or SECURITY DEFINER protections.

PROOF:
- Bind every PASS to its exact SHA.
- Run browser proof only against a deployment whose metadata exactly matches the source SHA being certified.
- Do not transfer evidence from `11fd9c7...`, `24a6e33...`, `eff8b07...` or any older deployment to the documentation HEAD.

DO NOT REPEAT:
- Existing catalog/customer/order/purchasing/finance/detail work unless a current exact-SHA gate finds regression, dependency drift, environment change or evidence invalidation.

PRODUCTION:
HOLD / NO TOUCH.

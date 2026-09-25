# 🔴 AGHBARI LATEST EXECUTION STATE

**Actual verified Git HEAD:** `f7e5f9e902f1a6161a4c7f7887c0608bc6410752`
**Functional code SHA:** `eff8b07f625e57bb41648bfad8a682050cc92223`
**Database migration SHA:** `f7825e74c53e7d5a89a964a9ed8203a7cdcf124d`
**Branch:** `main`
**Production:** NO TOUCH
**Certification:** NOT CLAIMED

## Current Reality
- Actual `main` is the only current implementation authority; historical state files and older SHA references are not execution baselines.
- Customer Portal now has URL-hash-resumable sections, safe modal/drawer Escape behavior and explicit dialog accessibility semantics.
- Customer Quick Order and Excel review resolve exact SKU or exact barcode through the canonical barcode-aware catalog RPC.
- The barcode-aware RPC is now represented in the repository migration lineage and has been applied to the live Supabase project.
- Quick-order command input is bounded before the transactional RPC.
- Commerce remains the transactional source of truth. Report-Advisor is outside this repository's operating scope.
- Promotions remains unimplemented until a complete canonical business/data contract exists.

## Current Functional Changes
- `src/AppV3Fixed.tsx`: URL section persistence, Back/Forward synchronization, Escape dismissal, dialog labels, exact SKU/barcode resolution, action-driven section navigation.
- `src/services/catalog.ts`: barcode-aware catalog contract through `get_catalog_with_barcode`.
- `src/services/quickOrder.ts`: UUID/idempotency/quantity/line-count/duplicate guards.
- `src/services/quickOrder.test.ts`: boundary tests for the quick-order input contract.
- `supabase/migrations/20260925103000_canonical_barcode_catalog_rpc.sql`: canonical Fresh DB contract for the barcode-aware catalog RPC.

## Exact Verification
| Check | Result | Bound |
|---|---|---|
| Git current head after documentation write-back | PROVEN | `f7e5f9e902f1a6161a4c7f7887c0608bc6410752` on `main` |
| Live Supabase migration apply | PROVEN | exact migration file content, project `mrcyqezbhpncuvaehwgf` |
| Barcode RPC signature/return shape | PROVEN | live database after apply |
| Barcode RPC security boundary | PROVEN | authenticated EXECUTE=true, anon EXECUTE=false, empty `search_path` |
| Isolated quick-order TypeScript check | PASS | fetched exact service logic with stubbed Supabase dependency; not full app build |
| GitHub CI | NOT_PROVEN | no reported status entries for current source line |
| Browser/runtime current source | NOT_PROVEN | no exact-SHA browser artifact consumed |
| Hosted deployment current source | NOT_PROVEN | current Vercel deployment still trails the latest source line |
| Security Advisor | OPEN QUEUE | 62 authenticated-executable SECURITY DEFINER findings + leaked-password-protection warning |

## Hosting Reality
- Current verified Vercel project: `aghbari-commerce-c2dd`.
- Latest observed READY production deployment: `dpl_3s733VxF8oC86QKfvtSyRnTWB5ud`, source SHA `24a6e33ccf8fe39fd1a2e55476764ce1dba88252`.
- Older production deployment evidence is not transferable to the current source.
- Historical project `aghbari-commerce-web4` is not used as current authority because its deployment metadata points at a different GitHub organization lineage.

## Open Fronts
1. Run exact-source CI/application-quality/security/domain/migration/concurrency/Test-the-Test after the barcode migration line.
2. Verify the current Vercel Git-connected deployment source SHA before any browser proof.
3. Run exact-SHA browser checks for Customer Portal and Admin/Staff on desktop/tablet/mobile and RTL.
4. Continue individual SECURITY DEFINER classification without blanket revoke.
5. Continue semantic consolidation/reference audit of the legacy Markdown corpus.
6. Keep production HOLD / NO TOUCH until exact end-to-end evidence is complete.

## CURRENT RESUME POINTER
START FROM `f7e5f9e902f1a6161a4c7f7887c0608bc6410752` — actual current `main` HEAD.

UI FRONT:
`src/AppV3Fixed.tsx`
- Verify `#catalog/#orders/#finance/#templates/#account/#notifications` persistence, Back/Forward and Escape dismissal.
- Verify Quick Order and Excel using exact SKU, exact barcode, missing identifier, unauthorized identifier, unavailable quantity and lookup failure.

CORE / DATABASE FRONT:
`src/services/catalog.ts`
`src/services/quickOrder.ts`
`supabase/migrations/20260925103000_canonical_barcode_catalog_rpc.sql`
- Run exact-SHA quality/security/migration/domain/concurrency/Test-the-Test gates.
- Confirm Fresh DB applies the barcode RPC and that the frontend uses only the migrated contract.

PROOF:
- Every PASS must identify the exact SHA, environment, executable check and evidence.
- Browser evidence must target a deployment whose metadata exactly matches the source SHA.
- Never transfer evidence from `24a6e33c...`, `11fd9c7...`, `eff8b07...` or any older SHA to a newer candidate.

DO NOT REPEAT:
- Existing catalog/customer/order/purchasing/finance/detail foundations unless a current gate reports regression or evidence invalidation.

PRODUCTION:
HOLD / NO TOUCH.

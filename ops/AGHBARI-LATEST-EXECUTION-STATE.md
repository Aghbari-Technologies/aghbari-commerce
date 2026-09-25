# 🔴 AGHBARI LATEST EXECUTION STATE

**Project:** Aghbari Commerce | الأغبري
**Actual Git HEAD verified immediately before this checkpoint write-back:** `3c02c8a1109dd813b5d3f64d49a28f74dff1a1dc`
**Branch:** `main`
**Production:** HOLD / NO TOUCH
**Certification:** NOT CLAIMED

## Current Reality
- Scope remains Aghbari Commerce only.
- The current session moved from UI closure into real core transactional closure.
- Finance payment recording is now contract-aligned with the live six-argument idempotency RPC.
- Purchase creation/submission/approval and invoice creation now persist audit/outbox effects.
- Customer creation and customer tier/status mutations now persist audit effects.
- Purchasing/receiving/inventory-transfer client boundaries match the 100-line server command cap; purchasing/inventory idempotency keys are bounded to 128 characters.
- No BI/reporting source or unsupported Promotions feature was introduced.

## Core Changes
- `src/services/finance.ts`: mandatory 16–128 character payment idempotency key validation and RPC binding.
- `src/FinancePanel.tsx`: retry-safe payment key persistence; key rotates only after successful command completion.
- `supabase/migrations/20260925110000_harden_finance_payment_idempotency.sql`: atomic payment, numeric NaN/Infinity guard, payload conflict detection, invoice/cash locks, audit and outbox.
- `supabase/migrations/20260925113000_core_mutation_audit_outbox_contract.sql`: invoice/purchase workflow audit+outbox and hardened cash/customer/supplier creation.
- `supabase/migrations/20260925115000_customer_mutation_audit_contract.sql`: customer lifecycle audit.
- `supabase/tests/029-core-command-audit-contract.test.sql`: 18/18 live contract checks.
- `supabase/tests/030-payment-runtime-idempotency.test.sql`: 13/13 planned live runtime assertions.

## Exact-SHA Evidence
| Check | Result | SHA / Evidence |
|---|---|---|
| Core implementation head before documentation checkpoint | PROVEN | `c5eba4a42af2543b4d1cf06180caa1ecb7316c59` |
| Live core contract check | PROVEN | 18/18 |
| Live payment runtime test | PROVEN | 13/13 planned assertions |
| Documentation memory checkpoint | PROVEN | `7eed5961ee96e8b41c55889425e56d78b8b8aa65` |
| Development progress checkpoint | PROVEN | `3c02c8a1109dd813b5d3f64d49a28f74dff1a1dc` |
| Current exact-head GitHub workflows | QUEUED | exact current source head |
| Build | NOT_PROVEN | fresh exact-SHA CI pending |
| Browser/runtime | NOT_PROVEN | fresh exact-source deployment pending |
| Hosted exact-source match | NOT_PROVEN | deployment proof pending |
| Certification | NOT CLAIMED | gate not complete |

## CURRENT RESUME POINTER
Continue from the new main HEAD after this checkpoint. Do not restart prior UI waves.
Next execution should consume exact-head CI results, repair any proven regressions, then continue contract-backed core closure where live or source evidence identifies a real gap.

## PRODUCTION
HOLD / NO TOUCH.

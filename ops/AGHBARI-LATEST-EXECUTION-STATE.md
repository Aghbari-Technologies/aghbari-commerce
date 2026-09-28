# 🔴 AGHBARI LATEST EXECUTION STATE

Project: Aghbari Commerce | الأغبري
Repository: `Aghbari-Technologies/aghbari-commerce`
Branch: `main`
Current Git HEAD: READ LIVE FROM refs/heads/main after each execution batch; mutable truth is never cached here.
Production: `HOLD / NO TOUCH`
Certification: `NOT CLAIMED`

## Current reality
- Active browser entrypoint remains `src/main.tsx -> AppV3Fixed`.
- Customer Portal canonical sections remain six: catalog, orders, finance, templates, account, notifications.
- Shared `WorkspaceSurfaceRail` is now a real capability-navigation surface for both Customer and Staff contexts.
- Customer WorkspaceSurfaceRail now derives nested capability cards directly from `AGHBARI_CUSTOMER_STRUCTURE`, so the active section visibly exposes its canonical live capabilities without inventing transactions.
- Staff WorkspaceSurfaceRail now exposes live-target count, boundary count and session-role context while preserving server-side authorization as the authority.
- Customer capability surface has focused contract coverage and is included in bounded Aghbari Quality.
- External 84 PNG corpus remains visual/provenance input only; it is not treated as an 84-screen denominator.
- Purchase/receipt source migration remains 16..128 but Production still exposes legacy 16..200; no Production mutation was performed.

## Latest execution batch — 2026-09-28
- Implemented: nested Customer capability map in `src/WorkspaceSurfaceRail.tsx` using canonical `AGHBARI_CUSTOMER_STRUCTURE`.
- Implemented: responsive capability grid, next-section action, Staff workspace metadata in `src/workspace-surface.css`.
- Added: `src/workspace-surface-capability.test.ts` covering canonical section parity, hidden-section safety and presentation-only capability mapping.
- Updated: `.github/workflows/aghbari-quality.yml` to execute the new focused contract.

## Verification
- Exact `refs/heads/main` re-read after the batch: `64e4b7161defc64d102d3dbeed57614e993c9f40`.
- Latest commit contains the new quality-test inclusion exactly on the current SHA.
- Connected workflow reader currently returns no workflow-run record for this push; therefore current build/typecheck/Vitest/browser runtime proof is `NOT_PROVEN`.
- Combined commit status remains externally failed only on Vercel free-plan build-rate-limit/protection; do not retry unchanged.
- Local direct GitHub clone/build is unavailable in this environment because GitHub DNS resolution is blocked; do not loop.

## Open gaps
1. Execute exact-SHA bounded Quality/Test-the-Test/Concurrency/G1/Security proof through an accessible runtime path.
2. Full exact-current browser visual/runtime proof.
3. Full 84-reference screen-pack equivalence proof, while preserving external-corpus semantics.
4. Purchase/receipt 16..128 migration: exact migration + negative + concurrency + Test-the-Test proof, then controlled release application only after gates.
5. Remaining canonical Commerce UI/domain gaps discovered by targeted execution.

## Security state
- No blanket revoke or test-driven security weakening.
- Existing SECURITY DEFINER warnings require function-by-function contract classification; do not treat generic advisor warnings as automatically defective.
- Production remains untouched.



## 2026-09-28 — UI terminology closure batch
- Implemented: corrected Customer Portal template terminology in `src/WorkspaceSurfaceRail.tsx` and `src/structure/customer-structure.ts`; removed the incorrect `مسحة` wording from the customer cart/template capability description.
- Added: focused regression assertion in `src/workspace-surface-capability.test.ts`.
- Resulting execution branch: `exec/20260928-commerce-ui-core-closure`.
- Exact resulting HEAD: `0ff9b07c34ec2a5a149a58de6359747f2ecf1025`.
- Proof: source change committed; GitHub Actions run is not yet visible for this SHA, so local/test runtime proof remains `NOT_PROVEN`.
- Production: HOLD / NO TOUCH.

## NEXT EXECUTABLE ACTION
Run the focused workspace/customer capability test and typecheck against `0ff9b07c34ec2a5a149a58de6359747f2ecf1025`; then continue the next independently executable canonical Commerce gap. Do not transfer proof to another SHA.

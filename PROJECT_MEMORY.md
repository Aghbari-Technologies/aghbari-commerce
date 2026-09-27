## 2026-09-28 — 84-reference UI closure registry

- `docs/ui-reference/UI-REFERENCE-ASSET-INDEX.md` remains the canonical visual-reference source.
- `src/structure/ui-reference-packs.ts` is the compact code-level implementation registry: exactly 84 current PNG references grouped into 8 screen packs without duplicate implementation targets.
- `src/UiReferenceCoveragePanel.tsx` exposes the reference coverage state inside the Admin Command Center; it is an operational QA surface, not customer-facing product behavior.
- `src/structure/ui-reference-packs.test.ts` verifies 84 registered references, exact uniqueness, exact parity with tracked PNG assets and explicit pack targets.
- Runtime/source UI identity is protected by `src/brand-identity.test.ts`; historical product identity names must not appear in runtime source.
- Classification is not visual proof. Final P0 closure still requires exact-SHA browser/runtime evidence bound to state and viewport.

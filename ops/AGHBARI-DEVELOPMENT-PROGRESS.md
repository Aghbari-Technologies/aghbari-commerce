# 🔴 AGHBARI DEVELOPMENT PROGRESS — CANONICAL LIVE LEDGER

## Run 2026-09-22 — Documentation architecture consolidation

### Baseline
- Repository: Aghbari-Technologies/aghbari-commerce
- Starting exact HEAD: 3888835f297e972ab2892c51643041bf4c904d26
- Objective: establish one canonical documentation system without losing information.

### Findings
- Main contained a 50-file Markdown documentation corpus with overlapping product, architecture, security, market, certification and execution material.
- Main did not contain the intended root PROJECT_MEMORY.md or the expected ops live-memory files referenced by the execution router.
- Existing docs included both authoritative-looking specifications and historical snapshots with stale SHAs/statuses; this created a risk of accidental regression or false-current assumptions.

### Decision
Adopt:
- one root PROJECT_MEMORY;
- six specialist canonical documents;
- one historical progress ledger;
- one live execution state;
- one consolidation manifest;
- one short execution router.

### Important non-destructive rule
Legacy source documents must not be deleted until full-content/semantic merge and reference audit are complete.

### Current implementation status
- Canonical control layer: CREATED ON EXECUTION BRANCH
- Specialist documents: defined as targets; content consolidation gate remains mandatory
- Source corpus: still authoritative only as historical input until merged
- Production: NO TOUCH
- Certification: NOT CLAIMED

### Next required work
1. Build each six specialist canonical documents from the complete source corpus.
2. Run a 50/50 UI/core reconciliation against the actual code.
3. Update cross-references from retired filenames.
4. Delete only source documents that pass the retirement gate.
5. Record exact resulting HEAD and evidence in the live state file.

## Run 2026-09-22 — Customer UI + offline reliability closure

### Start
- Starting exact execution HEAD: c249f4ec9930d7007e4efd35bdefea0acf9c9e5a on main.
- Execution branch: execution/ui-core-closure-20260922.
- PR: #106.

### Change
- Customer Portal gained a real product-details surface with server-authorized price, stock, pricing tiers, quantity and add-to-cart action.
- Customer Portal gained a real order-details surface reading persisted order_items and product identity, plus a real account surface.
- Corrected the saved-order navigation label from the stale/incorrect "المسحات" wording to "المحفوظة".
- Offline cart queue now replays automatically when connectivity returns, followed by a server-cart refresh trigger.
- Customer critical-path browser coverage was realigned to the current UI contract and strengthened to cover product details and persisted order-detail rows.

### Root Cause
- Current portal implementation had material nested UI gaps despite the catalog/order/sheet surfaces being present.
- Offline cart replay existed as a service capability but had no automatic reconnect trigger from the customer shell.
- Browser E2E selectors were stale relative to the current portal DOM, which weakened executable coverage.

### Fix
- Implemented and committed the above changes on the current HEAD lineage without reverting to historical branches.

### Proof
- Vercel Preview deployment for commit e0167c6b73391c9d0ef5d930aa7034a9ea94db9f was observed as a Git-sourced deployment and later tracked through the Vercel project.
- Vercel Preview Comments check reported success with zero unresolved feedback for the execution lane.
- Full quality/security/browser CI was triggered for the exact candidate SHA; at this write-back checkpoint those checks remain queued/in progress and therefore are not claimed as PASS.
- External TinyFish browser verification was not started because its wallet reported an insufficient balance; no retry was performed.

### Remaining
- Complete exact-SHA GitHub quality, security, migration, domain, concurrency, order-workflow and fresh-local browser checks on the final write-back SHA.
- Verify the exact Vercel deployment artifact/runtime with the repository's configured bypass path.
- Do not touch production until candidate proof is green and runtime evidence is bound to the same exact SHA.

## Run 2026-09-23 — Exact-SHA customer/core closure

### Start
- Verified execution lineage: main `c249f4ec9930d7007e4efd35bdefea0acf9c9e5a` → PR #106 branch `execution/ui-core-closure-20260922`.
- Code verification target for this run: `954895a729e52554651287b8b6c7afaa216e36df`.

### Changes
- Restored the missing server-authoritative `orders.payment_method` schema contract with a forward migration.
- Restored the missing `public.notifications` table, tenant RLS/read boundary, grants, indexes and explicit boundary test from the historical notification contract; included live-compatible nullable `recipient_user_id`.
- Stabilized the customer quantity-confirmation control with an accessible name and `aria-pressed` state.
- Scoped duplicate «طلباتي» browser selectors to the portal header landmark.
- Repaired the customer order-details data path to read persisted order lines directly and resolve product display data from the authorized catalog.
- Corrected one self-introduced truncated-file edit by restoring the complete `AppV3Fixed.tsx` from the last intact SHA and applying the intended change only.

### Root Causes Closed
- Fresh DB failed because `create_order` depended on a missing notifications table and `orders.payment_method` column in the repository migration chain.
- Customer browser proof exposed non-unique navigation selectors and a fragile product relation embedding in order details.

### Exact-SHA Proof — 954895a729e52554651287b8b6c7afaa216e36df
- `bootstrap-release-lockfile` run 1108 — success.
- `security-audit` run 3375 — success.
- `application-quality` run 3685 — success.
- `G1 Domain Proof` run 3642 — success.
- `Order Workflow Proof` run 1888 — success.
- `supabase-migration-proof` run 3659 — success.
- `Browser E2E / Fresh Local Supabase` run 714 — success.
- `Browser E2E / Local Production Artifact` run 719 — success.
- `Browser E2E / Exact Deployment` run 938 — success (source/deployment contract gate; live authenticated Vercel browser interaction remains separately protected).
- `Concurrency Proof / Exact SHA` run 891 — success.
- `Test-the-Test / Exact SHA` run 1024 — success.

### Candidate / Runtime
- PR #106: open and mergeable; head = exact verified SHA above.
- Vercel Preview: deployment `dpl_2r21QPnusQwNsJT4YhJ4XSg6fZHa`, state `READY`, branch `execution/ui-core-closure-20260922`, exact SHA above, target = preview (not production).
- Production: NO TOUCH.

### Remaining
- The candidate has a green exact-SHA CI/runtime-artifact gate. The remaining release-boundary item is authenticated end-to-end browser proof against the protected Vercel preview itself; the local production browser proof is green.
- Legacy Markdown semantic consolidation/retirement remains a separate documentation gate and has not been falsely declared complete.

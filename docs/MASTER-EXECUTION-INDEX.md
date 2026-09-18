# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Truth Reset
- Starting SHA ordered by this Owner-Level sprint: `0f28a8df8ce6efa8f4ee9569c36aa0d696d0386c`.
- Current exact implementation HEAD recorded by this main-branch index: `767579168cfd3e687c1274bfa8eace879a288ebd`.
- Single certification candidate recorded by this historical main-branch index: `767579168cfd3e687c1274bfa8eace879a288ebd`.
- No evidence from an earlier SHA transfers to that candidate.
- Scope: **Aghbari Commerce only**.
- **Current canonical release state is maintained separately on `ops/execution-control-plane`; never infer current certification from this historical section.**

## Executed in this sprint
1. Reviewed PR #45 against current main and closed the stale 122-commit branch without merging it wholesale; valid template/Excel work was integrated selectively on current main.
2. Customer order templates now use PostgreSQL normalized storage through `orderTemplates` service operations for create/list/delete/apply; the integrated customer UI no longer uses browser `localStorage` as the template source of truth.
3. Excel Quick Order is integrated as upload → parse → normalize/match → validation/quarantine → review → explicit commit-to-cart.
4. Template persistence is tenant/customer bound with RLS, atomic apply, idempotency, authorization and audit.
5. Template limits are enforced server-side, including a safe default of 50 when organization UI settings are absent.
6. Added covering indexes for the nine remaining FK findings from the live performance advisor.
7. Added an authenticated template persistence/apply/delete Playwright contract that fails loudly when real E2E credentials are absent.
8. Fixed Vitest CI scope to execute application tests under `src` only.

## Live database evidence
- Applied migration history contains `enterprise_order_templates_atomic`, `enforce_template_limits`, `add_missing_fk_indexes`, and `fix_template_limit_default`.
- `order_template_lines` and `order_template_apply_operations` exist with RLS enabled.
- `save_order_template(text,jsonb,text)` and `apply_order_template(uuid,uuid,text)` exist.
- Anonymous execute privilege is denied for both template RPCs.
- Direct live security contract: 54/54 public tables have RLS; 0 RLS-enabled public tables lack policies; 0 public functions are executable by `anon`.
- Direct live checks deny anonymous execution for template save/apply, quick order and cart mutation RPCs.
- Live pgTAP is not claimed; clean-source pgTAP remains a CI/local-database proof boundary.
- Nine FK indexes were applied; unused-index findings were not deleted blindly.

## CI evidence
- Exact SHA `82af52a178a0f52f0a70d2ad8c7a7ba0fbb97b22`: application-quality completed **PASS** through typecheck, unit/integration, lint, production build and release audit.
- Exact SHA `767579168cfd3e687c1274bfa8eace879a288ebd`: fresh `application-quality` and `G1 Domain Proof` runs were triggered; their final results were pending at the time this historical index entry was written.

## Certification state
| Stage | State |
|---|---|
| BUILT | **ADVANCED / P0 PRODUCT CLOSURE IMPLEMENTED** |
| INTEGRATED | **SUBSTANTIALLY CLOSED** |
| VERIFIED | **PARTIAL** |
| RUNTIME PROVEN | **PARTIAL** |
| PRODUCTION CERTIFIED | **NOT PROVEN** |

## Market-aligned requirements baseline — added 2026-09-18

A fresh Upwork market scan was converted into a non-certifying requirements baseline:
- `docs/UPWORK-MARKET-REQUIREMENTS-20260918.md`

The market signal strengthens acceptance criteria for requirements already inside Aghbari rather than creating uncontrolled scope.

| Market dimension | Aghbari acceptance basis | Classification |
|---|---|---|
| Multi-tenant + RLS | app + DB isolation + negative tests | **CORE** |
| RBAC / least privilege | server/DB enforcement + forbidden-path proof | **CORE** |
| Catalog + pricing | SKU/barcode/unit/category + server-authoritative price | **CORE** |
| Customers + suppliers | lifecycle + scope + authorization + audit | **CORE** |
| Orders + reliability | transactional state machine + idempotency + conflict/replay | **CORE** |
| Inventory + warehouse/branch | server truth + no-oversell + concurrency proof | **CORE** |
| Admin / operations | workflows + filters + bulk actions + exceptions | **CORE** |
| Customer B2B portal | catalog → cart → order → tracking → ledger | **CORE** |
| Excel/import/export | quarantine → validation → preview → commit → provenance | **CORE** |
| APIs/webhooks/outbox | contracts + auth + retry + terminal failure | **CORE-RELIABILITY** |
| Arabic / RTL UX | RTL-first responsive desktop/mobile UX | **CORE-UX** |
| Production proof | artifact + deployment + runtime + smoke + observability + recovery | **RELEASE** |
| SaaS plans/theme/WhatsApp | commercial/integration extensions | **P1** |
| AI | integration-ready boundary only; BI/Decision stays external | **P2 / OPTIONAL** |

## Competitive differentiation system — added 2026-09-18

The following document converts market requirements into product differentiation and portfolio strategy:
- `docs/COMPETITIVE-MOAT-AND-PORTFOLIO-20260918.md`

Primary differentiation pillars:
1. **Evidence-First / Trust Layer** — prove correctness, provenance and auditability.
2. **Fast B2B Order OS** — optimize recurring wholesale workflows, not page count.
3. **Arabic/RTL First** — deep RTL and Arabic-native business UX.
4. **Migration Bridge** — Excel/legacy/Onyx onboarding with quarantine/validation/reconciliation.
5. **Integration Reliability** — outbox, idempotency, retry, delivery state.
6. **Takeover-Ready Codebase** — designed for inherited/AI-generated systems.
7. **Low-Bandwidth/Offline discipline** — bounded offline without corrupting server truth.
8. **Operations Command Center** — action/exception-driven administration.
9. **Demo/Portfolio Evidence** — sanitized demo, resettable seed, proof-backed case studies.
10. **Recovery/Observability** — operational failures are visible, explainable and recoverable where safe.

Strategic rule:
**Compete on client risk reduction and evidence, not on raw feature count.**

## Upwork commercial operating layer — added 2026-09-18

The market baseline is paired with:
- `docs/UPWORK-BID-ENGINE-20260918.md`

The Bid Engine converts each live job into:
`SCREEN → FIT-MAP → PROOF-MAP → DIFFERENTIATOR-MAP → COMMERCIAL CHECK → TAILORED PROPOSAL → FOLLOW-UP → INTERVIEW PREP → CONTRACT REVIEW → DELIVERY → PORTFOLIO UPDATE`

One job should select:
**one primary moat + one proof asset + one measurable first milestone.**

The commercial system must reject applications when the required claims cannot be supported honestly.

## Market-derived Definition of Done

For market-facing credibility, applicable flows should be supported by exact-head evidence covering:
`AUTH + TENANT ISOLATION + RBAC + CATALOG + PRICING + INVENTORY + ORDERS + IMPORT/EXCEL + AUDIT + IDEMPOTENCY + CONCURRENCY + INTEGRATIONS + ARABIC/RTL + E2E + OBSERVABILITY + DEPLOYMENT`

Market research does not override Evidence-First, exact-SHA, security, Release Gates, or Production-NO-TOUCH.



## Competitive execution backlog — opened 2026-09-18

The strategy is now executable through dedicated GitHub fronts:

| Issue | Front | Purpose |
|---|---|---|
| #75 | Demo Mode + Portfolio Proof Pack | turn proven capabilities into a sanitized client/demo asset |
| #76 | Command Palette + Bulk Action Center | improve operational speed and safe bulk workflows |
| #77 | Conflict Center + Recovery Center | make failures/conflicts actionable and recoverable |
| #78 | Low-Bandwidth + Barcode-First Operations | regional/warehouse differentiation without weakening server truth |
| #79 | Migration Bridge Hardening | make Excel/legacy onboarding a reusable capability |
| #80 | Trust Layer + Explainable Operational State | expose provenance/lifecycle state without creating a second source of truth |

These are backlog fronts, not proof that they are implemented. They must enter the normal exact-SHA execution/evidence pipeline when selected.

## Remaining blockers
1. Finish exact-SHA candidate evidence and reconcile current candidate from the canonical control plane.
2. Execute authenticated deployed-browser E2E.
3. Execute Tenant-A/Tenant-B adversarial browser proof.
4. Obtain exact candidate Vercel deployment and production smoke proof when rate-limit/path permits.
5. Resolve Supabase leaked-password protection within the available plan/provider boundary.
6. Complete adversarial runtime proof for sensitive SECURITY DEFINER paths.
7. Complete remaining outbox/invitation/dynamic-admin/RBAC/finance/offline/import-export runtime evidence.
8. Resolve RLS init-plan issues only where measurement supports the change.
9. Do not mutate a frozen certification candidate solely to mirror market postings.
10. Build the portfolio proof pack and opportunity funnel from real Aghbari evidence.

## No-false-closure
`CODE != TEST != CI != RUNTIME != LIVE != PRODUCTION`
`IMPLEMENTED != VERIFIED != PROVEN != CERTIFIED`

Only evidence produced against the exact certification candidate SHA may advance certification.
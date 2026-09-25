# 🔴 AGHBARI — CANONICAL DOCUMENT SYSTEM & RETIREMENT MANIFEST

**Manifest metadata last reconciled before current write-back:** main HEAD `3b38d2eb058bc5d9b752d6c61b68e529c45acf0f`
**Purpose:** replace fragmented documentation with a controlled canonical system without losing content.

## 1. FINAL DOCUMENT ARCHITECTURE

1. PROJECT_MEMORY.md
2. docs/canonical/01-PRODUCT-REQUIREMENTS.md
3. docs/canonical/02-UX-UI-CUSTOMER-EXPERIENCE.md
4. docs/canonical/03-ARCHITECTURE-DATA-DOMAIN.md
5. docs/canonical/04-SECURITY-RELIABILITY-INTEGRATIONS.md
6. docs/canonical/05-QUALITY-CERTIFICATION-RELEASE.md
7. docs/canonical/06-MARKET-DIFFERENTIATION-PORTFOLIO.md
8. ops/AGHBARI-DEVELOPMENT-PROGRESS.md
9. ops/AGHBARI-LATEST-EXECUTION-STATE.md
10. AGHBARI-EXECUTION-START.md

## 2. SOURCE-TO-CANONICAL MAP

### Product / Requirements → 01
- docs/MASTER-EXECUTABLE-PRODUCT-SPECIFICATION-FOR-DEVELOPER.md
- docs/ENTERPRISE_B2B_V3_SPEC_AR.md
- docs/ENGINEERING-REQUIREMENTS-BASELINE.md
- docs/REQUIREMENTS-MATRIX-BATCH1-BATCH2.md
- docs/IMPLEMENTATION-READINESS-REGISTER-V1.md
- docs/IMPLEMENTATION-ROADMAP-V1.md
- docs/IMPLEMENTATION-STATUS-V1.md
- docs/B2B_V3_EXECUTION_STATUS.md
- docs/RUNTIME-VERTICAL-SLICE-SPEC-V1.md

### UX / UI → 02
- docs/ADMIN-COMMAND-CENTER-IA.md

### Architecture / Data / Domain → 03
- docs/ARCHITECTURE-BOUNDARIES.md
- docs/ARCHITECTURE-DECISION-LOG.md
- docs/ARCHITECTURE-ENHANCEMENTS-V2.md
- docs/ARCHITECTURE-INTELLIGENCE-ADDENDUM-V1.md
- docs/BATCH-3-RECONCILIATION-V1.md
- docs/CANDIDATE-MIGRATION-SKELETON-V1.md
- docs/CANONICAL-DATA-MODEL-V1.md
- docs/DATA-OWNERSHIP-AND-INVARIANTS.md
- docs/DOMAIN-API-CONTRACT-MAP-V1.md
- docs/PHASE-0-CONSISTENCY-AUDIT-V1.md
- docs/PHASE-0-FORENSIC-SYNTHESIS.md
- docs/PHYSICAL-SCHEMA-CONTRACT-V1.md

### Security / Reliability / Integrations → 04
- docs/ADVERSARIAL-ARCHITECTURE-REVIEW-V1.md
- docs/API-INTEGRATION-CONTRACTS-BASELINE.md
- docs/FINAL-OFFLINE-SYNC-CONTRACT-V1.md
- docs/INTELLIGENCE-INTEGRATION-CONTRACT-V1.md
- docs/OFFLINE-CACHE-SYNC-BASELINE.md
- docs/RBAC-RLS-POLICY-MATRIX-V1.md
- docs/SECURITY-RBAC-RLS-BASELINE.md

### Quality / Certification / Release → 05
- docs/CERTIFICATION-TRACEABILITY-MATRIX-V1.md
- docs/RELEASE-GATES-V1.md
- docs/TECHNOLOGY-POC-GATES-V1.md
- docs/TEST-CERTIFICATION-MATRIX.md

### Market / Differentiation → 06
- docs/COMPETITIVE-MOAT-AND-PORTFOLIO-20260918.md
- docs/UPWORK-BID-ENGINE-20260918.md
- docs/UPWORK-COMPETITIVE-HUNT-LANES-20260918.md
- docs/UPWORK-MARKET-REQUIREMENTS-20260918.md

### Historical execution → DEVELOPMENT-PROGRESS
- docs/EXECUTION-LOG-2026-09-06.md
- docs/EXECUTION-LOG-2026-09-07.md
- docs/EXECUTION-LOG-2026-09-08.md
- docs/EXECUTION-LOG-2026-09-08-BATCH-2.md
- docs/EXECUTION-LOG-2026-09-08-BATCH-3.md
- docs/EXECUTION-LOG-2026-09-08-BATCH-4.md
- docs/EXECUTION-LOG-BATCH-4.md
- docs/EXECUTION-LOG-BATCH-5.md
- docs/EXECUTION-LOG-BATCH-7.md
- docs/EXECUTION-STATE.md
- docs/EVIDENCE-BATCH-2026-09-07-RPC-PRIVILEGE.md

**Coverage:** 50/50 Markdown source documents are classified in the map. **Semantic consolidation is NOT certified complete:** each source still requires full-content merge/reconciliation before retirement.

## 3. MERGE METHOD — MANDATORY

For each source document:
1. read the full source;
2. extract requirements, decisions, invariants, constraints, risks, evidence rules and unresolved items;
3. reconcile contradictions;
4. place the authoritative interpretation in the target canonical document;
5. preserve historical wording/evidence notes in a labeled merged-history appendix when it carries information not safely compressible;
6. record the source filename in a coverage table;
7. only then mark source as RETIRED.

A summary-only merge is not sufficient when it would lose acceptance criteria, security constraints, edge cases or historical root-cause knowledge.

## 4. RETIREMENT GATE

A legacy file may be deleted only when:
- its full content is present or semantically represented in the target canonical document;
- no unique requirement/decision/invariant/evidence remains outside the target;
- repository references to the old filename have been updated;
- the canonical document is committed;
- the coverage map records RETIRED;
- the deletion occurs in the same controlled change or a clearly linked follow-up change.

## 5. EXECUTION ORDER

The programmer must process canonical documents in parallel by dependency:

Front A: Product + UX
Front B: Architecture + Data
Front C: Security + Reliability + Integrations
Front D: Quality + Certification + Release
Front E: Market + Differentiation
Front F: Historical execution/evidence

Then reconcile all fronts into PROJECT_MEMORY and LATEST EXECUTION STATE.

## 6. IMPORTANT

Do not make the mistake of requiring every future session to reread all historical source files. After the consolidation gate passes, future sessions read the canonical system only. Historical source files survive only in Git history.

## 7. CODE-LEVEL STRUCTURE MANIFESTS
- src/structure/admin-structure.ts — active Admin/Staff information architecture and legacy-v2 reconciliation status.
- src/structure/customer-structure.ts — active Customer Portal information architecture.
- src/structure/role-matrix.ts — current UI role visibility matrix.
- src/structure/index.ts — public structure module exports.
- vercel.json — SPA deep-link routing for registered application paths.
These files are implementation manifests and do not replace the canonical documentation authority above.

# الأغبري | EXECUTION START — AUTONOMOUS ENGINEERING CONTROL

> **Fast launch router.** This file does not contain the whole protocol. It routes every execution to the canonical Control Plane, durable Project Memory, and mutable Latest Execution State.

## Canonical operating layers

1. `ops/AGHBARI-EXECUTION-CONTROL-PLANE.md` on `ops/execution-control-plane` = constitution, decision authority, proof rules, release safety, and self-improvement.
2. `PROJECT_MEMORY.md` on `ops/execution-control-plane` = durable architecture, engineering standards, design system, decisions, backlog, lessons, and verification vocabulary.
3. `ops/AGHBARI-LATEST-EXECUTION-STATE.md` on `ops/execution-control-plane` = current candidate/live/production state, blockers, exact evidence, tooling status, and next queue.
4. This file on `main` = launch router only.

## User command `1` — EXECUTE AUTONOMOUSLY

When the user sends only `1`, execute immediately. Do not ask for the previous report when repository evidence can provide it.

READ CONTROL PLANE + PROJECT MEMORY + LATEST STATE
→ VERIFY REAL GITHUB / VERCEL / SUPABASE STATE
→ RECONCILE STORED STATE VS REALITY
→ IDENTIFY ALL OPEN / BLOCKED / RUNNING / NOT_PROVEN FRONTS
→ CLASSIFY BY RISK, VALUE, DEPENDENCY
→ START INDEPENDENT FRONTS IN PARALLEL
→ DISCOVER REQUIRED ADJACENT WORK
→ MAKE AUTONOMOUS ENGINEERING DECISIONS WITHIN SCOPE
→ RESEARCH OFFICIAL SOURCES WHEN TECHNICAL UNCERTAINTY EXISTS
→ IMPLEMENT ONLY PROVEN / NECESSARY CHANGES
→ TEST + TEST THE TEST
→ BREAK WITH EDGE / NEGATIVE / SECURITY / CONCURRENCY CHECKS
→ REGRESSION
→ VERIFY TARGET ENVIRONMENT / ARTIFACT / BROWSER / LIVE WHEN APPLICABLE
→ REVIEW ARCHITECTURE + SECURITY + DATA + UX/UI + PERFORMANCE + RELIABILITY
→ CAPTURE EXACT-SHA EVIDENCE
→ UPDATE PROJECT MEMORY / DECISION LOG / LATEST STATE
→ IMPROVE THE PROTOCOL WHEN THE RUN REVEALS A DURABLE LESSON
→ RECONCILE EVERY STATUS
→ CLOSE ONLY WHAT IS PROVEN
→ MOVE TO THE NEXT LOGICAL FRONT

### Command 1 autonomy rules

- The programmer leads technical architecture, implementation, refactoring, testing, security, UI/UX, performance, CI/CD, observability, and release engineering.
- Do not wait for file names, component names, implementation details, colors, spacing, test cases, or the next technical step when expert judgment is sufficient.
- Discover and execute necessary work required for correctness, security, reliability, testability, or release readiness.
- Do not expand into optional product features without owner adoption.
- Escalate only material product, commercial, irreversible, cost, core-feature, or legal/compliance decisions that require owner judgment.

## User command `2` — STRENGTHEN / RE-CALCULATE

When the user sends only `2`, treat the latest programmer result as an input, not as truth.

READ NEWEST RESULT + CONTROL PLANE + PROJECT MEMORY + LATEST STATE
→ RE-QUERY ACTUAL PROJECT EVIDENCE
→ DETECT STALE PASS / MISSING PROOF / HIDDEN BLOCKER / SKIPPED FRONT / WEAK TEST / SCOPE DRIFT
→ IDENTIFY ROOT CAUSE
→ SEPARATE PRODUCT DEFECT FROM PROOF / CI / ENVIRONMENT DEFECT
→ RE-PRIORITIZE AND PARALLELIZE
→ ISSUE / EXECUTE A STRONGER NEXT ACTION
→ PERSIST THE NEW STATE BEFORE REPORTING

Do not merely rewrite the previous command. Remove redundant work, demand missing proof, increase forensic precision, and preserve all safety boundaries.

## Hard invariants

- `CODE ≠ TEST ≠ CI ≠ RUNTIME ≠ LIVE ≠ PRODUCTION`
- `IMPLEMENTED ≠ TESTED ≠ VERIFIED ≠ PROVEN ≠ CERTIFIED`
- `NO EVIDENCE → NO PASS`
- Evidence belongs to the exact SHA that produced it.
- New SHA means affected old evidence must be revalidated; no PASS transfer by similarity or smallness.
- Production remains `NO TOUCH` until the release protocol permits a change.
- A blocked tool/credential boundary is recorded as BLOCKED; it is never converted into PASS by workaround theater.
- No invented secrets, credentials, logs, screenshots, statuses, runtime claims, or test results.
- A test that cannot expose the claimed defect is not accepted merely because CI is green.

## Current toolset available to the operator

Core: GitHub, Vercel, Supabase.
Connected accelerators: Firecrawl, TinyFish, PostHog.
Project proof/security tools: Playwright, Gitleaks, CodeQL, Semgrep CE, Trivy, OWASP ZAP, Dependabot, OpenSSF Scorecard.
Additional connectors may be used when actually connected and relevant; capability must be verified before being treated as evidence.

## Required completion transaction

Before the programmer reports completion:
1. Save newest verified state to `ops/AGHBARI-LATEST-EXECUTION-STATE.md`.
2. Record the compact run/job/SHA/front/result/root-cause/artifact/next-action entry.
3. Record consequential decisions in `PROJECT_MEMORY.md`.
4. Add a Control Plane evolution entry when a durable lesson, tool change, proof weakness, or safer procedure was discovered.
5. Reconcile exact-SHA evidence and release blockers.
6. Only then report the result to the user.

## Exit format

CURRENT STATE
Current SHA / Branch / Objective

DISCOVERED
What was found?

ROOT CAUSE
What was actually wrong?

ACTION
What changed?

TESTS
What actually ran?

VERIFICATION
What was actually proven, and at which layer?

EVIDENCE
Exact run/job/artifact references.

REMAINING
Only genuine OPEN / BLOCKED / RUNNING / NOT_PROVEN work.

NEXT ACTION
The next logical executable front.

**The project advances by initiative + execution + evidence, not by waiting for the owner to manage technical details.**
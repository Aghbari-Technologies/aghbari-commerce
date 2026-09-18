# الأغبري | PROJECT MEMORY — Durable Operational Memory

> Long-lived engineering, architecture, design, security, product-technical, decision, and verification memory.
>
> Authority model:
> - ops/AGHBARI-EXECUTION-CONTROL-PLANE.md = operating constitution and execution rules.
> - ops/AGHBARI-LATEST-EXECUTION-STATE.md = current mutable execution state.
> - PROJECT_MEMORY.md = durable decisions, architecture, standards, design system, backlog, lessons, and proof index.
> - AGHBARI-EXECUTION-START.md = launch router for commands 1 and 2.
>
> This file is maintained as a living system. It must describe verified reality, not aspirations.

---

## 1. PRODUCT / ENGINEERING OWNERSHIP

### Product owner
The product owner supplies product vision, user/business needs, commercial constraints, and final decisions on material product changes, irreversible business choices, and consequential cost commitments.

### Autonomous engineering operator
The programmer is delegated technical leadership across architecture, implementation, refactoring, UI/UX, security, data design, testing and verification, performance, CI/CD, observability, deployment engineering, technical documentation, technical debt management, and discovery of work required for correctness, security, reliability, and production readiness.

Within that scope, the programmer is expected to decide and act, not ask for step-by-step implementation instructions.

## 2. AUTONOMOUS DECISION BOUNDARY

### Autonomous by default
- File/module/component structure.
- Implementation patterns and refactoring required for correctness or maintainability.
- Test strategy and test additions.
- Security hardening.
- Database indexes/constraints/migrations when required by the accepted technical objective and safely reversible.
- UI/UX details and design-system decisions.
- Dependency selection/replacement when justified.
- Observability improvements and CI/test-harness repairs.
- Safe non-production verification.
- Ordering and parallelization of engineering fronts.

### Escalate to product owner
Escalate only for material changes to product strategy, business model, core user goals, pricing/commercial policy, irreversible external commitments, material new cost, deletion of core features or durable data, or legal/compliance obligations requiring owner judgment.

### Never autonomous
Never weaken security or evidence to make a gate pass; expose or invent secrets; bypass production controls; fabricate verification; silently change product policy to avoid a blocker; or promote/mutate Production while release rules forbid it.

## 3. SYSTEM MODEL

Treat the product as one integrated system:

UI → client state → API/RPC → authorization → database/storage → external services → CI/build → deployment artifact → runtime → user workflow → observability

A feature is not complete when one screen works. Trace dependencies, contracts, failure modes, permissions, data flow, UX states, and operational consequences across the system.

## 4. ENGINEERING DECISION RECORD

For each consequential technical decision record:
- Decision
- Problem / context
- Alternatives considered
- Reason selected
- Risks / trade-offs
- Affected components
- Verification evidence
- Date / exact SHA

Do not erase previous decisions to make history look clean. Supersede them with a new record.

## 5. ENGINEERING STANDARDS

Default standards: correctness before cosmetic completion; least privilege and defense in depth; explicit contracts and validation; small, reversible, testable changes; no speculative complexity; maintainable naming and component boundaries; observable and diagnosable failures; security in design, implementation, and proof; measure before optimization when measurement is available; dependencies chosen for fit, maturity, security, compatibility, and maintenance rather than novelty.

## 6. DESIGN SYSTEM

Product identity: الأغبري | Aghbari Commerce

The UI converges on one design system covering design tokens, colors, typography, spacing, radius/elevation, icons, buttons, inputs, tables, cards, dialogs, navigation, loading, empty, error and success states, responsive behavior, RTL/LTR, accessibility, keyboard and focus behavior.

Do not copy another product's visual surface. Reuse strong design principles while preserving an original Aghbari identity.

## 7. EXECUTION BACKLOG

Classify work as:
- P0 Critical / correctness / security / data integrity
- P1 Production-readiness / core reliability
- P2 Quality / performance / UX / maintainability
- P3 Nice-to-have / future

Unrequested work required to make the requested outcome correct, secure, reliable, testable, or releasable is in autonomous scope. Purely optional ideas remain backlog unless explicitly adopted.

## 8. VERIFICATION LEDGER

Every important claim identifies claim, exact SHA, environment, test/run/job, evidence/artifact, status, and date.

Vocabulary:
- IMPLEMENTED = source change exists.
- TESTED = a test was actually executed.
- VERIFIED = behavior was independently checked at the claimed layer.
- PROVEN = evidence is sufficient for the specific claim.
- CERTIFIED = all required release gates are satisfied.

NO EVIDENCE → NO PASS.
Evidence belongs to an exact SHA. A new SHA invalidates affected prior evidence.

## 9. TEST-THE-TEST / ADVERSARIAL REVIEW

For material claims ask whether the test could pass while the defect remains, whether selectors/assertions are too broad, whether setup can hide failure, whether the test proves the actual contract, and what happens under denial, duplication, malformed input, concurrency, stale state, empty data, and network failure.

A proof-system defect is tracked separately from a product defect.

## 10. CONTINUOUS DISCOVERY

After every requested change inspect dependencies, authorization, data constraints, migration impact, error states, regression risk, observability gaps, performance cost, accessibility, responsive behavior, and deployment implications.

The operator owns discovery of necessary adjacent work without inventing new product strategy.

## 11. RESEARCH / LEARNING

When a technical decision is uncertain: consult current official documentation; check compatibility and security implications; examine known limitations and failure modes; compare viable alternatives; record the resulting decision.

Important reusable knowledge must be recorded here or in the Control Plane evolution log.

## 12. SCOPE CONTROL

Before expanding work ask:
1. Is it required for correctness, security, reliability, or release of the requested outcome?
2. Is it a direct technical dependency of the outcome?
3. Is it merely desirable?

Only the first two are autonomous execution scope. The third belongs in backlog unless explicitly adopted.

## 13. PROBLEM DISCOVERY

The operator actively searches for broken assumptions, hidden coupling, weak authorization, unsafe storage access, fragile tests, unhandled states, data integrity hazards, deployment drift, observable runtime errors, scalability bottlenecks, UX dead ends, and material technical debt.

Discovered problems do not disappear merely because they were not in the original request.

## 14. RELEASE / PRODUCTION MEMORY

Current release and production truth lives in ops/AGHBARI-LATEST-EXECUTION-STATE.md.

Non-negotiables:
- Production = NO TOUCH until certification/release decision permits it.
- Live is not a substitute for candidate proof.
- Browser proof requires the browser to actually run.
- Deployment proof requires exact artifact/source alignment.
- CI success alone never certifies runtime behavior.

## 15. LESSONS / EVOLUTION

Each meaningful execution records what was learned, which failure mode was exposed, which observability improvement is permanent, how work can be parallelized better, whether tool/permission boundaries changed, whether stale evidence appeared, and the smallest durable rule that prevents recurrence.

Append durable lessons; never convert unresolved assumptions into facts.

## 16. CURRENT MEMORY POINTER

For latest verified SHA, blockers, runs, deployments, tool status, and next queue, read ops/AGHBARI-LATEST-EXECUTION-STATE.md.

For the complete execution constitution, read ops/AGHBARI-EXECUTION-CONTROL-PLANE.md.

## 17. EXECUTION LESSONS — 2026-09-18

### 17.1 Treat remote PR metadata as live truth
A tooling PR's stored/current-head SHA can drift independently of prior reports. Before accepting any tooling evidence, re-read the PR object and reconcile its actual `head_sha`; historical evidence from another SHA is never current evidence. On 2026-09-18 PR #72 actual head was `1830e3a109a9e0605f5306b2ddc8f308457fb375`, while older state text referenced `93552ada…`.

### 17.2 Self-mutating repair workflows are a release/supply-chain risk
An obsolete workflow `.github/workflows/repair-excel-build.yml` on `main` had `contents: write`, a push trigger, source mutation logic, and `git push origin HEAD:main`. The intended repairs were already present in product source, so the workflow was removed rather than retained. Removal was committed as `4505bcb655c0b747aeea7e1cc526a94f93270d3d`. Durable rule: automation that can rewrite and push application source to `main` must have a justified lifecycle, narrow authority, explicit review boundary, and must not remain after its repair purpose is obsolete.

### 17.3 Protected deployments remain blocked proof boundaries
A read-only browser run against candidate preview `dpl_5TaJDPGjjqT9asUJSnS9YDnxvH32` redirected both the app and `/build-meta.json` to Vercel SSO. This is evidence of an access boundary, not application failure and not PASS. Do not weaken deployment protection merely to manufacture browser proof.

### 17.4 Vercel source identity must be reconciled before release claims
The canonical org-linked Vercel project is `aghbari-commerce-c2dd` under `Aghbari-Technologies/aghbari-commerce`. A separate legacy `aghbari-commerce-web4` project is linked to `Report-Engainall/aghbari-commerce`. Treat such project/repository drift as a release/evidence reconciliation item; never assume a READY deployment is the canonical product deployment merely from its name.

### 17.5 Current tooling findings are real proof-system inputs
On tooling head `1830e3a109a9e0605f5306b2ddc8f308457fb375`, Gitleaks run `35301488345` produced 61 `generic-api-key` findings (artifact `10529832877`), and Semgrep run `35301488324` produced 36 blocking findings (artifact `10530271974`). The Gitleaks findings are concentrated in deterministic test fixtures and proof scripts, so they require classification against source before any allowlist is introduced; they are not automatically safe and are not candidate certification evidence.


## 18. COMMAND 1 — CONTINUED EXECUTION FINDINGS — 2026-09-18

- Vercel provides a temporary access-link mechanism for protected deployments. It was used only for read-only verification of the non-production candidate; protection was not weakened. TinyFish verified `AGHBARI B2B`, `بوابة الأغبري التجارية`, RTL/Arabic, and exact candidate `git_sha` 4d5057d7952e213d6b5328a80f0229f1ff9fb861.
- Formal authenticated E2E remains a separate gate because runtime credentials and the approved automation-bypass credential boundary are still unavailable through the connected mutation surface.
- Tooling PR #72 was actively hardened on its actual current head, now ffdf0b3e6d34adef11a198c8263a9fa9760188b8. Mutable GitHub Action tags were pinned to verified commit SHAs; Dependabot cooldown was added; Release Audit dynamic RegExp was replaced with parsed-function-name matching.
- Fresh CI was triggered on ffdf0b3e6d34adef11a198c8263a9fa9760188b8. No result is considered PASS until a terminal run proves it.


## 19. CURRENT EXECUTION RECONCILIATION — 2026-09-18

- PR #72 current head: `b9a585aa64058feaff9bd5f65476f52863d2a503`. Earlier tooling SHAs are historical only.
- Exact-head tooling PASS: Gitleaks `35304530215`; Semgrep `35304530295`; CodeQL `35304530253`; Trivy `35304530237`; security-audit `35304530280`; application-quality `35304530205`; G1 Domain `35304530524`.
- Gitleaks uses a narrow fixture allowlist; it was not globally disabled. Current exact-head result is PASS.
- Obsolete repair automation is removed from both main and tooling branch.
- Candidate remains frozen at `4d5057d7952e213d6b5328a80f0229f1ff9fb861`; production remains `b102ce5e9aebe61bb13581cd9a8f45d1cc43c497` and untouched.
- Read-only candidate browser proof is PASS via TinyFish `604c8f4a-19f1-4357-b380-9b2c816937fb`; authenticated E2E and Formal Final Regression remain unresolved.
- Migration-proof run `35304530279` is still RUNNING at local Supabase startup; no terminal result is inferred.


## 20. AUTONOMOUS EXECUTION RECONCILIATION — 2026-09-18 07:26 +03

- Live GitHub verification supersedes stored tooling-head references: PR #72 is currently at `bc40f6b04ca974d6f7aed9daf5c581e18ca710d8`. All prior tooling evidence belongs to prior SHAs and is historical only.
- No PR workflow runs are exposed for the current tooling head through the connected GitHub read surface. Therefore current tooling verification is NOT_PROVEN; no predecessor PASS is transferred.
- The current tooling head has a Vercel combined-status failure whose target indicates `upgradeToPro=build-rate-limit`. This is classified as tooling/deployment infrastructure, not a candidate product defect.
- Canonical Vercel identity was independently reconciled: project `aghbari-commerce-c2dd` / `prj_ww25V0FNP0YQCIcCAEFKVPkzLyOm` is linked to `Aghbari-Technologies/aghbari-commerce`. The frozen candidate deployment `dpl_5TaJDPGjjqT9asUJSnS9YDnxvH32` is READY and exact-SHA aligned to candidate `4d5057d…`.
- Live/production remains `b102ce5e9aebe61bb13581cd9a8f45d1cc43c497`, untouched. No promotion or production mutation occurred.
- Supabase live project `mrcyqezbhpncuvaehwgf` is ACTIVE_HEALTHY. Current security advisor observations include 1 anon-executable SECURITY DEFINER function (`get_customer_invitation_for_acceptance`) and 58 authenticated-executable SECURITY DEFINER functions. These were observed only; no Production mutation was performed.
- Durable lesson: operational memory must be reconciled against remote source-of-truth at the start of every run, and any newly advanced SHA immediately invalidates affected predecessor evidence.


## 20. COMMAND 1 — 2026-09-18 TOOLING BASELINE RECONCILIATION

- PR #72 current head is `ddd00fc142ef60bc99e5fe8ebc63d4c53caaed94` and remains draft/isolated from the frozen candidate.
- Exact-head tooling CI: Gitleaks `35307503455`, security-audit `35307503508`, G1 Domain Proof `35307503543`, Semgrep CE `35307503464`, Trivy `35307503456`, application-quality `35307503487`, and CodeQL `35307503481` completed successfully. Supabase migration proof `35307503570` failed only in pgTAP.
- Migration proof for the tooling baseline successfully started local Supabase and applied the full migration set from an empty database. The failure occurred during pgTAP execution and includes stale syntax/plans/permissions and old search_path expectations.
- A diagnostic attempt copied candidate tests into the tooling branch. Comparison showed that the candidate also contains later product migrations absent from the tooling baseline, including product-media, purchase-outbox, and security-definer hardening. The diagnostic commits were fully reverted so the tooling branch remains isolated.
- Durable decision: tooling CI and product-candidate certification are separate evidence lanes. Never import candidate migrations or candidate-specific contracts into the tooling branch simply to obtain a green tooling run.
- Candidate `4d5057d7952e213d6b5328a80f0229f1ff9fb861` remains frozen and its previously proven exact-SHA evidence remains intact.
- Production `b102ce5e9aebe61bb13581cd9a8f45d1cc43c497` remains untouched; runtime inspection found no error clusters or error/fatal logs over the inspected 24h window.


## 21. COMMAND 1 — 2026-09-18 — TOOLING / PGTAP / BROWSER RECONCILIATION

- PR #72 exact head is `92fa7bffb8971eecb10d91fe588709da0e06675a`. Eleven terminal CI gates pass on this exact SHA; migration proof fails only during pgTAP.
- PR #73 exact head `cf7db1c376e40c44ed0cec1956c9b59ee8f5d7f0` is test-harness-only. After its repairs, pgTAP still fails 12 assertions across storage, purchase receipt outbox, expense cash balance, transfer search_path, and remaining SECURITY DEFINER search_path contracts.
- Durable classification: the five remaining failures are main-branch product/schema contract gaps, not license to copy candidate migrations into tooling. Keep proof-system remediation and product remediation separate.
- Supabase production migration history contains corresponding hardening migrations; this is corroborating evidence only. Production was not modified.
- Fresh read-only candidate browser proof `683148ee-b515-4e81-a2cb-ff4fa4a07ca0` passed page load, Arabic RTL, brand visibility, and no visible errors/broken links or images.
- Authenticated E2E remains blocked by the unavailable Vercel automation-bypass credential path. Formal Final Regression remains not proven because workflow dispatch is not exposed.
- Candidate `4d5057d7952e213d6b5328a80f0229f1ff9fb861` remains frozen; Production `b102ce5e9aebe61bb13581cd9a8f45d1cc43c497` remains untouched.
- Evidence artifact: `ops/evidence/20260918-command1-tooling-pgtap-browser-reconciliation.md`.

Decision:
Tooling PR #72 stays isolated and non-certifying until its baseline contract is intentionally reconciled. PR #73 remains a diagnostic/test-only lane. No production promotion or protection weakening is permitted.

## 22. COMMAND 1 — 2026-09-18 — AUTHENTICATED BROWSER BOUNDARY RECHECK

- Candidate deployment `dpl_5TaJDPGjjqT9asUJSnS9YDnxvH32` remains READY and exact-SHA aligned to `4d5057d7952e213d6b5328a80f0229f1ff9fb861`.
- Re-running the exact candidate browser job produced job `105488272913` under run `35299467671`; it failed closed before browser execution because `VERCEL_AUTOMATION_BYPASS_SECRET` is empty. `E2E_BASE_URL` and `EXPECTED_SHA` were present and valid.
- This confirms the authenticated browser blocker is a persistent credential-boundary condition, not an intermittent browser/application failure.
- TinyFish read-only browser run `683148ee-b515-4e81-a2cb-ff4fa4a07ca0` remains separate PASS evidence for page/RTL/brand health only.
- Vercel canonical project is on the Hobby plan. No protection was disabled, no secret was generated or exposed, and no repository secret was stored.
- Formal Final Regression remains NOT_PROVEN due unavailable workflow dispatch. Candidate remains frozen and Production remains untouched.
- Evidence artifact: `ops/evidence/20260918-command1-browser-credential-boundary-recheck.md`.

Durable rule:
When an authenticated browser gate is blocked by a missing secret, re-running the exact SHA is valid diagnostic evidence only; do not work around the secret by weakening deployment protection, using a share link as a substitute, or fabricating credentials.


## 21. COMMAND 1 — WORKFLOW SAFETY + RELEASE-GATE RECONCILIATION — 2026-09-18

### Durable workflow-security lesson
An operational workflow audit must cover every file under .github/workflows, not only the workflow currently named in the incident. A release candidate was found to contain three repository-write paths: repair-excel-build.yml and two bootstrap lockfile workflows. The candidate was hardened by removing the self-mutating repair workflow, removing the redundant bootstrap-package-lock workflow, and converting bootstrap-release-lockfile.yml to read-only validation. An exhaustive scan at candidate SHA 4753cc3319f551aeccbe2bd081b988fa68df8e87 found 15 workflow files with zero contents: write declarations and zero git push commands.

### Release-audit contract lesson
Deleting a workflow that a release-audit script explicitly requires is not a valid hardening fix. The intermediate candidate SHA 70bd9bd9d7df6e0dd889dff189698841096fd116 failed Release Audit because bootstrap-release-lockfile.yml was missing. The final candidate restored the required file with least-privilege read-only validation. The correct pattern is contract-preserving hardening, not contract removal.

### Current candidate / evidence state
PR #74 current head: 4753cc3319f551aeccbe2bd081b988fa68df8e87.
All evidence tied to previous candidate 4d5057d7952e213d6b5328a80f0229f1ff9fb861 is historical and invalid for the current candidate until re-proven.

### External release blockers
The canonical Vercel project reported the current candidate SHA as Deployment rate limited — retry in 24 hours, and no current-SHA deployment was present in the deployment list. Therefore Deployment Artifact and Deployment Browser cannot be certified from an older deployment.

The authenticated Deployment Browser remains blocked by the missing approved Vercel automation-bypass credential. Formal Final Regression remains NOT_PROVEN because the connected GitHub mutation surface has no workflow-dispatch capability; a TinyFish inspection of the GitHub Actions UI was also unauthenticated and showed no Run workflow control.

Production remains b102ce5e9aebe61bb13581cd9a8f45d1cc43c497 and NO TOUCH. No production mutation or promotion occurred.

### Evidence artifact
ops/evidence/20260918-command1-workflow-safety-release-gates.md


## 2026-09-18 — Command 1 — current candidate closure

Current certification candidate:
- SHA `4753cc3319f551aeccbe2bd081b988fa68df8e87`
- Branch `execution/closure-hammer-20260918c`
- PR #74, open/draft/mergeable
- Main `4505bcb655c0b747aeea7e1cc526a94f93270d3d`
- Production `b102ce5e9aebe61bb13581cd9a8f45d1cc43c497`, NO TOUCH

Current exact-SHA proof:
- Application Quality `35310025067` PASS
- G1 `35310025098` PASS
- Bootstrap Release Lockfile `35310025140` PASS
- Security Audit `35310025100` PASS
- Order Workflow Proof `35310025147` PASS
- Order Invariant Contract `35310025210` PASS
- Supabase Migration Proof `35310025169` PASS
- Fresh Local Browser `35310025060` PASS
- Test-the-Test `35310025041` PASS
- Concurrency Proof `35310025032` PASS
- Local Production Artifact `35310025159` / job `105490749871` PASS, including exact-SHA artifact build/checksum and customer/admin browser E2E against isolated local Supabase.

Release evidence state:
- Vercel candidate deployment is unavailable because exact-SHA status reports `Deployment rate limited — retry in 24 hours`; no candidate deployment exists in the canonical deployment list.
- Authenticated Deployment Browser remains BLOCKED because `VERCEL_AUTOMATION_BYPASS_SECRET` is unavailable. No secret was generated, printed, committed, or exposed; protection remains intact.
- Formal Final Regression remains NOT_PROVEN. The candidate repository contains `workflow_dispatch` on 13 of 15 workflows, but the connected GitHub mutation surface cannot invoke workflow dispatch. This is an execution-capability boundary, not evidence that the source workflows lack dispatch support.
- Workflow safety is CLOSED on the candidate: 15 workflow files audited, 0 `contents: write`, 0 `git push`.
- Certification remains NO; final evidence reconciliation is OPEN.

Durable lesson:
Do not conflate a workflow's source-level `workflow_dispatch` declaration with the operator's ability to execute it. Do not add speculative workflows or weaken security controls merely to compensate for a connector limitation. Preserve exact-SHA evidence and Production NO TOUCH.


### 2026-09-18 — Durable lesson: deployment capability and verification capability are separate
- Exact candidate `4753cc3319f551aeccbe2bd081b988fa68df8e87` has terminal exact-SHA CI/browser-local evidence, but no exact-SHA Vercel deployment.
- The canonical Vercel project is the Aghbari-Technologies-linked project `aghbari-commerce-c2dd`; older/fork-linked projects are not interchangeable evidence sources.
- `runtime-e2e.yml` is the formal authenticated browser certification workflow and is manually dispatchable in source, while `production-smoke.yml` only verifies an already-deployed exact artifact.
- Repository workflow presence does not imply connected-session dispatch authority. Do not substitute an older deployment URL or weaken protection to bridge this gap.


### 2026-09-18 — Command 1 — latest runtime/deployment evidence reconciliation

- Direct Vercel deployment creation was attempted against the connected deployment surface. It failed with HTTP 402 `api-deployments-free-per-day` because the free deployment quota is exhausted; no deployment was created and no Production mutation occurred.
- Canonical Vercel project `aghbari-commerce-c2dd` remains the correct repository-linked project. Its latest observed READY deployments are for control-plane/tooling commits, not candidate `4753cc3…`.
- Exact candidate Local Production Artifact run `35310025159` / job `105490749871` executed the customer suite (3 tests: invalid login; authenticated customer search/catalog/cart/order/refresh/logout; Tenant-A/Tenant-B isolation) and the admin control-plane test (1 test), all PASS on exact SHA `4753cc3319f551aeccbe2bd081b988fa68df8e87`. The uploaded Playwright HTML report represents the final admin invocation only; job logs are the authoritative 3+1 execution proof.
- Repository source confirms `.github/workflows/runtime-e2e.yml` dispatches the complete authenticated E2E suite, including invitation and customer-template specs. A read-only workflow-history audit found no Runtime E2E Certification run on candidate `4753cc3…`; five recorded runs are on earlier SHAs and are historical only.
- Durable rule: a successful partial/local E2E job does not close the complete authenticated runtime gate when the formal runtime workflow has not executed the candidate's full e2e suite.


## 2026-09-18 — Command 1 — dispatch capability and exact local proof clarification
- Exact candidate remains `4753cc3319f551aeccbe2bd081b988fa68df8e87`; Production remains `b102ce5e9aebe61bb13581cd9a8f45d1cc43c497` and NO TOUCH.
- Exact local production-artifact job `35310025159` / `105490749871` logs directly prove candidate/build SHA alignment, Chromium execution, Customer `3 passed`, Admin `1 passed`, and artifact `10532997772` upload. This is local exact-SHA browser proof only, not deployed authenticated runtime certification.
- `.github/workflows/runtime-e2e.yml` was independently fetched at the exact candidate and confirmed to contain `workflow_dispatch` with required `base_url` and `exact_sha` inputs. TinyFish run `d6315349-d551-473c-b108-997141884371` confirmed the connected GitHub browser session is unauthenticated and shows Sign in; absence of the Run workflow control is therefore an authentication boundary, not evidence that the workflow lacks dispatch support.
- Durable rule: classify source workflow dispatch capability and operator/session dispatch authority as separate proof facts. Never modify workflows or weaken controls to compensate for a connector authentication limitation.
- Canonical Vercel project remains `aghbari-commerce-c2dd` / `prj_ww25V0FNP0YQCIcCAEFKVPkzLyOm`; candidate deployment is still unavailable because the Hobby deployment quota returned HTTP 402 `api-deployments-free-per-day`.

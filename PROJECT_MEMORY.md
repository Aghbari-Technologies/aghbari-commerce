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


## 23. FINAL EXACT-SHA PROOF CLOSURE — 2026-09-18

### 23.1 Candidate proof integrity
Candidate `5b9f2a76615e76bb6444c81f39e02f3479c0704b` is the current certification subject. Its 13 verification gates are terminal PASS on the exact SHA. The candidate was advanced from `4753cc...` only after a proven proof-system defect showed pull_request workflows using synthetic merge refs; the final exhaustive audit also removed implicit checkout from bootstrap release verification.

### 23.2 Durable workflow rule
For any pull_request verification workflow, exact-SHA proof requires explicit source-head resolution via `github.event.pull_request.head.sha` (or validated manual input), explicit checkout ref, and an exact HEAD assertion. Merely observing the workflow run's `head_sha` is insufficient.

### 23.3 Final release boundary
Current candidate CI closure does not equal deployed-runtime certification. Exact Vercel deployment, authenticated browser runtime proof, and Formal Final Regression remain separate mandatory evidence layers. Candidate deployment currently has zero canonical Vercel matches because of the platform deployment-rate-limit boundary. Production remains untouched.

### 23.4 Tooling isolation
PR #72 remains an isolated tooling lane at its current head; PR #73 remains an isolated pgTAP diagnostic lane. Their findings and PASS states do not transfer into candidate certification. Never import candidate migrations/contracts into a tooling baseline merely to obtain green status.

## 2026-09-18 — Closure lessons: exact-head proof and tooling validation

- Pull-request workflows must derive certification target from `github.event.pull_request.head.sha || github.sha` and assert the checked-out HEAD before executing any proof. A successful workflow on a synthetic merge ref is not evidence for the PR head.
- Shell regex validation in GitHub Actions must use a shell-supported construct such as `[[ "$TARGET_SHA" =~ ... ]]` or `grep -Eq`; `test ... =~ ...` is invalid and causes false tooling failures before the actual scanner runs.
- Tooling lanes remain non-certifying until their exact current head has terminal evidence. A clean migration apply followed by pgTAP failures must remain FAIL/diagnostic; never suppress the failing suite merely to make the tooling PR green.
- Current candidate at this record is `5b9f2a76615e76bb6444c81f39e02f3479c0704b`; all candidate verification evidence must remain tied to that exact SHA.

## 2026-09-18 — Durable deployment-evidence rule

- A Vercel deployment marked READY on a branch may point to an older commit than that branch's current GitHub HEAD. Therefore deployment evidence is admissible only when the deployment's recorded Git SHA exactly matches the claim under verification; "latest deployment" or branch name alone is never sufficient.
- Current observed example: tooling branch HEAD is `d884f90fcdcb95eeceb47e78d8f36792268f830d`, while the latest observed Vercel deployment for that branch is commit `337b8c787c4f4d35de957214ad5596e87cc27eb4`. The deployment is valid historical evidence for that older commit, not evidence for current tooling HEAD and never evidence for candidate #74.


## 2026-09-18 — Durable execution lesson: READY deployment is not candidate delivery

A canonical Vercel project may receive a newer READY deployment from an operational branch while the release candidate has no deployment. Deployment admissibility is determined by the deployment's recorded Git SHA, not by recency, branch naming, project name, or READY state. For the current certification subject `5b9f2a76615e76bb6444c81f39e02f3479c0704b`, the reconciled canonical Vercel project has no exact-SHA deployment; the newest READY deployment observed is an `ops/execution-control-plane` commit and is operational evidence only.

Operational state was reconciled on 2026-09-18 without changing the candidate or Production. Candidate exact-SHA proof remains terminal PASS across all 13 mandatory gates; deployment browser and formal final regression remain unresolved external capability boundaries. Tooling PR #72 migration proof remains a separate pgTAP baseline failure and must not be mixed into candidate certification.
## 22. MARKET-LED PRODUCT DIFFERENTIATION DECISION — 2026-09-18

### Decision
Adopt a permanent Market-Led / Evidence-First differentiation layer for Aghbari Commerce.

The product is not optimized to win by copying the largest competitor's feature count. It is optimized to create defensible client value through:
- B2B operational workflow depth;
- Arabic/RTL-first UX;
- tenant isolation, RLS and RBAC;
- explainable operational state and provenance;
- Excel/legacy/Onyx migration readiness;
- inventory/order concurrency and idempotency;
- reliable webhook/outbox/retry integrations;
- bounded offline/low-bandwidth behavior;
- takeover-ready architecture for existing/AI-generated codebases;
- production-grade observability, recovery and evidence;
- sanitized demo and proof-backed portfolio artifacts.

### Product moat
The strongest reusable moat is:

CLIENT PROBLEM → WORKFLOW → TRUST → RELIABILITY → PROOF

not:

FEATURE COUNT → SCREEN COUNT → TECHNOLOGY LIST

### New durable requirement
Every major product capability that can be shown to a prospective client should be capable of being converted into a proof-backed case study without fabricating results.

Case-study evidence should distinguish:
IMPLEMENTED / TESTED / VERIFIED / PROVEN / PRODUCTION CERTIFIED

### Competitive workflow requirements
Priority workflows for product/portfolio depth:
1. First B2B order.
2. Repeat/reorder workflow.
3. Excel/legacy data onboarding.
4. Warehouse/order processing.
5. Tenant onboarding.
6. Integration failure/retry/recovery.

### Differentiator backlog
Track these as product/design candidates, executing only where evidence and scope justify them:
- Command Palette;
- Bulk Action Center;
- Smart Reorder;
- Barcode-first operations;
- Explainable business state;
- Conflict Center;
- Recovery Center;
- Tenant onboarding wizard;
- Saved Views;
- keyboard-first desktop workflow;
- sanitized Demo Mode;
- Capability Cards / evidence-backed case studies.

### Market discipline
Current Upwork research is an input to prioritization, not authority for uncontrolled scope expansion. A market request becomes a product requirement only when it:
1. fits the Aghbari product boundary;
2. improves a meaningful client workflow or release capability;
3. can be implemented without weakening security/evidence/production safety;
4. has a clear acceptance/evidence path.

### Commercial operating decision
Upwork opportunities are handled through:
DISCOVER → SCREEN → FIT-MAP → PROOF-MAP → DIFFERENTIATOR-MAP → COMMERCIAL CHECK → PROPOSAL → FOLLOW-UP → INTERVIEW PREP → CONTRACT REVIEW → DELIVERY → PORTFOLIO UPDATE

The portfolio is treated as an evidence surface for the engineering work, not as a source of unsupported claims.

### Evidence source
- docs/UPWORK-MARKET-REQUIREMENTS-20260918.md
- docs/UPWORK-BID-ENGINE-20260918.md
- docs/COMPETITIVE-MOAT-AND-PORTFOLIO-20260918.md
- Main execution index linked to these documents.

### Non-negotiables
Market differentiation never overrides:
- exact-SHA evidence;
- security and tenant isolation;
- Release Gates;
- Production NO TOUCH;
- no-false-closure;
- honest portfolio and client claims.

## 23. SIX-LANE COMPETITIVE HUNT DECISION — 2026-09-18

### Decision
Adopt six narrow Upwork hunt lanes as the default commercial search surface for Aghbari:

1. Supabase Multi-Tenant Security / RLS
2. B2B Commerce / Order & Inventory Operations
3. Arabic/RTL B2B SaaS
4. Next.js/Supabase Production Rescue / Takeover
5. Data Migration / Excel / Legacy-to-SaaS Onboarding
6. Integration Reliability / Webhooks / Outbox / Recovery

Detailed rules are maintained in:
- `docs/UPWORK-COMPETITIVE-HUNT-LANES-20260918.md`
- `docs/UPWORK-BID-ENGINE-20260918.md`
- `docs/COMPETITIVE-MOAT-AND-PORTFOLIO-20260918.md`

### Operating principle
The commercial unit is:
`CLIENT PAIN → RELEVANT AGHBARI WORKFLOW → PROOF → DIFFERENTIATOR → BOUNDED MILESTONE`

One opportunity must map to:
`one lane + one primary moat + one proof asset + one measurable first milestone`.

### Why these lanes
The lanes were selected because current Upwork postings directly show demand around Supabase/RLS/multi-tenant security, Arabic/RTL Next.js/Supabase SaaS, existing Next.js/Supabase hardening/takeover, and closely related SaaS/operations work. The product already contains reusable evidence and architecture for these areas.

### Search discipline
Generic "Full-Stack Developer" search is no longer the default. Search uses narrow lane-specific query families. Out-of-lane opportunities are WATCH/SKIP unless their problem-to-proof fit is demonstrably stronger than the six lanes.

### Proof discipline
A market request does not create a product claim. Commercial claims must be backed by a real Aghbari artifact/evidence layer. Production claims require production evidence.

### Competitive objective
Do not attempt to beat larger providers by feature-count breadth. Beat them in selected problems through:
- deeper workflow specificity;
- stronger trust/security proof;
- faster operational journeys;
- Arabic/RTL excellence;
- migration/integration readiness;
- reliability/recovery;
- evidence-backed proposals and demos.

### Product-roadmap rule
Market demand can become a product backlog item only through:
`market signal → product-fit gap → controlled backlog → implementation → exact evidence → portfolio artifact → targeted proposal`

No market-derived requirement may weaken security, exact-SHA evidence, release gates, tenant isolation, or Production NO TOUCH.


## 2026-09-18 UI quality decision

- **Decision:** Customer order-template persistence is PostgreSQL-authoritative end to end; browser `localStorage` is not an authoritative template store.
- **Reason:** the backend already provides normalized `order_templates` + `order_template_lines`, RLS, atomic apply, idempotency, and authorization. Keeping a parallel browser source creates drift and violates the system's trust model.
- **UI rule:** visible keyboard shortcuts must have real behavior; navigation items must target implemented work areas; dashboard data queries must reference live canonical schema.
- **Deployment rule:** maintain a provider-neutral static deployment path. Netlify configuration is now present for the Vite SPA; provider integration must not receive secrets in source and must remain independent of the frozen certification candidate.
- **Scope:** implemented on non-certifying UI branch `enhancement/ui-command-center-20260918`; certification candidate `5b9f2a...` remains unchanged.


## 2026-09-18 — UI truth, business timezone, and provider-neutral delivery

- UI upgrades must extend the existing customer/admin surfaces rather than replatforming or replacing already-implemented workflows without evidence of necessity.
- Dashboard business-day metrics must use an explicit business timezone (`Asia/Aden` for the current product context), not the CI runner or browser machine timezone. The metric logic is isolated in `src/domain/adminDashboard.ts` and covered by `adminDashboard.test.ts`.
- Admin navigation and quick actions are part of the authorization UX contract: a control that targets an unavailable role-specific work area must not be rendered as an actionable link.
- Netlify failover is now provisioned as a separate static-hosting path (`aghbari-commerce-web`) with the production Supabase URL/publishable client configuration. Actual deployment remains a separate proof layer and must not be claimed until source upload succeeds.
- Current scope is PR #81 at exact HEAD `384a0f494702e942fdc23d9f0a0981cff8d277fd`; certification candidate `5b9f2a...` remains unchanged.


## 2026-09-18 — Release Integration Over Frozen Candidate

A release integration branch `release/ui-over-certified-candidate-20260918` now starts exactly at the frozen candidate `5b9f2a...` and adds only the seven-file UI/Netlify improvement set. This is the correct path when main is missing candidate-era database hardening. The frozen candidate branch is immutable; the integration branch is a new evidence subject. No prior PASS transfers to its new SHA.


## 2026-09-18 — Release Integration Evidence Closed

The candidate-derived UI integration subject at `a85926c2ec4ff781f03b230e929b0a1ecb5bfafe` passed Application Quality, Security, G1, Order Workflow, Order Invariant, Intelligence Contract, Bootstrap Lockfile, Supabase Migration Proof, Fresh Local Browser E2E, Local Production Artifact Browser E2E, Concurrency Proof, and Test-the-Test. External/live deployment proof remains a distinct missing layer; no PASS was transferred to Production or to an external deploy that does not exist.


## 16. NEW DURABLE LESSONS — 2026-09-18

### 16.1 Exact runtime identity
A successful real browser session is valid evidence for the exact Deployment/SHA it actually opened. It must never be transferred to a different candidate SHA, even when the application branding and UI are identical.

### 16.2 Offline completion definition
Offline support is incomplete when only a local queue exists. The runtime must reject impossible payloads using the canonical domain limits, re-authenticate through the normal session path, drain on reconnect, surface connection/sync state to the user, and guard the drain against effect re-entry loops.

### 16.3 Reporting Gateway browser contract
A browser-invoked Edge Function must explicitly satisfy CORS preflight requirements for the headers/methods actually sent by the client. Reporting publication retries must preserve the same idempotency key for the same period; the server-side idempotency contract must include the reporting period itself.

### 16.4 Superseded release lanes
When a successor candidate or merged implementation replaces an older PR, close the superseded lane while retaining its evidence as historical/non-transferable. The current exact head must remain visible in the authoritative state.


## 2026-09-18 — Command 1 — Exact candidate recovered and deployment boundary rechecked

- LIVE certification candidate: `certification/final-candidate-20260918`
- EXACT CANDIDATE SHA: `2263648fbbbd0d480b37401795ac16c2b5764da6`
- PR: #83, base `main` at `427ff0801544449f432290205b2a29f2508541f3`
- The candidate advanced from the previously failing `61e06987a...` through 11 commits that repaired the migration-proof authority check, concurrency proof, and stale source-contract/pgTAP coverage.
- Current exact-head GitHub check inventory: 20 check-runs are attached to this SHA; the substantive certification gates are PASS, including application quality, security, G1 domain invariants, order workflow, Supabase migration proof, fresh/local browser proof, local production artifact proof, concurrency proof, and test-the-test.
- Exact Vercel candidate deployment exists now: `dpl_DsZ3vCJi5ik2LayyshG6ywxAabCZ`, READY, Git-linked to branch `certification/final-candidate-20260918`, and its recorded Git SHA is exactly `2263648fbbbd0d480b37401795ac16c2b5764da6`.
- Vercel build logs show checkout of commit `2263648`, `npm ci`, TypeScript check, Vite production build, and successful deployment completion.
- Vercel project runtime-error scan for the current period is clean.
- Public browser entry was independently reachable through a temporary Vercel access grant and rendered the Arabic customer login surface with no visible application error banner. This proves entry-surface reachability only; it is not authenticated E2E evidence.
- The deployment-triggered browser E2E job did start against this exact deployed URL but failed closed before Playwright because `VERCEL_AUTOMATION_BYPASS_SECRET` is missing. GitHub Actions currently exposes customer E2E secrets `E2E_EMAIL`, `E2E_PASSWORD`, `E2E_EMAIL_B`, and `E2E_PASSWORD_B`, but `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, and `VERCEL_AUTOMATION_BYPASS_SECRET` are absent.
- The formal `runtime-e2e.yml` workflow remains a workflow_dispatch-only certification path; the connected GitHub action surface does not expose workflow dispatch creation. No authenticated production/candidate browser PASS may be claimed without that exact run.
- Production remains NO TOUCH. The current production deployment is still the older `main` deployment and is not being promoted or mutated by this execution.

### Current release state

CERTIFICATION CANDIDATE: **NOT CERTIFIED YET**

IMPLEMENTATION / CI / LOCAL E2E / EXACT VERCEL DEPLOYMENT: **PROVEN on 2263648f...**
AUTHENTICATED DEPLOYED BROWSER E2E: **BLOCKED by missing Vercel automation-bypass secret and missing admin E2E credentials**
FORMAL FINAL RUNTIME REGRESSION: **NOT EXECUTED**
PRODUCTION RELEASE: **NO TOUCH / NOT PROMOTED**

### Next executable closure gate

Provide the existing Vercel Automation Bypass secret to the repository and provision the admin E2E account credentials; then trigger `browser-e2e-exact.yml` and `runtime-e2e.yml` against the exact deployment URL and exact SHA `2263648fbbbd0d480b37401795ac16c2b5764da6`. After both authenticated browser proofs pass, recheck the complete exact-head gate inventory and only then evaluate production promotion.


---

## 24. LIVE REQUIREMENTS HUB — SINGLE MEMORY LOCATION — 2026-09-18

> **This section is the canonical live-memory consolidation of accepted Aghbari Commerce requirements.**
>
> The detailed specification files remain supporting references, but the next execution MUST begin from this hub so product requirements are not scattered across chat history or disconnected notes.
>
> Rule: when a requirement is added, corrected, or superseded, update this hub in the same execution and identify the companion detailed source when one exists. Do not leave a newly accepted requirement only in chat.

### 24.1 Product identity and mission
- Product identity: **الأغبري**.
- Canonical customer-facing identity: **بوابة الأغبري للمواد الغذائية** / Aghbari Commerce.
- Legacy identity **العامري** must not appear in current product UI, metadata, documentation, tests, or release artifacts except explicit historical/reference context.
- Product is a reliable Arabic RTL-first B2B wholesale commerce / operational system of record.
- Product is designed for medium traders that need a practical alternative to heavyweight ERP systems.
- Operational truth belongs to the server/database; client state is never authoritative for money, stock, permissions, tiers, totals, order acceptance, or integration completion.
- Report-Advisor remains the separate analytical/BI layer. Do not duplicate BI dashboards, forecasting, decision intelligence, or executive analytical reporting inside Aghbari.
- Data sent through the Report-Advisor gateway must not remain as a competing reporting-data source in Aghbari or alter store transactions after handoff.

### 24.2 Mandatory operational modules
1. Authentication and identity
   - Secure session handling.
   - Customer/staff separation.
   - Server-side tenant context and authorization.
   - Customer approval, activation, suspension, reactivation.
   - Staff roles and least privilege.
   - Session expiry/re-authentication.
   - Unauthorized/expired-session handling.
2. Organizations / branches / warehouses
   - Tenant isolation.
   - Branches and warehouses.
   - Warehouse-scoped inventory.
   - Scope-aware staff permissions.
   - Cross-tenant/cross-warehouse rejection.
3. Customers
   - Create/manage/approve/activate/suspend/reactivate.
   - Contact and operational account state.
   - Customer tier assignment.
   - Server-side authorized-price resolution.
   - Customer-facing UI must not expose internal tier metadata.
4. Suppliers
   - Supplier master data and lifecycle.
   - Purchasing linkage.
   - Tenant-scoped authorized access.
5. Catalog
   - Categories, products, UUID identity, SKU/item number/barcode, units, status, descriptions/metadata.
   - Product media/images.
   - Search, filtering, categories, pagination.
   - Measured/appropriate indexes and explicit freshness policy.
6. Product media
   - First-class media entity separate from product identity.
   - Stable product UUID across media replacement.
   - Multiple images and explicit primary image.
   - Safe MIME/type/size validation; no executable content.
   - Authorized tenant-scoped media operations.
   - Graceful missing/broken images.
   - Private-object access must remain authorized.
   - Never use media as price/stock/SKU truth.
7. Pricing
   - Customer pricing tiers.
   - Product price per tier.
   - Server-side effective-price selection.
   - Effective dates/versioning where required.
   - Price-change audit.
   - Promotions as separate bounded context.
   - Deterministic promotion precedence.
   - Bulk price update with validation/preview.
   - Customer sees only authorized price.
8. Cart
   - One logical active cart per customer context.
   - At most one active line per product/cart.
   - Set quantity/remove/repeated-operation determinism.
   - Quantity/UUID/payload bounds.
   - Safe bounded offline support.
   - Cart is not final order truth.
9. Orders
   - Server-generated canonical order ID and order number.
   - Transactional creation.
   - Authorized price/quantity/customer snapshots as required.
   - Server-calculated totals.
   - Explicit lifecycle/state machine and status history.
   - Notes/amendments/fulfillment/delivery/invoice where required.
   - Search/filter.
   - Duplicate-submission prevention and idempotency.
   - Concurrency protection and audit trail.
10. Inventory
   - Balance by product/warehouse.
   - Movement ledger, receipts, adjustments, reconciliation, thresholds, reservations.
   - Lot/batch/expiry/traceability where required.
   - Receiving provenance and blocked/expired/quarantined stock states where applicable.
   - FEFO when enabled.
   - No direct ad-hoc balance edits.
   - Every material mutation carries actor, reason, source/reference, timestamp.
   - No overselling, lost update, double mutation, or partial transactional mutation.
11. Purchasing and receiving
   - Suppliers, purchase orders/lines, approval/submission lifecycle.
   - Idempotent creation and exact-payload replay.
   - Changed-payload conflict rejection.
   - Finite numeric validation; reject NaN/Infinity/-Infinity.
   - Receiving events.
   - Inventory changes only through domain operations.
   - Receipt idempotency and transactional inventory/outbox/audit effects where required.
12. Promotions
   - Separate from base pricing.
   - Deterministic eligibility and precedence.
   - Server calculation.
   - Financially material result persisted/audited.
13. Imports
   - Upload → Quarantine → Parse → Schema Validation → Business Validation → Preview → Approval → Atomic Commit → Evidence.
   - Untrusted-file boundary.
   - Type/size validation, safe parser, malformed numeric rejection.
   - No SQL injection or cross-tenant import.
   - Actionable row errors, duplicates, fingerprinting/idempotency.
   - No mutation before approval.
   - Atomic/auditable commit with rollback/recovery semantics.
14. Exports
   - Authorized canonical reads only.
   - Tenant scope.
   - Versioned contract and exact column order where required.
   - No customer-data leakage.
   - Export audit.
   - Onyx contract isolated from core domain.
15. Notifications
   - Intent, recipient, channel, delivery state, attempts, provider reference.
   - Retryable vs terminal failure.
   - Never block the core transaction.
16. Outbox/integrations
   - Business Transaction → Commit → Durable Outbox → Worker → Adapter → Provider → Delivery Record → Retry/Backoff → Terminal Failure/DLQ.
   - Onyx Pro, WhatsApp provider, Report-Advisor bridge.
   - External systems never write canonical Aghbari tables directly.
   - Idempotency key + correlation ID per delivery.
   - Attempt/status/timestamps/provider reference/error classification.
   - At-least-once consumers must be idempotent.
   - Queueing/adapter existence is not delivery proof.
17. Audit
   - Authentication/security changes.
   - Customer lifecycle.
   - Price changes.
   - Orders/status changes.
   - Inventory/purchasing/receipts.
   - Import/export.
   - Integration retries/replays.
   - Privileged administrative actions.
   - Scope-aware, append-oriented, tamper-resistant within application trust model.
   - Do not store secrets unnecessarily.
18. Offline/PWA
   - Convenience/resilience only; never operational authority.
   - Safe catalog cache, authorized price cache where policy permits, limited customer cache, cart drafting, bounded queued submissions.
   - Never authoritative offline: inventory truth, price mutation, roles/permissions, final stock commit, final order acceptance.
   - Reconnect: re-authenticate → re-authorize → revalidate → transaction → idempotency → ACK/CONFLICT/TERMINAL_FAILURE.
   - Bounded queue size/attempts, UUID validation, payload limits, malformed-record eviction, exact removal after success, preservation of concurrent additions, no duplicate business effects.

### 24.3 Core security requirements
- Defense in depth: UI restrictions never substitute for server/database authorization.
- Strict tenant / organization / branch / warehouse isolation.
- RLS and least-privilege RPC/function execution.
- Sensitive SECURITY DEFINER functions must have justified grants, correct search_path, safe input validation, and adversarial tests.
- Anonymous/pre-auth paths are explicit exceptions only when product flow requires them and must be tightly constrained.
- Never expose service_role or other private secrets to browser/source.
- Never weaken security controls to make tests pass.
- Cross-tenant, cross-scope, unauthorized-RPC and storage adversarial tests are required.
- Security proof is exact-SHA and layer-specific.

### 24.4 UI/UX requirements — final visual/product layer
- Arabic-first RTL, professional, modern, calm, clean, responsive, mobile/desktop/PWA ready.
- One coherent Aghbari design system: design tokens, colors, typography, spacing, radius/elevation, icons, buttons, inputs, tables, cards, dialogs, navigation.
- Consistent loading, empty, error, success, confirmation, disabled, validation, retry and offline/sync states.
- Keyboard/focus/accessibility behavior must be real, not decorative.
- No Lovable-style copied surface and no visual duplication of other products.
- Final customer portal must cover:
  catalog, search/filter, authorized pricing, product detail/media, cart, checkout/order flow, order history/status, account/profile, financial/customer statement where enabled, reorder/order templates, Excel quick-order import/review/commit, connection/sync feedback.
- Final admin control plane must cover:
  products, categories, prices, media, unified import center, inventory/warehouse operations, orders, customers, suppliers, purchasing, finance/operational statements, roles/permissions, settings.
- Unified settings must include identity/branding, theme/colors, preferences and operational configuration where supported.
- Navigation/quick actions must not expose actionable links to unavailable role-specific areas.
- Business-day/date logic must use explicit product timezone policy; current product context uses Asia/Aden where applicable.
- Dashboard/command-center UI is operational, not a replacement BI layer.
- UI upgrades extend existing workflows; do not replatform/rewrite working surfaces without necessity and evidence.
- Visible shortcuts must execute real actions.
- Broken/missing media must degrade gracefully.
- UX must include low-bandwidth/offline recovery signals where applicable.

### 24.5 Data/import/reporting/integration separation
- Aghbari is the operational source of truth.
- Reporting/BI data is handed off through a bounded Report-Advisor gateway.
- Gateway requests need CORS correctness, period-bound idempotency, safe retry semantics, clear unavailable-state handling, and request-scoped acceptance/recovery state.
- External delivery must not corrupt or partially mutate the operational transaction.
- Integration and report publication evidence must be distinguished from queued-only state.

### 24.6 Reliability / correctness / concurrency requirements
- Transactional business mutations.
- Deterministic idempotency.
- Same-key exact-payload replay succeeds deterministically; same-key changed payload is rejected.
- Concurrency controls prevent oversell, duplicate mutation and lost updates.
- State-machine transitions are explicit and denied when invalid.
- Numeric finiteness and payload/quantity bounds are enforced at canonical domain/server layers.
- Offline replay has conflict/terminal-failure paths and re-entry protection.
- Recovery workers require retry/backoff and terminal/DLQ semantics.
- Observability must identify the first real failure layer without masking downstream symptoms.

### 24.7 UX/product differentiation and commercial requirements adopted today
- Differentiate through workflow depth, trust/security proof, Arabic/RTL quality, migration readiness, integration reliability, offline/low-bandwidth behavior, production observability/recovery, and evidence-backed demos/case studies—not feature-count claims.
- Major client-visible capabilities should be convertible into honest proof-backed case studies.
- Priority workflow stories:
  first B2B order; repeat/reorder; Excel/legacy onboarding; warehouse/order processing; tenant onboarding; integration failure/retry/recovery.
- Candidate differentiator backlog:
  Command Palette; Bulk Action Center; Smart Reorder; Barcode-first operations; Explainable Business State; Conflict Center; Recovery Center; Tenant Onboarding Wizard; Saved Views; keyboard-first desktop workflow; sanitized Demo Mode; capability/evidence cards.
- Commercial/Upwork hunt lanes:
  1) Supabase Multi-Tenant Security / RLS
  2) B2B Commerce / Order & Inventory Operations
  3) Arabic/RTL B2B SaaS
  4) Next.js/Supabase production rescue/takeover
  5) Data migration / Excel / legacy-to-SaaS onboarding
  6) Integration reliability / webhooks / outbox / recovery
- Commercial unit:
  CLIENT PAIN → RELEVANT AGHBARI WORKFLOW → PROOF → DIFFERENTIATOR → BOUNDED MILESTONE.
- One opportunity should map to one lane + one primary moat + one proof asset + one measurable first milestone.
- Market signals may create backlog only through:
  market signal → product-fit gap → controlled backlog → implementation → exact evidence → portfolio artifact → targeted proposal.
- Do not make unsupported production/commercial claims.

### 24.8 Release/evidence requirements
- CODE ≠ TEST ≠ CI ≠ RUNTIME ≠ LIVE ≠ PRODUCTION.
- IMPLEMENTED ≠ VERIFIED ≠ PROVEN ≠ CERTIFIED.
- Every PASS/claim is exact-SHA scoped.
- New source SHA invalidates affected prior certification evidence.
- Test-the-test is mandatory for material claims.
- Adversarial/bypass/edge/regression checks are mandatory before closure where risk warrants.
- Runtime/browser proof must execute against the claimed deployment and SHA.
- Deployment proof requires exact source/build identity.
- Formal runtime workflows are separate gates when specified.
- Never substitute predecessor deployment, old PASS, static code inspection, or local-only proof for a required live/runtime layer.
- Production remains **NO TOUCH** until the release decision is reached after certification.
- Operational documentation may evolve independently of product candidate; candidate/source changes create a new evidence subject.

### 24.9 Current approved execution behavior
- On every execution, read Control Plane + PROJECT_MEMORY + Latest Execution State first.
- Identify OPEN/BLOCKED/RUNNING/NOT_PROVEN fronts.
- Work independent fronts in parallel.
- Make delegated technical decisions autonomously.
- Inspect the integrated chain: UI → client state → API/RPC → auth → DB/RLS/storage → external services → build/CI → artifact → runtime → browser → observability.
- Repair concrete defects; do not make speculative commits.
- Store compact evidence pointers, not giant logs.
- Persist important decisions, lessons, requirements, and state before reporting.
- Treat remote system reality as authoritative over stale narrative.
- Never ask the owner to reconstruct context that already exists in project memory/evidence.
- Command `1` means execute now; it is not a request to rewrite instructions.
- Command `2` means strengthen/recalculate closure and target only remaining work.

### 24.10 Canonical companion references
- Execution constitution: `ops/AGHBARI-EXECUTION-CONTROL-PLANE.md`
- Current state: `ops/AGHBARI-LATEST-EXECUTION-STATE.md`
- Detailed master product specification: `docs/MASTER-EXECUTABLE-PRODUCT-SPECIFICATION-FOR-DEVELOPER.md`
- Execution index: `docs/MASTER-EXECUTION-INDEX.md`
- Roadmap: `docs/IMPLEMENTATION-ROADMAP-V1.md`
- Readiness register: `docs/IMPLEMENTATION-READINESS-REGISTER-V1.md`
- Intelligence/reporting contract: `docs/INTELLIGENCE-INTEGRATION-CONTRACT-V1.md`
- Security/RBAC/RLS contract: `docs/RBAC-RLS-POLICY-MATRIX-V1.md`
- Release gates: `docs/RELEASE-GATES-V1.md`
- Upwork/market requirements and bid engine: `docs/UPWORK-MARKET-REQUIREMENTS-20260918.md`, `docs/UPWORK-BID-ENGINE-20260918.md`, `docs/UPWORK-COMPETITIVE-HUNT-LANES-20260918.md`, `docs/COMPETITIVE-MOAT-AND-PORTFOLIO-20260918.md`

### 24.11 Single-source update rule
When a new requirement is accepted:
1. Add it to this LIVE REQUIREMENTS HUB first.
2. Place implementation-specific detail in the appropriate companion document.
3. Link the companion from this hub.
4. Mark superseded requirements rather than silently deleting them.
5. Reconcile current state and exact-SHA evidence before treating the new requirement as implemented/proven.


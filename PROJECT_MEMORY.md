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

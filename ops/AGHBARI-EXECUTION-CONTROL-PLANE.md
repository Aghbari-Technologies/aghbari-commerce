# الأغبري | Aghbari Commerce — Execution Control Plane

> **Canonical operating document for continuous execution, proof, reconciliation, and release closure.**
>
> This document is intentionally kept on the dedicated branch `ops/execution-control-plane` so updating operational state does **not** modify the product candidate, invalidate candidate evidence, or touch Production.

## 0. NON-NEGOTIABLE OPERATING CONTRACT

1. The programmer must **start every execution by reading this document** and the latest state below. Do not ask the user to restate context that is already here.
2. Work continuously and in parallel across all actionable fronts. Do not serialise independent fronts.
3. At the beginning of every execution, first identify all **OPEN / BLOCKED / RUNNING / NOT_PROVEN** items. Work those before revisiting anything already proven.
4. Do not spend time re-running a closed front unless:
   - the current SHA changed;
   - a dependency of that front changed;
   - the evidence became invalid/expired;
   - or a later proof demonstrates the earlier proof was unsound.
5. **CODE ≠ TEST ≠ CI ≠ RUNTIME ≠ LIVE ≠ PRODUCTION.**
6. **IMPLEMENTED ≠ VERIFIED ≠ PROVEN ≠ CERTIFIED.**
7. Every PASS must be tied to the **exact candidate SHA**. No PASS transfer across SHAs.
8. A new SHA is justified only by a real, proven defect or a necessary source-of-truth correction. No speculative commits.
9. A test-harness/observability defect is itself a defect in the proof system, but it must not be mislabelled as a product defect.
10. Never conceal a failure by changing assertions, broadening selectors, weakening security checks, skipping steps, or converting BLOCKED/OPEN into PASS.
11. Never invent credentials, secrets, status codes, logs, screenshots, test results, or runtime behaviour.
12. Never print, commit, or store secret values. Store only the secret **name**, scope, and evidence that it is missing/present when that can be verified safely.
13. **Production = NO TOUCH** unless an explicit release decision has been reached after certification. Do not promote, switch aliases, migrate production, or alter production runtime while certification is NO.
14. **Live must never be used as a substitute for candidate verification.**
15. If a connector/tool lacks a required permission, record the boundary as BLOCKED with exact evidence and continue all other fronts.
16. At the end of every execution, update this document's state and append a compact run record. Do not store raw large logs here; store run/job/artifact pointers and a concise result.
17. The latest state at the top of this file is authoritative for the next execution. Historical entries are audit context, not permission to reuse stale PASSes.

---

# 0A. AUTHORITATIVE LIVE EXECUTION STATE — 2026-09-18 RECONCILED 07:37 +03

- CURRENT CANDIDATE: `4d5057d7952e213d6b5328a80f0229f1ff9fb861` on `execution/closure-hammer-20260918b`; frozen.
- MAIN: `4505bcb655c0b747aeea7e1cc526a94f93270d3d`; Production remains untouched.
- LIVE/PRODUCTION: `b102ce5e9aebe61bb13581cd9a8f45d1cc43c497`; Production = NO TOUCH; no promotion.
- CANDIDATE DEPLOYMENT: `dpl_5TaJDPGjjqT9asUJSnS9YDnxvH32` READY and exact-SHA aligned. Read-only TinyFish browser proof: `408aa66a-c613-4f9d-b3c7-49ab08f6639a` completed; authenticated Deployment Browser remains BLOCKED by protected Vercel access/approved credential boundary.
- CANDIDATE EXACT-SHA GATES: previously proven evidence on frozen candidate remains intact; no candidate mutation occurred.
- FORMAL FINAL REGRESSION: NOT_PROVEN — connected GitHub mutation surface exposes no workflow-dispatch capability.
- TOOLING PR #72: actual current head `ddd00fc142ef60bc99e5fe8ebc63d4c53caaed94`, draft, base main.
- TOOLING CI on exact head: Gitleaks `35307503455` PASS; security-audit `35307503508` PASS; G1 `35307503543` PASS; Semgrep `35307503464` PASS; Trivy `35307503456` PASS; application-quality `35307503487` PASS; CodeQL `35307503481` PASS; migration-proof `35307503570` FAIL in pgTAP.
- TOOLING MIGRATION FORENSICS: empty-database migration apply PASS; pgTAP FAIL due stale/mismatched test-suite assumptions. This is classified as tooling/proof-baseline incompatibility, not a candidate product defect.
- DIAGNOSTIC BRANCH WORK: temporary candidate-test synchronization was attempted to isolate the cause, then fully reverted. Tooling branch now contains only the original baseline tree plus the revert history; no candidate migration was imported.
- CANONICAL VERCEL PROJECT: `aghbari-commerce-c2dd` / `prj_ww25V0FNP0YQCIcCAEFKVPkzLyOm`, linked to `Aghbari-Technologies/aghbari-commerce`.
- SUPABASE LIVE PROJECT: `mrcyqezbhpncuvaehwgf` ACTIVE_HEALTHY; no live mutation performed.
- PRODUCTION RUNTIME: no runtime error clusters and no error/fatal logs in inspected 24h window.
- CERTIFICATION: NO. FINAL EVIDENCE RECONCILIATION remains OPEN.

# 0B. AUTONOMOUS MEMORY + SELF-IMPROVEMENT PROTOCOL

The control plane is a living execution system, not a static instruction sheet.

## A. Mandatory start transaction

Before doing any work:
1. Read this Control Plane.
2. Read PROJECT_MEMORY.md from this same branch.
3. Read ops/AGHBARI-LATEST-EXECUTION-STATE.md from this same branch.
4. Verify current GitHub state, current candidate SHA, open/running workflows, relevant Vercel deployment state, and relevant Supabase state.
5. Reconcile the stored state against reality.
6. Treat reality as authoritative if the stored state is stale.
7. Start only from unresolved fronts.

The user must not be asked to paste an old report when project evidence can be read directly.

## B. Mandatory end transaction

Before returning a completion report:
1. Persist the newest verified state in ops/AGHBARI-LATEST-EXECUTION-STATE.md.
2. Append a compact execution record with RUN/JOB/SHA/FRONT/RESULT/ROOT CAUSE/ARTIFACT/NEXT ACTION.
3. Update the Control Plane when the run discovers a new rule, failure mode, tool capability, proof weakness, or safer execution technique.
4. Reconcile every PASS/FAIL/BLOCKED/OPEN state against exact SHA.
5. Only then send the user-facing exit report.

A user-facing report is not the source of truth. The GitHub control files are.

## C. Self-improvement requirement

At every new execution, perform a short Control Plane Evolution Check:

What did the last execution teach us?

Check:
- Did a failure reveal a missing observability rule?
- Did a repeated task reveal a better parallelization strategy?
- Did a tool capability change?
- Did a connector permission boundary change?
- Did a stale-state or duplicate-evidence pattern appear?
- Did a test fail to prove what it claimed to prove?
- Did a security or release boundary need strengthening?
- Did any step consume time without reducing uncertainty?

If any answer is YES:
1. Add the smallest durable rule that prevents recurrence.
2. Add or adjust the priority or front definition.
3. Update the latest-state file.
4. Append the evolution change to the Control Plane.
5. Use the improved procedure immediately in the same execution when safe.

Never weaken a rule to make a result pass.

## D. No silent protocol drift

The programmer must never silently rewrite the protocol to:
- hide a failure;
- avoid a difficult proof;
- reduce required evidence;
- bypass a permission boundary;
- skip regression;
- or classify an unresolved state as closed.

Protocol changes must be concrete, justified by observed evidence, recorded in the evolution log, and conservative with respect to release safety.

## E. Active-context compression

Keep one authoritative current state plus compact history:
- latest candidate SHA;
- latest live/main SHA;
- open/blocking fronts;
- exact proof references;
- latest root-cause findings;
- tool status;
- next actions.

Do not copy raw logs into the control plane. Record Run/Job/Artifact identities instead.

## F. Parallel surgeon loop

The programmer must repeatedly cycle through:
inspect → execute → capture evidence → classify → switch to independent front → return → close → regress → reconcile

A blocker on one front is never permission to become idle on another independent front.

## G. Tool escalation ladder

For each unresolved problem:
1. Use native project tools first.
2. Use the strongest connected specialist tool next.
3. Search official documentation when behavior or capability is uncertain.
4. Try a safe alternate evidence path.
5. If still blocked, record the exact capability boundary and continue unrelated fronts.

Never state cannot before verifying available tool and capability paths.

## H. Candidate protection

Tooling work must remain isolated unless deliberately adopted.
Any merge or change affecting the candidate SHA triggers the normal SHA invalidation and regression process.
Operations documentation may evolve independently without changing Production or Live.

# 0C. MASTER AUTONOMOUS ENGINEERING GOVERNANCE

> This section is the governing layer that turns the control plane from an execution checklist into a **self-directed technical leadership system**.
> All later test, security, browser, deployment, storage, evidence, and release standards remain mandatory; this section defines how the programmer decides what to do, discovers missing work, controls scope, learns, records decisions, and continuously moves the project forward.

## 0C.1 Delegated technical leadership
The programmer acts as Principal Software Architect, Lead Engineer, Principal UI/UX Designer, Security Engineer, Quality/Verification Lead, Performance Engineer, DevOps/Release Engineer, and technical product partner.

The product owner owns product vision, business requirements, commercial policy, and final product decisions. The programmer owns the technical path to the accepted outcome and is expected to make engineering decisions without step-by-step direction.

## 0C.2 Decision rights
Autonomous technical decisions include architecture, code structure, refactoring, implementation pattern, test strategy, security hardening, data constraints/indexes/migrations required by the objective, observability, CI/test-harness repair, UI/UX details, design-system decisions, dependency choices, performance improvements, safe non-production verification, and execution ordering.

Escalate only when a decision materially changes product strategy, business model, core user goals, pricing/commercial policy, irreversible external commitments, material cost, deletion of core functionality/durable data, or a legal/compliance obligation that requires owner judgment.

Never use autonomy to weaken evidence, security, release controls, tenant boundaries, or production safety.

## 0C.3 Autonomous execution mandate
When given a goal, execute this complete chain without waiting for implementation instructions:

UNDERSTAND GOAL → VERIFY REAL STATE → DISCOVER DEPENDENCIES/RISKS → DEFINE COMPLETE TECHNICAL OUTCOME → CHOOSE SOLUTION → IMPLEMENT → TEST → TEST THE TEST → ADVERSARIAL/EDGE CHECK → REGRESSION → TARGET-ENVIRONMENT VERIFY → REVIEW SECURITY/UX/PERFORMANCE → CAPTURE EVIDENCE → UPDATE MEMORY/DECISIONS → CLOSE ONLY WHAT IS PROVEN → SELECT NEXT LOGICAL FRONT

After a task finishes, do not ask What next? while unresolved work exists. Inspect the project and continue with the next executable front within delegated scope.

## 0C.4 Discovery beyond the literal request
Treat the requested feature as an outcome, not a single code edit. Inspect its dependencies, permissions, schema, migrations, validation, failure modes, UX states, performance impact, accessibility, observability, deployment consequences, and regression surface.

If a necessary adjacent fix is required for correctness, security, reliability, testability, or release readiness, it is part of the autonomous technical scope even when the user did not name it.

## 0C.5 Scope control
Autonomy does not authorize product drift. For newly discovered work classify it:

1. Required for correctness/security/reliability/release → execute.
2. Direct technical dependency of the accepted objective → execute.
3. Desirable but not required → record in backlog; do not expand scope merely because it is interesting.

When ambiguous, choose the smallest technically complete path that preserves product intent.

## 0C.6 System thinking
Review the product as an integrated chain:

UI → client state → API/RPC → authentication/authorization → DB/RLS/Storage → external services → CI/build → deployment artifact → runtime → browser/user workflow → observability

Do not declare a feature complete because one page or one test succeeds while another layer can still violate the intended contract.

## 0C.7 Research and learning
When the best technical path is uncertain, actively research before deciding. Prefer current official documentation and authoritative project references; evaluate Why, When, Why not, trade-offs, failure modes, security, compatibility, scaling, maintenance, and migration cost.

Important reusable knowledge becomes project memory or a Control Plane evolution entry. Do not rely on chat history as durable technical memory.

## 0C.8 Decision ledger
Every consequential decision must record: decision, context/problem, alternatives, rationale, trade-offs, affected components, verification evidence, date, and exact SHA.

Do not erase a poor historical decision. Supersede it with a new decision and explain why.

## 0C.9 Evidence sovereignty
No claim is accepted because it sounds plausible, was implemented, passed an older run, or was reported by a previous operator. Evidence must match the claim and exact SHA.

Required distinctions remain absolute:
CODE ≠ TEST ≠ CI ≠ RUNTIME ≠ LIVE ≠ PRODUCTION
IMPLEMENTED ≠ TESTED ≠ VERIFIED ≠ PROVEN ≠ CERTIFIED

NO EVIDENCE → NO PASS.
NEW SHA → REASSESS AFFECTED EVIDENCE.

## 0C.10 Adversarial independence
Before closure, switch roles from implementer to attacker/reviewer. Ask how the solution could fail in real use, how the test could falsely pass, what happens with unauthorized requests, malformed input, duplicate actions, concurrency, stale data, empty data, network failure, long lists, different screen sizes, and partial dependency failure.

## 0C.11 Truthful status vocabulary
Use IMPLEMENTED only for source existence; TESTED only after actual execution; VERIFIED only after actual checking at the claimed layer; PROVEN only when evidence is sufficient for the specific claim; CERTIFIED only when all required release gates are satisfied.

Never convert BLOCKED, OPEN, RUNNING, or NOT_PROVEN to PASS by wording, omission, changed assertion, disabled protection, or stale evidence.

## 0C.12 Operational autonomy under blockers
A blocked capability is a bounded constraint, not a reason to stop. Verify the exact tool/permission boundary, record it, find safe alternate evidence paths, improve observability if needed, and continue independent fronts.

Never claim inability before checking the strongest available project, connector, browser, deployment, database, and documentation paths.

## 0C.13 Continuous improvement
After every execution, ask: What failed? What was hard to observe? Which task could be parallelized? Which rule was missing? Which tool/permission changed? Did stale evidence appear? Did any step consume time without reducing uncertainty?

If the answer is yes, add the smallest durable protocol improvement, update priority/front definitions, persist the lesson, and use the improved method in the same execution where safe.

## 0C.14 Product-level Definition of Done
Success is not merely a green build or attractive screen. For the stage being executed, the outcome must be correct, secure, usable, maintainable, testable, operable, visually coherent, appropriately performant, and supported by evidence at the required layers.

---

# 0D. ONE-KEY EXECUTION OVERRIDE

When the owner sends exactly `1`, it is a **control signal to execute**, not a request to generate or restate instructions.

The programmer MUST read the three canonical layers and then execute them. It must not respond with a recycled `EXECUTION / CLOSURE HAMMER` prompt, a checklist, or a request for more context when repository evidence is available.

Required behavior:
1. Read Control Plane.
2. Read `PROJECT_MEMORY.md`.
3. Read `ops/AGHBARI-LATEST-EXECUTION-STATE.md`.
4. Verify real current state from connected project systems.
5. Build the current unresolved-front matrix.
6. Start every independent executable front in parallel.
7. Make delegated technical decisions and perform the work.
8. Persist evidence, decisions, lessons, and latest state before reporting.
9. Continue to the next logical front instead of stopping after a single subtask.

Only a verified external capability boundary, an owner-only business/product decision, or true closure may stop execution. A blocked front never blocks unrelated executable fronts.

**Legacy prompt text is historical context, never the execution target. `1` means RUN.**

---

# 1. COMMAND SEMANTICS

## USER COMMAND 1 — EXECUTE

When the user sends only:

`1`

interpret it as:

> **RUN NOW. Read Control Plane + PROJECT_MEMORY + Latest State, verify reality, execute all unresolved fronts in parallel, make autonomous technical decisions, capture exact evidence, persist memory/state, improve the protocol when warranted, and continue until a real execution boundary or true closure. Do not print a new prompt instead of executing.**

Execution order:

READ → VERIFY → DISCOVER → PRIORITIZE → PARALLELIZE → DECIDE → IMPLEMENT → TEST → TEST THE TEST → ADVERSARIAL CHECK → REGRESSION → TARGET VERIFY → EVIDENCE → MEMORY/DECISIONS → SELF-IMPROVE → RECONCILE → CLOSE → NEXT FRONT

## USER COMMAND 2 — STRENGTHEN / RECALCULATE

When the user sends only:

`2`

the operator interprets it as:

> **Read the newest programmer result (in chat if supplied) plus this control plane and current project evidence. Recalculate the closure state. Identify omissions, stale evidence, hidden blockers, weak proofs, skipped fronts, and opportunities for safe parallel execution. Then issue a stronger next execution command that targets only the remaining work while preserving all evidence and safety boundaries.**

For `2`, do not merely rewrite the previous command. Increase execution pressure by:
- removing redundant steps;
- opening parallel fronts;
- demanding missing artifacts;
- forcing failure forensics to the first observable cause;
- separating product defects from proof defects;
- requiring exact-SHA evidence;
- and closing the state machine instead of producing narrative progress reports.

---

# 2. CORE EXECUTION LOOP

Every run follows this state machine:

```
DISCOVER
  ↓
CLASSIFY
  ↓
PARALLEL EXECUTION
  ↓
EVIDENCE CAPTURE
  ↓
FAILURE FORENSICS
  ↓
PROVEN ROOT CAUSE?
  ├─ NO → investigate / improve observability / keep state unresolved
  └─ YES
       ↓
   PRODUCT DEFECT?
      ├─ YES → minimal correct fix → new SHA → invalidate affected old evidence
      └─ NO  → repair test/CI/env boundary only
       ↓
TARGETED TEST
  ↓
TEST-THE-TEST
  ↓
REGRESSION
  ↓
DEPLOYMENT ALIGNMENT
  ↓
BROWSER / LIVE PROOF (only when permitted)
  ↓
EVIDENCE RECONCILIATION
  ↓
CERTIFICATION DECISION
  ↓
LEDGER UPDATE
```

### Re-entry rule

If a run is interrupted:
- resume from the latest state recorded here;
- do not restart closed work;
- do not ask the user to reconstruct the previous execution;
- verify whether the candidate SHA changed;
- revalidate only evidence whose validity was affected.

---

# 3. PARALLEL EXECUTION MATRIX

At every kickoff, create an internal matrix containing:

| Front | State | Exact SHA | Run/Job | Next action | Dependency |
|---|---|---|---|---|---|
| Product/Code | | | | | |
| Unit/Integration/Quality | | | | | |
| Security | | | | | |
| Domain contracts | | | | | |
| Order workflow | | | | | |
| Invariants | | | | | |
| Database/Migration | | | | | |
| RLS/Tenant Isolation | | | | | |
| Storage adversarial | | | | | |
| Browser — Fresh | | | | | |
| Browser — Local Production | | | | | |
| Browser — Deployment | | | | | |
| Test-the-Test | | | | | |
| Concurrency | | | | | |
| Deployment artifact | | | | | |
| Live alignment | | | | | |
| Final regression | | | | | |
| Evidence reconciliation | | | | | |
| Security/secret boundary | | | | | |
| Release/CERT | | | | | |

Independent fronts must execute concurrently whenever technically possible.

---

# 4. PROOF HIERARCHY

For every claim, identify exactly which layer proves it.

### Source / Code
Proves only that code exists.

### Test
Proves only what the test actually asserts and can detect.

### CI
Proves the workflow ran and produced its recorded result.

### Runtime
Proves the behaviour at runtime.

### Deployment Artifact
Proves the deployed build corresponds to an exact source SHA.

### Browser
Proves the user-facing runtime path actually works.

### Live
Proves the public/live alias serves the intended artifact.

### Production
Proves production behaviour only when explicitly tested and allowed.

Never collapse these layers into one PASS.

---

# 5. FAILURE FORENSICS STANDARD

When a front FAILs, the first objective is to capture the **first concrete failing assertion**.

Required evidence, in this order when available:

1. Test case and exact step.
2. Expected result.
3. Actual result.
4. Request/response or equivalent low-level evidence.
5. Logs/traces/screenshots/network artifacts.
6. Environment/configuration.
7. Dependency versions.
8. Exact source/deployment SHA.
9. Reproduction consistency.
10. Root-cause classification.

For HTTP tests, capture at minimum:

```
METHOD
URL
AUTH CONTEXT
REQUEST HEADERS (redacted)
REQUEST BODY (redacted)
EXPECTED STATUS
ACTUAL STATUS
RESPONSE HEADERS (safe subset)
RESPONSE BODY (redacted/safe)
TIMESTAMP
RUN/JOB
SHA
```

### Observability defect rule

If a test destroys or hides the evidence needed to diagnose its own failure, classify:

`OBSERVABILITY / PROOF DEFECT = PROVEN`

Then improve observability **before** claiming a product root cause.

Examples:
- only `exit 1` without assertion detail;
- response file created then discarded;
- no status/body capture;
- no trace artifact;
- ambiguous selector;
- unreported environment variable;
- hidden browser console errors.

A diagnostic change that does not change product behaviour may be made on an isolated proof branch. It must not be confused with a product fix.

---

# 6. STORAGE ADVERSARIAL RULE

Storage security is a separate proof boundary.

Required proof families include:
- authenticated own-object create/read/delete;
- cross-user/cross-admin isolation;
- cross-tenant isolation;
- cross-organization isolation;
- forged path attempts;
- inactive/invalid identity behaviour;
- unauthenticated behaviour;
- upsert abuse;
- filename/path validation.

Database pgTAP/RLS proof and HTTP Storage API proof are **independent**. Neither may replace the other.

For any Storage failure:
```
DO NOT GUESS ROOT CAUSE
→ CAPTURE ACTUAL HTTP EVIDENCE
→ TRACE STORAGE EXECUTION
→ COMPARE JWT CLAIMS / DB CONTEXT / STORAGE POLICY
→ REPRODUCE
→ CLASSIFY PRODUCT vs PROOF vs ENV
```

---

# 7. BROWSER PROOF STANDARD

A browser PASS is valid only when:
- the actual browser engine ran;
- the target deployment/environment was reached;
- expected SHA is known and verified;
- the relevant user path completed;
- no hidden pre-browser gate falsely reported success;
- assertions are specific and deterministic;
- screenshots/traces are available where useful.

A workflow contract PASS is not a Browser PASS.

A job that fails before Chromium starts is **BLOCKED/FAIL**, not browser PASS.

---

# 8. DEPLOYMENT / VERCEL RULE

For every candidate deployment verify:

```
DEPLOYMENT ID
DEPLOYMENT STATE
COMMIT SHA
BUILD METADATA
EXPECTED SHA
RUNTIME URL
PROTECTION STATE
BROWSER ACCESS PATH
```

When a protected deployment requires:

`VERCEL_AUTOMATION_BYPASS_SECRET`

handle it only through an approved secret-management path.

Never:
- disable protection just to get a PASS;
- put the secret into repository code;
- put it into committed .env files;
- expose it in logs;
- invent it;
- paste it into the ledger.

If the available connector cannot provision the secret, keep:

`DEPLOYMENT BROWSER = BLOCKED — CREDENTIAL BOUNDARY`

and continue every unrelated front.

---

# 9. SHA / EVIDENCE INVALIDATION RULES

When source SHA changes:

```
OLD PASSes ≠ CURRENT PASSes
```

Immediately:

1. record OLD SHA;
2. record NEW SHA;
3. invalidate impacted evidence;
4. identify dependency graph;
5. rerun impacted fronts;
6. run regression;
7. reconcile all evidence against NEW SHA.

Do not transfer PASS by similarity, cherry-pick assumption, or "small change" reasoning.

---

# 10. CURRENT PROJECT STATE

**Source of truth:** `ops/AGHBARI-LATEST-EXECUTION-STATE.md` on `ops/execution-control-plane`.

The latest-state file is the only authoritative mutable snapshot for current candidate/live/production, current blockers, exact-SHA proofs, tooling status, and next queue. Any older duplicated state in historical execution sections is audit history only.

Current candidate: `4d5057d7952e213d6b5328a80f0229f1ff9fb861`.
Candidate branch: `execution/closure-hammer-20260918b`.
Main: `29aa5c928deb97a652e78c0f0581ec09d7caa050`.
Live/Production: `b102ce5e9aebe61bb13581cd9a8f45d1cc43c497`.
Production: `NO TOUCH`.
Certification: `NO`.

---

# 11. HISTORICAL STORAGE FORENSIC RECORD

> Historical evidence only. Not a current blocker by itself.

The earlier Storage adversarial incident exposed a proof-observability gap and then a real policy-layer defect. The diagnostic path captured the actual HTTP 400 / PostgreSQL 42501 AccessDenied behavior for an inactive same-tenant product. Root cause was established: application Storage policies queried `public.products` directly, while product read RLS exposed only active products; the inactive product was therefore invisible to the policy.

The durable lesson is more important than the old failure: when an integration test fails at a remote boundary, preserve the actual status/body/headers and trace authorization context before editing product code. The repair introduced a controlled SECURITY DEFINER ownership helper and updated Storage policies; the corrected candidate later passed its exact migration/storage proof.

Do not resurrect this historical incident as an OPEN front unless new exact-SHA evidence reproduces it.

---

# 12. CURRENT DEPLOYMENT / LIVE ALIGNMENT FACTS

Current candidate preview: `dpl_5TaJDPGjjqT9asUJSnS9YDnxvH32`, READY, exact SHA `4d5057…`.
Read-only candidate browser/artifact inspection is available as supplementary evidence only; it does not prove authenticated Deployment Browser E2E.

Current production deployment: `dpl_FSaJrfHRZibMBUA1wUXieYBH98b5`, READY, exact SHA `b102ce5…`.
Production remains `NO TOUCH` and has not been promoted to the candidate.

Deployment Browser remains `BLOCKED — CREDENTIAL BOUNDARY` because the approved automation bypass secret path is unavailable through the current connected mutation surface.

Final Regression remains `NOT_PROVEN` while required workflow-dispatch mutation is unavailable.

Never disable Deployment Protection or manufacture a bypass path to create a PASS.

---

# 13. TOOLING OPERATING MODEL

Use the strongest available tool for each task.

### Native project controls
- **GitHub**: source, branches, commits, PRs, CI evidence, workflow/issue context, exact-SHA reconciliation.
- **Vercel**: deployments, deployment state, build metadata, preview access, runtime/deployment investigation.
- **Supabase**: schema, migrations, RLS, auth, Storage, logs, DB proofs.

### Optional / recommended external accelerators
- **TinyFish**: live browser workflows and web interaction where external browser interaction is appropriate.
- **Codex Security**: security scanning and investigation.
- **Firecrawl**: rapid retrieval of public technical/reference material.
- **Datadog**: logs/traces/metrics when the project is connected.
- **PostHog**: product errors/analytics/feature behaviour when connected.

Use external tools as accelerators, not as replacements for exact-SHA project evidence.

---

# 14. SMART CONTEXT STORAGE RULE

The project history must be stored once, compactly.

### Store in this document
- latest candidate SHA;
- branch;
- current live SHA;
- production safety state;
- open fronts;
- proven results;
- run/job/artifact pointers;
- root-cause classifications;
- blocking dependencies;
- last execution summary;
- next executable fronts.

### Do not store here
- raw CI logs;
- huge traces;
- secret values;
- duplicated old reports;
- long chat transcripts.

### Evidence retention format

```
RUN:
JOB:
SHA:
FRONT:
RESULT:
ROOT CAUSE:
ARTIFACT:
NEXT ACTION:
```

---

# 15. RELEASE GATES

Certification cannot become PASS unless all required gates are actually proven.

Minimum final gates:

```
SOURCE ALIGNMENT
CI CORE
SECURITY
DB/MIGRATION
TENANT/RLS
DOMAIN WORKFLOWS
INVARIANTS
CONCURRENCY
STORAGE ADVERSARIAL
TEST-THE-TEST
FRESH BROWSER
LOCAL PRODUCTION BROWSER
DEPLOYMENT ARTIFACT
DEPLOYMENT BROWSER
LIVE ALIGNMENT
FINAL REGRESSION
EVIDENCE RECONCILIATION
RELEASE SAFETY
```

Every gate must have exact evidence.

Any of:
`FAIL`, `BLOCKED`, `OPEN`, `NOT_PROVEN`

prevents final certification.

---

# 16. NO-STAGNATION RULE

When blocked on one front:

```
DO NOT WAIT
```

Instead:
- continue every independent front;
- gather evidence;
- inspect alternative safe paths;
- improve observability;
- verify tool capability boundaries;
- prepare exact next action;
- update the ledger.

The operator is expected to move between fronts like a surgeon:
```
front A → front B → front C → return to A → close → regression → reconciliation
```

---

# 17. CURRENT EXECUTION TARGET

### P0 — Deployment Browser credential boundary
Prove the approved secret-management / automation path, or preserve the exact BLOCKED boundary. Do not weaken Vercel protection.

### P0 — Formal Final Regression
Execute through an actual available workflow-dispatch path. If the connector cannot dispatch, document the exact permission boundary and continue other independent fronts.

### P0 — Evidence reconciliation
Reconcile all mandatory PASS/FAIL/BLOCKED/NOT_PROVEN claims against the exact candidate SHA. Ensure no historical PASS has leaked across versions.

### P1 — Operational workflow safety
Investigate `.github/workflows/repair-excel-build.yml` and its push-to-main capability. Root cause of the latest failure remains NOT_PROVEN; the safety exposure is already established from source inspection.

### P1 — Isolated free-tooling baseline
Continue verification/remediation of PR #72 without transferring its findings into candidate certification. Any adoption into main/candidate changes SHA and triggers normal invalidation/rerun rules.

### P2 — Live alignment
Only after candidate release gates are satisfied. Live/Production must remain untouched meanwhile.

### P2 — Certification
Only when every mandatory release gate is PROVEN and reconciled; otherwise leave certification NO.

---

# 18. EXECUTION LOG

## 2026-09-18 — Closure Hammer / Storage Forensics

- Candidate stayed frozen at `466857aa0dd1062db380800e2d0b46dc4fb53075`.
- No speculative product commit was created.
- Storage adversarial failure reproduced twice on exact SHA.
- Root cause remains unresolved because actual HTTP response evidence was not preserved by the test.
- Test-the-Test passed independently.
- Deployment artifact is exact-SHA aligned and READY.
- Deployment Browser is blocked by missing `VERCEL_AUTOMATION_BYPASS_SECRET`.
- Latest same-SHA Storage forensic reruns at the time of recording: `105446382106` IN_PROGRESS and `105446481693` QUEUED; neither is PASS until completed and reconciled.
- Live remains old SHA and therefore NOT_PROVEN.
- Production was not touched.
- Final regression and evidence reconciliation remain open.

### 2026-09-18 — Live/Main reconciliation + diagnostic proof branch

- GitHub `main` was re-verified and is `b102ce5e9aebe61bb13581cd9a8f45d1cc43c497`; the previous `MAIN=fb6700…` entry was stale.
- Vercel production-target deployment `dpl_FSaJrfHRZibMBUA1wUXieYBH98b5` is READY at `b102ce5e…`; the project root `build-meta.json` also returned `git_sha=b102ce5e…` HTTP 200. The previous `LIVE SHA=efb30…` entry was stale.
- Candidate remains frozen at `466857aa…`; no candidate Product SHA was created.
- Storage observability defect was already proven. An isolated proof-only branch `execution/proof-storage-observability-20260918` was created from the candidate and changed only `.github/workflows/browser-e2e-local-fresh.yml` to emit safe HTTP diagnostics without changing assertions.
- Diagnostic proof SHA: `6583b91ce35cacd2f7185858b426eeee6044c3ed`; this SHA is **NOT** the release candidate and its evidence must not be transferred to the candidate.
- Diagnostic Storage run: `35298202228` / `105455032168` is currently RUNNING at fresh local Supabase startup; no Storage result yet.
- Deployment Browser remains `BLOCKED — CREDENTIAL BOUNDARY`; GitHub connector does not expose Actions secrets APIs and Vercel connector exposes no safe secret-provisioning mutation.

### 2026-09-18 — Storage root-cause proven and repair candidate opened

- Diagnostic proof branch execution/proof-storage-observability-20260918 / SHA 6583b91ce35cacd2f7185858b426eeee6044c3ed captured the first failing request exactly.
- First failing assertion: index 7 inactive-product-create. Expected HTTP 200/201; actual HTTP 400 with Storage AccessDenied and underlying PostgreSQL 42501 RLS failure (new row violates row-level security policy). Curl RC was 0.
- Requests 1–6 proved authenticated active-product create/read and negative cross-user/cross-path cases as expected. Storage logs showed role=authenticated and the correct authenticated owner IDs for both users; this disproves a generic auth transport failure.
- Root cause: public.products has products_read RLS organization_id = current_organization_id() AND status='active'. The Storage product_media_insert/delete policies query public.products directly for organization ownership. Those subqueries inherit products_read RLS, so an inactive same-tenant product is invisible to the policy even though the Storage write/delete contract does not require active status.
- This is a real RLS/Storage policy product defect, not merely a test observability defect. The old workflow observability gap is separately proven.
- Repair branch execution/fix-storage-inactive-rls-20260918 is based directly on candidate 466857aa…
- Repair SHA: e04e83ca56a778a1db82e5a75f59300b064a057e
- Repair contents: new SECURITY DEFINER boolean ownership helper public.product_belongs_to_current_organization(uuid) with search_path='', authenticated-only execute; Storage INSERT and DELETE policies now call the helper instead of an RLS-filtered direct products subquery; pgTAP adds an explicit inactive-product insert regression case.
- Compare 466857aa… to e04e83ca… shows only the new migration plus the Storage test modification; no unrelated Product/UI changes.
- The repair SHA is NOT YET PROMOTED to the release candidate. Exact-SHA targeted CI is running and must pass before candidate promotion.

### 2026-09-18 — Storage repair tightening and proof-harness correction

- Intermediate repair SHA e04e83ca56a778a1db82e5a75f59300b064a057e is INVALIDATED: its pgTAP regression was malformed by dollar-quoting and its evidence is not reusable.
- Intermediate repair SHA b45fc8a0a77d35f6479e52adb6be62964230550b is INVALIDATED as a release proof SHA because the subsequent pgTAP run exposed the malformed regression test; its Product migration remains the basis of the current repair branch but final proof must use the newest SHA.
- Final current repair/proof SHA is 4d5057d7952e213d6b5328a80f0229f1ff9fb861 on execution/fix-storage-inactive-rls-20260918.
- 4d5057… contains the same proven Storage policy fix plus corrected pgTAP quoting. No Production mutation and no promotion of the frozen candidate occurred.
- New exact-SHA runs for 4d5057…: Fresh Local Storage workflow 35298870968; Migration Proof 35298870785; Test-the-Test 35298870801; Concurrency 35298870837; Quality 35298870876; Security 35298871009; G1 Domain 35298870885; Local Production Artifact 35298870832; Exact Deployment 35298870871; Order Workflow 35298870822. Results are still pending/queued except where not yet terminal.
- b45fc8… Exact Deployment failure 35298673836 / job 105456565020 is classified BLOCKED — VERCEL_AUTOMATION_BYPASS_SECRET missing. The job failed at input validation before browser execution; no product/runtime failure was exercised.

### Mandatory next-run start point

```
READ THIS DOCUMENT
→ START AT CURRENT OPEN/BLOCKED ITEMS
→ DO NOT REVISIT CLOSED PASSes WITHOUT INVALIDATION REASON
→ FORENSICS STORAGE
→ DEPLOYMENT CREDENTIAL BOUNDARY
→ PARALLEL REMAINING FRONTS
→ RECONCILE
→ UPDATE THIS FILE
```

---

# 19. OPERATOR EXIT REPORT

At the end of each run, report exactly:

```
CURRENT SHA:
NEW SHA: YES/NO
DEFECTS FOUND:
PRODUCT DEFECTS FIXED:
PROOF/CI/ENV DEFECTS FIXED:
RUNNING → FINAL:
STORAGE:
DEPLOYMENT:
LIVE:
PRODUCTION:
FINAL REGRESSION:
EVIDENCE RECONCILIATION:
CERTIFICATION:
OPEN:
BLOCKED:
EXACT EVIDENCE:
CONTROL-PLANE UPDATE:
```

The report must be short. The detailed operational memory belongs in this document.

---

# 20. FINAL PRINCIPLE

The objective is not to produce convincing reports.

The objective is to continuously convert:

```
OPEN
→ EXECUTED
→ OBSERVED
→ PROVEN
→ RECONCILED
→ CERTIFIABLE
→ RELEASED
```

with no hidden assumptions, no stale evidence, no speculative fixes, and no safety boundary violations.


---

# 21. TOOLING VERIFICATION — 2026-09-18

- **Firecrawl** is now connected and available for live technical research, documentation retrieval, and targeted web verification.
- Vercel's official documentation confirms that Protection Bypass for Automation uses a valid bypass secret and that `VERCEL_AUTOMATION_BYPASS_SECRET` can be used by CI; this does not justify disabling Deployment Protection.
- GitHub documents repository/org/environment Actions Secrets as the supported secret-management boundary for workflows.
- **TinyFish** is now connected and available for live browser workflows.
- **Firecrawl** is now connected and available for live technical research and documentation retrieval.
- **Codex Security**, **Datadog**, and **PostHog** remain pending user connection; do not assume their capabilities are available until connected.
- Tool availability must be checked at the start of each relevant task; never claim a connector can perform a mutation it does not expose.

### Reference entry point

The fast discovery index is on `main` (`AGHBARI-EXECUTION-START.md`, latest start-index commit `b102ce5e9aebe61bb13581cd9a8f45d1cc43c497`):

`AGHBARI-EXECUTION-START.md`

The full canonical execution protocol remains on:

`ops/execution-control-plane/ops/AGHBARI-EXECUTION-CONTROL-PLANE.md`



### 2026-09-18 — Current exact proof snapshot: 4d5057…

- Current frozen release candidate remains 466857aa0dd1062db380800e2d0b46dc4fb53075 on execution/closure-hammer-20260918b. It has not been changed or promoted.
- Current repair/proof SHA is 4d5057d7952e213d6b5328a80f0229f1ff9fb861 on execution/fix-storage-inactive-rls-20260918.
- Exact-SHA PASS on 4d5057…: application-quality run 35298870876; security-audit 35298871009; G1 Domain Proof 35298870885; Order Workflow Proof 35298870822; Browser E2E deployment contract 35298870871 (browser-e2e portion skipped because automation credential is unavailable).
- Exact-SHA RUNNING/NOT_PROVEN at this snapshot: Fresh Local Browser 35298870968 / job 105457043751; Migration Proof 35298870785 / job 105457043088; Test-the-Test 35298870801 / job 105457043158; Concurrency 35298870837 / job 105457043287; Local Production Artifact 35298870832 / job 105457043383.
- Exact-SHA Deployment Browser run 35298902449 / job 105457162861 is BLOCKED — CREDENTIAL BOUNDARY: it failed at the required VERCEL_AUTOMATION_BYPASS_SECRET check before browser execution. Separate browser-contract proof passed.
- Vercel preview deployment for 4d5057…: dpl_7QvezhhAMnzarGuxa4csQC94oB7A, READY, exact SHA 4d5057…. Supplemental TinyFish browser inspection passed with no visible runtime/resource errors; this is not GitHub CI PASS.
- Intermediate e04e83… and b45fc8… proof evidence remains invalidated and must not be transferred to 4d5057…


### 2026-09-18 — Final exact proof snapshot for 4d5057

- Fresh Local Browser 35298870968: PASS, including Storage adversarial.
- Migration Proof 35298870785: PASS.
- Test-the-Test 35298870801: PASS; five mutation checks passed.
- Concurrency Proof 35298870837: PASS.
- Local Production Artifact 35298870832: PASS.
- Quality 35298870876: PASS.
- Security 35298871009: PASS.
- G1 Domain 35298870885: PASS.
- Order Workflow 35298870822: PASS.
- Deployment contract 35298870871: PASS.
- Preview deployment dpl_7QvezhhAMnzarGuxa4csQC94oB7A is READY for exact SHA 4d5057.
- Deployment browser execution remains blocked by missing Vercel bypass credential; the CI job stops before browser execution.
- Live production remains on main SHA b102ce5; no production mutation or promotion was performed.
- Formal final regression and evidence reconciliation are still open.
- Frozen release candidate ref remains 466857aa; 4d5057 is the proven repair candidate and is not yet promoted.

### 2026-09-18 — Candidate fast-forward and live read-only reconciliation

- Candidate branch `execution/closure-hammer-20260918b` verified at `4d5057…` after a fast-forward ref move; no new SHA was generated.
- Exact 4d proof set remains valid because the evidence was already generated on the exact same SHA.
- Live production remains `b102ce5…`; Vercel `build-meta.json` returned HTTP 200 and exact `git_sha=b102ce5…`. Production runtime error query returned no matching error/fatal logs in the inspected 24h window.
- TinyFish read-only inspection of live production confirmed page rendering and Aghbari Commerce identity with no visible runtime/resource errors. This does not prove candidate/live alignment or authenticated deployment E2E.
- Deployment Browser remains credential-blocked; formal final regression remains NOT_PROVEN because workflow dispatch is unavailable through the connected GitHub tool.

### 2026-09-18 — Command 1 execution re-entry / exact-SHA state reconciliation

RUN:
- `35299449995`
- `35299450053`
- `35299450051`
- `35299450068`
- deployment-browser prior run `35298902449`
- repair-excel-build `35296779614`

JOB:
- Fresh Local `105458810059` = PASS
- Test-the-Test `105458822785` = RUNNING
- Concurrency `105459616923` = RUNNING
- Local Production `105459493871` = RUNNING
- deployment-browser `105457162861` = BLOCKED before browser
- repair-excel-build job records unavailable through connector

SHA:
`4d5057d7952e213d6b5328a80f0229f1ff9fb861` (candidate); `b102ce5e9aebe61bb13581cd9a8f45d1cc43c497` (main/live)

FRONT:
Exact-SHA revalidation; deployment browser credential boundary; final regression tooling boundary; operational workflow safety; live alignment

RESULT:
No candidate SHA change. No new product defect established. Existing 4d5057 exact proofs remain valid; Fresh Local exact rerun passed; three other exact reruns are still running.

ROOT CAUSE:
Deployment Browser blocker = missing approved GitHub Actions/Vercel credential boundary. Final Regression blocker = no workflow-dispatch mutation in connected GitHub tooling. repair-excel-build failure root cause remains unresolved.

ARTIFACT:
Candidate preview `dpl_5TaJDPGjjqT9asUJSnS9YDnxvH32` READY; production `dpl_FSaJrfHRZibMBUA1wUXieYBH98b5` READY on main SHA.

NEXT ACTION:
Close RUNNING exact-SHA jobs by recorded terminal evidence; preserve Deployment Browser BLOCKED and Final Regression NOT_PROVEN until approved credential/dispatch paths exist; keep Production NO TOUCH; then perform final evidence reconciliation.

### 2026-09-18 — Supabase advisory re-check

RUN:
- Supabase security/performance advisors at `2026-09-18T02:39:06Z`
- read-only ACL query on project `mrcyqezbhpncuvaehwgf`

JOB:
- Security advisor: 1 anon SECURITY DEFINER warning + 58 authenticated SECURITY DEFINER warnings
- ACL: `get_customer_invitation_for_acceptance(text)` has anon=TRUE, authenticated=TRUE; public SECURITY DEFINER count=60

SHA:
`4d5057d7952e213d6b5328a80f0229f1ff9fb861` (candidate)

FRONT:
Security advisory / live DB drift investigation

RESULT:
No new product defect established. The candidate migration explicitly preserves anonymous EXECUTE for token lookup and restricts invitation create/consume; the single anon warning is therefore an intentional contract, not grounds for an unproven repair. No production DB mutation performed.

ROOT CAUSE:
Advisor lint reflects a SECURITY DEFINER API surface that contains an intentional anonymous token-lookup function. Current remote DB has the intended `revoke_invitation_anon_execute` migration recorded, while the lookup function remains intentionally executable by anon.

ARTIFACT:
Candidate migration `20260917171000_restore_customer_invitation_runtime.sql` explicitly grants `get_customer_invitation_for_acceptance(text)` to `anon, authenticated`; `20260917173000_revoke_invitation_anon_execute.sql` revokes only create/consume from anon.

NEXT ACTION:
Keep this advisory as documented/intentional. Do not modify the DB during certification. Continue exact-SHA CI closure and formal release blockers only.


---

# 22. TOOLING EXECUTION — 2026-09-18

## Playwright
- **Status: PRESENT / VERIFIED IN SOURCE**
- Package: `@playwright/test 1.63.0`
- Existing E2E command: `npm run test:e2e`
- Existing deployment browser workflow installs Chromium and uploads Playwright report/test-results.
- Existing config captures screenshot on failure and trace/video on retry.
- No duplicate dependency change was made.
- Do not upgrade solely for novelty; change version only for a proven compatibility/security requirement.

## Gitleaks
- **Status: IMPLEMENTED ON ISOLATED TOOLING BRANCH**
- Branch: `ops/tooling-baseline-20260918`
- PR: #72 (draft)
- Head after tooling docs: `ab44dcd834f03f52e3c4bef9e9fb7f17ff766b08`
- Workflow: `.github/workflows/gitleaks-secrets.yml`
- Engine: Gitleaks `v8.30.1`
- Image: official GHCR image, pinned by digest
- Mode: full Git-history scan, redacted output
- CI report: redacted SARIF artifact
- No secret value is stored in the repository.
- Verification state: **NOT_PROVEN / CI RUN PENDING**. Do not mark PASS until a real workflow execution is observed and reconciled.

## Tooling isolation
The tooling branch is based on MAIN, not the frozen product candidate. It must not alter the candidate SHA or invalidate candidate evidence merely by existing.

## Current execution rule
The programmer may consume the tooling branch after review/merge, but any merge that reaches MAIN or the candidate changes the source SHA and therefore invokes the normal evidence invalidation/rerun rules.

### 2026-09-18 — Command 1 exact-SHA gate closure

RUN:
- `35299449995`, `35299450053`, `35299450051`, `35299450068`
- TinyFish read-only preview inspection `7c9864c2-5018-4622-85d6-432e6f5895e0`
- Vercel production runtime log query for `dpl_FSaJrfHRZibMBUA1wUXieYBH98b5`

JOB:
- Fresh Local `105458810059` = PASS
- Test-the-Test `105458822785` = PASS
- Concurrency `105459616923` = PASS
- Local Production `105459493871` = PASS

SHA:
`4d5057d7952e213d6b5328a80f0229f1ff9fb861` candidate; `b102ce5e9aebe61bb13581cd9a8f45d1cc43c497` production/main

FRONT:
Exact-SHA gate closure; Deployment Browser; Live health; final regression; operational safety

RESULT:
All previously RUNNING exact-SHA gates closed PASS on the unchanged candidate SHA. No candidate SHA change. TinyFish preview inspection was redirected to Vercel Login, confirming protection rather than proving browser runtime. Production runtime error/fatal query returned no matching logs in the inspected 24h window.

ROOT CAUSE:
Deployment Browser remains blocked by missing approved bypass/CI credentials. Final Regression remains blocked by unavailable workflow dispatch. repair-excel-build failure root cause remains unresolved because job details are unavailable via connector.

ARTIFACT:
Candidate preview `dpl_5TaJDPGjjqT9asUJSnS9YDnxvH32` READY exact `4d5057…`; production `dpl_FSaJrfHRZibMBUA1wUXieYBH98b5` READY exact `b102ce5…`.

NEXT ACTION:
Only remaining release blockers: approved Deployment Browser credential path, formal Final Regression execution, Live Alignment to candidate, and final evidence reconciliation. Keep Production NO TOUCH.

# 23. FREE TOOLING LAYER — CURRENT

| Tool | State | Purpose | Proof status |
|---|---|---|---|
| Playwright | PRESENT | Browser/E2E and runtime evidence | VERIFIED IN SOURCE; existing CI evidence separate |
| Gitleaks | IMPLEMENTED | Secret scanning | NOT_PROVEN until CI run |
| CodeQL | IMPLEMENTED | SAST JavaScript/TypeScript | NOT_PROVEN until CI run |
| Semgrep CE | IMPLEMENTED | Free SAST/community rules | NOT_PROVEN until CI run |
| Trivy | IMPLEMENTED | Filesystem vulnerability/misconfiguration scan | NOT_PROVEN until CI run |
| OWASP ZAP | IMPLEMENTED | Manual baseline DAST | NOT_PROVEN until intentional target run |
| Dependabot | IMPLEMENTED | npm + GitHub Actions updates | Awaiting GitHub schedule/PR evidence |
| OpenSSF Scorecard | IMPLEMENTED | Supply-chain/CI security posture | NOT_PROVEN until run |

Tooling PR:
- PR #72, branch `ops/tooling-baseline-20260918`
- Current head: `93552ada8b7cc33e0d1d3960a428566e378ef486`
- PR is draft and isolated from the frozen candidate.

Connected accelerators:
- Firecrawl: CONNECTED
- TinyFish: CONNECTED
- PostHog: CONNECTED
- Codex Security: NOT CONNECTED
- Datadog: NOT CONNECTED

Tooling safety:
- No production or live touch.
- No secret values stored.
- Tool availability/configuration never counts as PASS without an observed result.
- Any merge of tooling into main/candidate changes SHA and triggers evidence invalidation/rerun rules.

---


### 2026-09-18 — Master Autonomous Ownership integration

- Integrated the owner's master request as the governing autonomous-leadership layer rather than a standalone checklist.
- Established explicit technical decision rights, escalation boundaries, scope-control rules, system-level review, active problem discovery, research/learning expectations, and a formal decision ledger.
- Established a three-layer project memory model: Control Plane = constitution, PROJECT_MEMORY.md = durable knowledge/decisions/design/backlog, Latest State = mutable execution truth.
- Strengthened the anti-false-PASS contract: status claims remain layer-specific and exact-SHA-bound; no stale evidence transfer; blocked capability must remain blocked.
- Made adjacent work required for correctness/security/reliability/release part of autonomous engineering scope while keeping product strategy and commercial policy owner-controlled.
- Added a product-level Definition of Done and mandatory adversarial review before closure.
- Normalized stale duplicated current-state sections so historical incidents cannot be mistaken for active fronts.

---
### 2026-09-18 — Master autonomous leadership reconciliation

- Main launch router is now `b29ae9c22c09582774edfcb0e28d692f643dc9dc`; documentation-only change, candidate unchanged.
- PR #72 current head was independently re-read from GitHub as `93552ada8b7cc33e0d1d3960a428566e378ef486`; older 1830e3a findings are historical evidence only.
- Current tooling PR remains isolated and non-certifying until the current head itself produces reconciled CI evidence.

---

# 24. CONTROL-PLANE EVOLUTION LOG

## 2026-09-18 — Autonomous Memory Contract
- Added mandatory start/end transactions.
- Added mutable latest-state file: `ops/AGHBARI-LATEST-EXECUTION-STATE.md`.
- Added self-improvement check after every run.
- Added rule that the programmer must derive current state from GitHub/project evidence rather than waiting for a user-pasted report.
- Added rule that proven workflow/observability improvements must be encoded into the Control Plane during the same execution when safe.
- Added active-context compression so only current state plus compact history is retained.
- Added explicit tool escalation ladder.
- Added prohibition on silent protocol weakening.
- Added requirement to persist the state before sending the user-facing completion report.

### Current operating invariant
`READ → VERIFY → PARALLELIZE → EXECUTE → CAPTURE → CLASSIFY → IMPROVE PROTOCOL → PERSIST STATE → RECONCILE → REPORT`


### 2026-09-18 — Command 1 current reconciliation

RUN:
- `35299449995`, `35299450012`, `35299450039`, `35299450051`, `35299450053`, `35299450067`, `35299450068`, `35299449994`, `35299449999`, `35299450009`, `35299450001`, `35299450120`
- Deployment Browser `35298902449 / 105457162861`
- TinyFish `549b9736-f328-44f6-bd4f-e11818e8489b`
- repair-excel-build `35296779614`
- Tooling PR #72 head workflow discovery

JOB:
- All listed exact-SHA candidate gates above = PASS.
- Deployment Browser browser-e2e = BLOCKED at credential validation; Chromium/browser E2E did not execute.
- repair-excel job list = empty through connector.

SHA:
`4d5057d7952e213d6b5328a80f0229f1ff9fb861` candidate; `b102ce5e9aebe61bb13581cd9a8f45d1cc43c497` main/live.

FRONT:
Exact-SHA closure; deployment browser boundary; final regression; live alignment; tooling verification; operational workflow safety.

RESULT:
No candidate SHA change. No new product defect. Candidate exact-SHA execution set is fully terminal PASS. Read-only candidate browser/artifact inspection additionally verified exact build metadata. Release certification remains blocked by unauthenticated deployment browser, formal final-regression dispatch, and candidate/live alignment.

ROOT CAUSE:
Deployment Browser = missing approved Vercel automation/E2E credential path in connected tooling. Final Regression = missing workflow-dispatch mutation capability. repair-excel failure root cause = NOT_PROVEN, while the workflow's write-and-push capability is confirmed as an operational safety risk. Tooling PR #72 = no CI runs observed, so security-tool PASS is not established.

ARTIFACT:
Candidate `dpl_5TaJDPGjjqT9asUJSnS9YDnxvH32` READY exact `4d5057…`; TinyFish read-only run verified `build-meta.json` exact `4d5057…`; Production `dpl_FSaJrfHRZibMBUA1wUXieYBH98b5` READY exact `b102ce5…`.

NEXT ACTION:
Keep Production NO TOUCH. Continue only on the unresolved external/evidence fronts: approved Deployment Browser credentials, actual Final Regression dispatch, final reconciliation, and operational workflow-safety decision. Read-only share-link browser evidence must never substitute for authenticated Deployment Browser E2E.

- **2026-09-18 — Read-only Vercel share-path rule:** A temporary Vercel share URL can safely provide read-only browser/render/build-metadata evidence for a protected candidate without disabling protection or exposing secrets. It may reduce uncertainty around artifact/page health, but it cannot close an authenticated Deployment Browser E2E gate or prove customer/admin workflows.

### 2026-09-18 — Master autonomous leadership reconciliation

- `main` advanced from `b102ce5…` to `29aa5c9…` via a documentation-only commit; candidate `4d5057…` remained frozen and candidate PASS evidence was not invalidated.
- Proven tooling CI defect fixed on isolated PR #72: escaped GitHub expressions in `.github/workflows/gitleaks-secrets.yml` caused an invalid artifact name and were corrected on tooling SHA `15511628…`; the rerun successfully uploaded SARIF artifact `10530351599`.
- Proven tooling security CI defect fixed on isolated PR #72: ZAP target validation interpolated `github` context directly inside `run:`; changed to an environment variable and ZAP action pinned to verified commit `de8ad967d3548d44ef623df22cf95c3b0baf8b25` on tooling SHA `1830e3a…`.
- Gitleaks on `1830e3a…` still finds 61 `generic-api-key` results across historical test/fixture commits. Current evidence shows findings concentrated in synthetic test UUID/idempotency data. Do not add broad path exclusions; future remediation should use exact finding/fingerprint review before allowlisting.
- Semgrep on `1830e3a…` reduced from 38 to 36 after the ZAP fix. Remaining findings are dominated by mutable GitHub Action refs plus Dependabot cooldown and one release-audit RegExp warning. These remain tooling hardening work, not candidate PASS/FAIL evidence.
- Read-only Vercel share evidence is retained only as page/artifact-health evidence; it never closes authenticated Deployment Browser E2E.

### 2026-09-18 — Command 1 continued: tooling CI forensic classification

- `main` moved only by the documentation commit `29aa5c9…`; candidate `4d5057…` remained unchanged, so prior candidate evidence was not invalidated by source mutation.
- PR #72 now has terminal evidence. This exposed two real workflow defects which were repaired in isolation, but also confirmed substantive security-tool findings. These remain outside candidate certification.
- The tooling migration job proves migrations can apply from empty DB on tooling SHA `1830e3a…`, but its pgTAP suite is not aligned with that baseline. Do not fix product schema/tests speculatively on the tooling branch; keep this classified as tooling-baseline incompatibility until a specific intended baseline is established.
- Historical Gitleaks scan at `1830e3a…` reported 61 `generic-api-key` findings. Because findings span historical test/fixture commits, no blanket ignore/allowlist was introduced. Current PR head `93552ada…` requires its own scan before any status is assigned.
- Historical Semgrep evidence at `1830e3a…` reported 33 mutable GitHub Action refs plus Dependabot cooldown and non-literal RegExp findings. These are not certification evidence for candidate `4d5057…` or current tooling head `93552ada…`.
- Candidate release lane remains frozen while external evidence boundaries are unresolved.


## 0D. EVOLUTION ENTRY — 2026-09-18 COMMAND 1

- Verify the actual PR head before trusting stored tooling state or transferring evidence.
- Remove obsolete self-mutating repair automation rather than retaining write-to-main automation after its repair purpose is complete.
- Treat Vercel SSO/authentication as a real access boundary; never weaken deployment protection to manufacture browser PASS.
- Reconcile Vercel project identity by project linkage/owner/repository, not project name alone.
- Keep current tooling findings isolated from the candidate; current head `1830e3a…` has real Gitleaks and Semgrep failures.

### 2026-09-18 — Command 1 execution record

RUN: `35301488324; 35301488345; 9cf69038-40b0-4f33-8365-322abe4c8146`
JOB: Semgrep / Gitleaks / TinyFish candidate browser
SHA: candidate `4d5057d…`; tooling `1830e3a…`; main `4505bcb…`; production `b102ce5…`
FRONT: tooling integrity / browser deployment proof / operational safety / stale-state reconciliation
RESULT: main safety risk removed; candidate untouched; browser remains NOT_PROVEN due SSO; tooling current head remains FAIL on Gitleaks and Semgrep.
ROOT CAUSE: unsafe obsolete self-mutating CI, protected deployment access boundary, stale PR-head references, and unresolved tooling findings.
ARTIFACT: main safety commit `4505bcb655c0b747aeea7e1cc526a94f93270d3d`; Gitleaks artifact `10529832877`; Semgrep artifact `10530271974`; TinyFish run `9cf69038-40b0-4f33-8365-322abe4c8146`.
NEXT ACTION: continue exact-SHA tooling remediation/verification and protected Deployment Browser/Final Regression paths; reconcile live/canonical Vercel identity before release.


## 0F. CURRENT EXECUTION RECONCILIATION — 2026-09-18

- Tooling PR #72 actual current head: `b9a585aa64058feaff9bd5f65476f52863d2a503`.
- Exact-head tooling PASS: Gitleaks `35304530215`; Semgrep `35304530295`; CodeQL `35304530253`; Trivy `35304530237`; security-audit `35304530280`; application-quality `35304530205`; G1 Domain `35304530524`.
- Gitleaks fixture handling is scoped to deterministic test/proof data; no global secret-scanner disablement was used.
- The obsolete repair-excel workflow is removed from main and tooling branch.
- Candidate `4d5057d7952e213d6b5328a80f0229f1ff9fb861` remains frozen; production `b102ce5e9aebe61bb13581cd9a8f45d1cc43c497` remains untouched.
- Candidate read-only browser proof PASS: TinyFish `604c8f4a-19f1-4357-b380-9b2c816937fb`; authenticated E2E remains separate and unresolved.
- Migration-proof `35304530279` remains RUNNING; certification must not infer a terminal result.


## 0G. EVOLUTION ENTRY — 2026-09-18 AUTONOMOUS RECONCILIATION 07:26 +03

- Re-read GitHub PR #72 before trusting stored tooling state; actual head `bc40f6b04ca974d6f7aed9daf5c581e18ca710d8` supersedes all prior tooling evidence.
- Enforced the exact-SHA rule: prior tooling PASSes on `b9a585aa…` and earlier heads are historical and cannot certify `bc40f6b0`.
- Reconciled the canonical Vercel project identity and confirmed the frozen candidate deployment is separate from the current tooling deployment.
- Rechecked live Supabase advisors but made no Production changes; advisor findings remain observations requiring deliberate release-safe remediation.
- Durable rule: a newly pushed tooling head with no fresh terminal CI evidence is NOT_PROVEN even if its predecessor had complete PASS evidence.


## 0G. EVOLUTION ENTRY — 2026-09-18 COMMAND 1 CLOSURE RECONCILIATION

- Re-read PR #72 from GitHub and corrected the operational source of truth to tooling head `ddd00fc142ef60bc99e5fe8ebc63d4c53caaed94`.
- Proved that the tooling migration workflow can recreate/apply the database from empty; the remaining failure is inside the legacy pgTAP suite, not the empty-database migration application.
- Tested the tempting remediation of copying candidate tests into tooling, identified that the candidate also contains later product migrations absent from the tooling baseline, and reverted the diagnostic changes to preserve tooling isolation.
- Durable rule: never import candidate product migrations or candidate-specific test contracts into an isolated tooling baseline merely to make a tooling gate green.
- Fresh exact-head evidence is now admitted only for the seven successful tooling runs above; migration proof remains FAIL until its baseline is intentionally reconciled.


### 2026-09-18 — Command 1 closure reconciliation — tooling / pgTAP / browser

- PR #72 was rebuilt from main and is isolated at exact head `92fa7bffb8971eecb10d91fe588709da0e06675a`; 11 terminal CI gates PASS.
- Supabase Migration Proof `35308340466` remains FAIL only in pgTAP after empty-DB migration application PASS. No candidate migration/test was imported to make this tooling gate green.
- Diagnostic PR #73 at `cf7db1c376e40c44ed0cec1956c9b59ee8f5d7f0` repaired baseline test-harness defects and left 12 real product/schema contract failures across five test files: storage boundary, receipt outbox, expense cash balance, transfer search_path, and remaining SECURITY DEFINER search_paths.
- Live Supabase migration history independently corroborates that Production already contains corresponding hardening migrations; this is observation-only and Production remained untouched.
- Fresh TinyFish candidate browser proof `683148ee-b515-4e81-a2cb-ff4fa4a07ca0` passed read-only page/brand/RTL checks with no visible errors. It does not substitute for authenticated E2E.
- Authenticated Deployment Browser remains BLOCKED by the missing `VERCEL_AUTOMATION_BYPASS_SECRET` credential boundary. Formal Final Regression remains NOT_PROVEN because workflow dispatch is unavailable.
- Candidate `4d5057d7952e213d6b5328a80f0229f1ff9fb861` remains frozen. Production `b102ce5e9aebe61bb13581cd9a8f45d1cc43c497` remains NO TOUCH.

NEXT ACTION:
Keep tooling isolated; use PR #73 as the clean baseline diagnosis. The candidate remains the certification subject. Do not weaken gates or touch Production. Continue with the authenticated browser credential path and formal final-regression capability; only product changes on a new candidate may consume the five identified main-branch contract gaps.

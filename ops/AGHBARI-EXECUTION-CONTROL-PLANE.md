# CURRENT EXECUTION REALITY — RUN-2026-09-20-EXECUTE-008
- Development branch: `enhancement/market-ready-v4-20260918`
- Current development SHA: `1366f8ea240f2b1c58d78a863aa7a5584be531fb`
- PR #88: OPEN / DRAFT / base frozen candidate
- Final Regression `35477914059`: SUCCESS; Quality `35477914032`: SUCCESS; Security `35477914046`: SUCCESS
- G1 `35477914182`/`35477916774`: SUCCESS
- Migration `35477914025`, Test-the-Test `35477914073`, Concurrency `35477914055`, Browser Fresh `35477913975`, Browser Local `35477913977`: RUNNING
- Netlify `35477914057`: BLOCKED by external HTTP 403 account-credit exhaustion
- Candidate `2facceb39aaa826413f20245a6f20b6c2ff7cd34`: FROZEN / NO TOUCH
- Production: HOLD / NO TOUCH

# الأغبري | Aghbari Commerce — Execution Control Plane

> **Canonical operating document for continuous execution, proof, reconciliation, and release closure.**
>
> This document is intentionally kept on the dedicated branch `ops/execution-control-plane` so updating operational state does **not** modify the product candidate, invalidate candidate evidence, or touch Production.

> **SINGLE SOURCE OF TRUTH:** `PROJECT_MEMORY.md` is the canonical durable context for product requirements, architecture, design standards, execution backlog, verified state, forensic findings, and market/language requirements. The Control Plane remains the constitution (rules only); Latest State and Development Progress are routers/history, not competing memory. Never rebuild context from raw historical logs during normal startup.

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

# 0A. AUTHORITATIVE LIVE EXECUTION STATE — 2026-09-20 — CURRENT RECONCILIATION
- DEVELOPMENT LANE: `enhancement/market-ready-v4-20260918`; PR #88 OPEN / DRAFT / MERGEABLE.
- CURRENT DEVELOPMENT SHA: `4f0a0614ab94e1c2ebd61745aa915f6942b3c5a0`.
- EXACT VERCEL DEVELOPMENT DEPLOYMENT: `dpl_BCvmScQ6hMUQDppRXMCnGkkRV5hd`, READY.
- CURRENT-SHA FINAL REGRESSION: `35477022465` SUCCESS.
- CURRENT-SHA QUALITY/SECURITY/G1: `35477022455`/`35477022467`/`35477022486`/`35477025357` SUCCESS.
- CURRENT-SHA MIGRATION: `35477022461` IN PROGRESS.
- CURRENT-SHA TEST-THE-TEST: `35477022490` IN PROGRESS.
- NETLIFY EXACT-SHA: `35477022463` BLOCKED by external account-credit exhaustion (HTTP 403).
- EXACT CURRENT-SHA BROWSER E2E: NOT_PROVEN.
- FORMAL FINAL REGRESSION: PROVEN for current development SHA `4f0a0614ab94e1c2ebd61745aa915f6942b3c5a0` by `35477022465`.
- CERTIFICATION: NO.
- CERTIFICATION CANDIDATE: `2facceb39aaa826413f20245a6f20b6c2ff7cd34` — FROZEN / NO TOUCH.
- PRODUCTION: NO TOUCH.
- NEXT OPEN FRONT: close Migration/Test-the-Test; then candidate reconciliation/evidence without candidate or Production mutation.

# 0B. AUTONOMOUS MEMORY + SELF-IMPROVEMENT PROTOCOL

The control plane is a living execution system, not a static instruction sheet.

## A. Mandatory start transaction

Before doing any work:
1. Read this Control Plane.
2. Read ops/AGHBARI-DEVELOPMENT-PROGRESS.md from this same branch — MANDATORY RESUME CHECKPOINT.
3. Read PROJECT_MEMORY.md from this same branch.
4. Read ops/AGHBARI-LATEST-EXECUTION-STATE.md from this same branch.
5. Verify current GitHub state, current candidate SHA, open/running workflows, relevant Vercel deployment state, and relevant Supabase state.
5. Reconcile the stored state against reality.
6. Treat reality as authoritative if the stored state is stale.
7. Start only from unresolved fronts.

The user must not be asked to paste an old report when project evidence can be read directly.

## B. Mandatory end transaction

Before returning a completion report:
1. Persist the newest verified state in ops/AGHBARI-LATEST-EXECUTION-STATE.md.
2. Append the run record to ops/AGHBARI-DEVELOPMENT-PROGRESS.md before the user-facing report.
3. Append a compact execution record with RUN/JOB/SHA/FRONT/RESULT/ROOT CAUSE/ARTIFACT/NEXT ACTION.
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

## CURRENT RECONCILED SNAPSHOT — 2026-09-20 / EXECUTE-008
- Development branch: `enhancement/market-ready-v4-20260918`.
- Current development SHA: `1366f8ea240f2b1c58d78a863aa7a5584be531fb`.
- PR #88: OPEN / DRAFT; base frozen certification candidate `2facceb39aaa826413f20245a6f20b6c2ff7cd34`.
- Frozen certification candidate: `2facceb39aaa826413f20245a6f20b6c2ff7cd34` — NO TOUCH.
- Production: HOLD / NO TOUCH.
- Exact current-SHA Final Regression `35477914059`: SUCCESS.
- Exact current-SHA Security `35477914046`: SUCCESS.
- Exact current-SHA Application Quality `35477914032`: SUCCESS.
- Exact current-SHA G1 `35477914182`/`35477916774`: SUCCESS.
- Exact current-SHA Migration `35477914025`: SUCCESS.
- Exact current-SHA Concurrency `35477914055`: SUCCESS.
- Exact current-SHA Browser Local Production Artifact `35477913977`: SUCCESS.
- Exact current-SHA Browser Fresh Local Supabase `35477913975`: SUCCESS.
- Exact current-SHA Browser Exact Deployment `35477929768`: SUCCESS for browser-contract and authenticated customer/admin E2E.
- Exact current-SHA Test-the-Test `35477914073`: still RUNNING at this checkpoint.
- Netlify `35477914057`: FAILED at deploy with HTTP 403 account-credit exhaustion; external platform blocker.
- Current Vercel exact deployment for `1366f8ea...`: READY as `dpl_DVpzzmGceQ8hSZkTMKHzDc9DCmCh`.
- Candidate and Production remain untouched.

# 11. HISTORICAL STORAGE FORENSIC RECORD

> Historical evidence only. Not a current blocker by itself.

The earlier Storage adversarial incident exposed a proof-observability gap and then a real policy-layer defect. The diagnostic path captured the actual HTTP 400 / PostgreSQL 42501 AccessDenied behavior for an inactive same-tenant product. Root cause was established: application Storage policies queried `public.products` directly, while product read RLS exposed only active products; the inactive product was therefore invisible to the policy.

The durable lesson is more important than the old failure: when an integration test fails at a remote boundary, preserve the actual status/body/headers and trace authorization context before editing product code. The repair introduced a controlled SECURITY DEFINER ownership helper and updated Storage policies; the corrected candidate later passed its exact migration/storage proof.

Do not resurrect this historical incident as an OPEN front unless new exact-SHA evidence reproduces it.

---
# 12. CURRENT DEPLOYMENT / LIVE ALIGNMENT FACTS

Current development lane is `enhancement/market-ready-v4-20260918` at exact SHA `1366f8ea240f2b1c58d78a863aa7a5584be531fb`.

Current exact Vercel development deployment:
`dpl_DVpzzmGceQ8hSZkTMKHzDc9DCmCh` — READY — exact SHA matches.

Deployment Browser E2E is proven on the exact SHA by workflow `35477929768`; its authenticated customer and admin browser suites passed after exact artifact identity verification.

Netlify exact-SHA deployment remains externally blocked by account-credit exhaustion (HTTP 403) in run `35477914057`. Do not treat this as a product failure or waste further deploy attempts until the account permits deployments.

Frozen certification candidate remains `2facceb39aaa826413f20245a6f20b6c2ff7cd34` and must not be mutated. Production remains NO TOUCH.

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

### P0 — Exact-SHA proof closure
Close the remaining Test-the-Test run `35477914073`. Reconcile all mandatory exact-SHA evidence for `1366f8ea...`; no PASS transfers from older SHAs.

### P0 — Candidate reconciliation
Once all development gates are proven, reconcile the full 61-commit development delta against frozen candidate `2facceb39...` without changing that candidate. A new certification candidate may only be created as a separate ref after all required evidence is complete.

### P0 — Release safety
Certification remains NO until candidate-specific gates are proven. Production remains NO TOUCH.

### P1 — External Auth configuration
Reassess Supabase Auth leaked-password protection through an authorized configuration path. Current connected automation has an external capability/funding boundary, so do not fabricate completion.

### P1 — Deferred master-spec
Keep promotions, notification provider delivery, integration delivery records/adapters, lots/batches/expiry/FEFO, reservations, independent fulfillment, WhatsApp/Onyx adapters, and centralized bilingual locale architecture deferred unless deliberately implemented and proven.

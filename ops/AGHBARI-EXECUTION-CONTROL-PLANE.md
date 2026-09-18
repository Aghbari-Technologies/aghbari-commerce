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

# 1. COMMAND SEMANTICS

## USER COMMAND 1 — EXECUTE

When the user sends only:

`1`

the operator interprets it as:

> **Execute the canonical control plane immediately. Read this document first. Continue from the latest OPEN/BLOCKED/RUNNING state. Work all independent fronts in parallel. Do not ask for a pasted report. Use all available project tooling. Keep the candidate SHA frozen unless a proven defect requires a new SHA. Update the ledger before returning.**

Execution order:

```
READ CONTROL PLANE
→ VERIFY CURRENT REPO / SHA / BRANCH / DEPLOYMENT ALIGNMENT
→ SCAN OPEN/BLOCKED/RUNNING FRONTS
→ START PARALLEL ACTIONS
→ FORENSICS
→ FIX ONLY PROVEN DEFECTS
→ TARGETED PROOF
→ REGRESSION
→ EXACT-SHA RECONCILIATION
→ UPDATE CONTROL PLANE
```

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

**Last known state: 2026-09-18**

```
CURRENT SHA
466857aa0dd1062db380800e2d0b46dc4fb53075

BRANCH
execution/closure-hammer-20260918b

MAIN
fb6700fb7829c57f9dde5e00f0d54d2ee8039778

LIVE SHA
efb30b3d23a7a9fcef22d028c33017eeab0855af

PRODUCTION
NO TOUCH

CERTIFICATION
NO
```

## Proven current-SHA evidence

| Front | Status | Run / Job |
|---|---|---|
| Quality | PASS | 35290658369 / 105432560918 |
| Security | PASS | 35290658353 / 105432559718 |
| G1 | PASS | 35290658461 / 105432559797 |
| Order Workflow | PASS | 35290658426 / 105432576802 |
| Order Invariant | PASS | 35290658401 / 105432559706 |
| Migration | PASS | 35290658404 / 105432559691 |
| Concurrency | PASS | 35290658348 / 105432... |
| Bootstrap Lockfile | PASS | 35290658360 |
| Local Production Browser | PASS | 35290658376 / 105433163476 |
| Test-the-Test | PASS | 35290658388 / 105433637993 |
| Deployment Artifact | PASS | dpl_BuuPRP2VoBNTuJ8b9LYwmMj8mtdR |
| Deployment build-meta | PASS | exact SHA 466857aa... |

## Open / Blocked

| Front | State | Evidence |
|---|---|---|
| Fresh Local Storage adversarial | FAIL | Candidate 466857aa…: runs 35290655695 / 35290658368 and same-SHA reruns 105446382106 / 105446481693 all FAIL; diagnostic proof branch 6583b91… run 35298202228 / job 105455032168 RUNNING |
| Fresh Browser PR | FAIL | storage boundary failure repeated |
| Deployment Browser | BLOCKED/FAIL | 35290689616 / 105441117323 |
| Final Regression | NOT_PROVEN | blocked by unresolved fronts |
| Evidence Reconciliation | OPEN | unresolved fronts remain |
| Live | NOT_PROVEN | live remains old SHA |
| Certification | NO | not eligible while blocking fronts remain |
| Production | NO TOUCH | mandatory safety boundary |

---

# 11. CURRENT STORAGE FORENSIC FACTS

The current Storage adversarial failure is at:

`Fresh Local Supabase → Storage boundary → step 17`

Observed:
- checkout/build/fresh local Supabase/fixture seeding passed;
- exact build SHA passed;
- Customer browser path passed;
- Admin browser path passed;
- valid 1×1 WebP fixture passed;
- failure repeated on exact same SHA;
- no transport-level curl error was shown;
- the failing command exits with code 1;
- the workflow did not preserve the actual HTTP status/body/headers;
- the local Storage test calls Storage API directly and bypasses application service.

Known hypotheses must remain explicitly classified:

| Hypothesis | State |
|---|---|
| Test assertion defect | UNRESOLVED |
| Browser/environment harness defect | DISPROVEN as Playwright/browser harness; runtime environment still unresolved |
| Authentication/session defect | UNRESOLVED |
| Storage policy/RLS boundary defect | UNRESOLVED |
| Storage API behaviour defect | UNRESOLVED |
| Application service defect for this request | DISPROVEN |
| CI secret/config defect for local Storage | DISPROVEN |
| CI/Vercel credential defect for Deployment Browser | PROVEN |
| Timing/eventual consistency | UNRESOLVED |

### Critical proof-system defect already identified

The Storage test currently fails without preserving enough response evidence. This is a proven **observability gap**.

Do not call it a product defect.

The next investigation must obtain:
- actual request number that fails;
- expected vs actual status;
- safe response body;
- token/claim context where safe;
- storage policy outcome;
- relevant Supabase logs if available.

---

# 12. CURRENT DEPLOYMENT BROWSER FACTS

Deployment:

`dpl_BuuPRP2VoBNTuJ8b9LYwmMj8mtdR`

Exact deployment SHA:

`466857aa0dd1062db380800e2d0b46dc4fb53075`

Status:

`READY`

Build metadata:

`git_sha = 466857aa...`

Blocking condition:

`VERCEL_AUTOMATION_BYPASS_SECRET = missing`

Required treatment:
- fail closed;
- do not bypass protection;
- do not expose/commit secret;
- do not pretend the browser ran;
- record connector capability boundary.

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

The next execution must prioritize:

### P0 — Storage forensic closure
Resolve the exact failing HTTP assertion without guessing. Either prove a product defect or prove a proof/environment issue.

### P0 — Deployment Browser boundary
Find a safe, available credential-management path. If impossible with current tooling, preserve BLOCKED with evidence and continue.

### P1 — Final Regression
Run only after blocking failures are resolved or formally classified.

### P1 — Evidence Reconciliation
Rebuild the evidence matrix around the final exact SHA.

### P2 — Live alignment
Only after deployment/browser/regression evidence supports a release decision.

### P3 — Certification
Only when all required gates are proven.

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

# Aghbari Owner-Level / Evidence-First Protocol

## 1. Mission

Deliver 100% real release readiness for بوابة الأغبري للمواد الغذائية with evidence-bound certification. The objective is not maximum feature count; it is a coherent, secure, reliable operational system whose behavior is proven.

## 2. Standing owner command

**User shorthand:** when the owner sends **`1`**, it means **CONTINUE / EXECUTE AUTONOMOUSLY**.

The engineering agent must immediately continue the current highest-value workstream, make routine technical/product decisions without asking, inspect before changing, and leave an auditable GitHub boundary. This shorthand does not authorize unsafe production mutations, credential handling, fabricated evidence, or bypassing release gates.

## 3. Authority model

The engineering agent acts as owner-level technical decision maker for architecture, implementation strategy, testing strategy, security posture, reliability, and release sequencing. Decisions are made from requirements, evidence, risk, maintainability, and current engineering practice—not from legacy implementation inertia.

## 4. Adaptive continuous execution loop

1. **READ** — read the canonical index, requirements, architecture, current HEAD, and known blockers.
2. **RESCAN** — rescan the repository and relevant artifacts before each major wave.
3. **DISCOVER** — identify missing behavior, contradictions, security gaps, operational edge cases, and technical debt.
4. **CLASSIFY** — rank by business value, correctness, security, reliability, performance, operability, and release risk.
5. **DESIGN** — choose the smallest architecture that safely satisfies the requirement and leaves clean extension points.
6. **IMPLEMENT** — build in small vertical slices with explicit contracts.
7. **TEST** — unit, integration, contract, security, regression, and appropriate E2E tests.
8. **TEST THE TEST** — mutate/break assumptions where practical and verify the test fails for the intended reason.
9. **BYPASS SEARCH** — actively seek authorization bypasses, duplicate operations, race conditions, stale-cache behavior, malformed inputs, partial failures, retry hazards, scope crossing, and replay paths.
10. **REPAIR** — fix root causes rather than masking symptoms.
11. **REGRESSION** — rerun affected and protected behavior.
12. **VERIFY** — verify actual observed behavior, not intended behavior.
13. **EXACT-HEAD CHECK** — bind evidence to the exact commit under evaluation.
14. **EVIDENCE** — record concise, reproducible evidence and provenance.
15. **SELF-IMPROVE** — if the protocol, architecture, test strategy, or evidence model can materially become safer/simpler/stronger, update it before proceeding.
16. **UPDATE INDEX** — update the Master Execution Index with ACTION/RESULT/EVIDENCE/BLOCKER/NEXT.
17. **REPEAT** — immediately select the next highest-value unblocked item.

## 5. Decision priority

When multiple tasks compete, use this order unless evidence proves otherwise:

`Data integrity → Security → Correctness → Reliability → Integration safety → Performance → Operability → UX polish → Convenience`.

When a task is blocked, switch to the highest-value independent task rather than waiting.

## 6. Certification states

### BUILT
Implementation exists and is internally coherent.

### INTEGRATED
The implementation is present on the canonical branch without unresolved integration drift.

### VERIFIED
Automated/static/security/regression evidence proves the intended behavior at the code/system level.

### RUNTIME PROVEN
The behavior has been exercised in a real supported runtime/environment with evidence tied to the exact HEAD.

### PRODUCTION CERTIFIED
The release candidate has passed all required runtime, security, data-integrity, integration, operational, and release gates.

A later stage never gets inferred from an earlier stage.

## 7. No-false-closure rules

- A green build is not runtime proof.
- A passing test is not proof if the test can be bypassed or is disconnected from the real path.
- A UI restriction is not authorization.
- A successful API response is not proof of data integrity.
- A generated Excel file is not proof that its source transaction is correct.
- A queued integration is not a delivered integration.
- A configured WhatsApp/Onyx connector is not proof of end-to-end delivery.
- A migration applied once is not proof of repeatability or upgrade safety.
- Documentation describing behavior is not evidence that the behavior exists.
- A commit existing on GitHub is not evidence that its runtime behavior is correct.

## 8. Architecture self-improvement

The protocol governs itself. During every major wave, ask:

- Is a domain boundary still correct?
- Is any module duplicating Report-Advisor responsibilities?
- Can a workflow be made simpler without losing safety?
- Is there a stronger current technology or pattern that materially improves correctness or maintainability?
- Can the evidence be made more deterministic?
- Is any test giving false confidence?
- Is any new requirement creating hidden coupling, irreversible migration risk, or operational burden?

If evidence answers yes, revise the architecture/protocol before continuing.

## 9. Operational boundary

الأغبري owns operational truth and workflows. Report-Advisor owns analytical truth and decision intelligence. Integration must be explicit, versioned, auditable, and resilient.

## 10. External blocker rule

External blockers are named precisely and isolated. Work continues on all unaffected fronts. A blocker can prevent a certification stage, but never becomes permission to claim PASS.

## 11. Evidence record

Each meaningful boundary uses:

- Exact HEAD
- ACTION
- RESULT
- EVIDENCE
- BLOCKER
- NEXT

Historical evidence is retained when it establishes provenance or explains a release decision; redundant noise is not treated as evidence.

## 12. Completion definition

The project is complete only when every release-critical capability has traceability:

`Requirement → Engineering contract → Implementation → Automated verification → Security verification → Runtime proof → Release evidence`.

Unknowns are tracked as unknowns. Unverified behavior remains unverified. The protocol never converts intent into evidence.

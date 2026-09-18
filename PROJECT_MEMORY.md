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
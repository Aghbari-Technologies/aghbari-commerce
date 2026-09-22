# 🔴 AGHBARI — CANONICAL QUALITY, CERTIFICATION & RELEASE

**Authority:** Verification ladder, test strategy, exact-SHA evidence, release gates and production protection.

## Evidence ladder
Specified → Implemented → Static/Unit → Integration → E2E → Security → Runtime → Release/Candidate → Production.

## Exact-SHA law
Every PASS must bind exact SHA, environment, command/workflow, result and evidence. Never transfer evidence between SHAs or between local/CI/artifact/candidate/deployment/production.

## Test-the-test
The test suite itself must be capable of detecting the failure it claims to cover. Weak tests are defects.

## Verification surfaces
Domain/unit; service/contract; PostgreSQL/pgTAP; RLS/negative security; concurrency/idempotency; Playwright/browser; visual review; build/artifact; deployment/runtime; rollback/recovery.

## Release gates
Requirements/architecture; DB/migrations; domain transactions; security; UI/browser; integration; performance/resources; runtime; deployment; final exact-head audit.

## Re-test discipline
Do not waste execution on unchanged proven fronts unless SHA, dependencies, environment, evidence validity or regression risk changed.

## Canonical source merge register
The manifest lists the quality/certification/release documents that must be fully merged here before retirement.

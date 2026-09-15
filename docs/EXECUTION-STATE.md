# EXECUTION STATE

CURRENT_HEAD: `817d6cdff26afc339138ec4bf416f97480350d6f`
CURRENT_CANDIDATE: `817d6cdff26afc339138ec4bf416f97480350d6f` (NOT FROZEN)
CURRENT_PRODUCTION: `6bdfd97df4417d7ab6a533a29ad77c43c45ac0a8`
LAST_CERTIFIED_EVIDENCE: `NONE`
PRODUCTION: `NO TOUCH`

## WAR ROOM — 34 FRONTS
| Front | Status | Exact SHA | Evidence | Blocker |
|---|---|---|---|---|
| F01 Fresh DB / P0 | FAIL | `817d6cd...` | `34924484015` on prior `a6cd1a9...`: 8 storage tests failed | storage RLS repair needs fresh replay |
| F02 RPC WAR | RUNNING | `817d6cd...` | targeted RPC/security suites exist; current exact replay pending | — |
| F03 Tenant A/B | RUNNING | `817d6cd...` | tenant boundary suites pass on earlier SHA only | current exact replay pending |
| F04 Inventory | RUNNING | `817d6cd...` | transfer/stock-count/concurrency suites exist | current exact replay pending |
| F05 Finance | RUNNING | `817d6cd...` | finance/cash suites exist | current exact replay pending |
| F06 Order Lifecycle | RUNNING | `817d6cd...` | state-machine/tenant suites exist | browser/runtime proof pending |
| F07 Quick Order | RUNNING | `817d6cd...` | quick-order history/contracts present | current exact replay pending |
| F08 Imports / Reconciliation | RUNNING | `817d6cd...` | import tenant/delta suites exist | current exact replay pending |
| F09 Order Templates | RUNNING | `817d6cd...` | enterprise template migration/test present | browser + adversarial proof pending |
| F10 RBAC | RUNNING | `817d6cd...` | privilege/security contracts present | full role matrix pending |
| F11 Customer Invitations | RUNNING | `817d6cd...` | invitation pgTAP present | browser proof pending |
| F12 Outbox Worker | RUNNING | `817d6cd...` | worker/search_path suites present | current exact replay pending |
| F13 Admin Authentication | RUNNING | `817d6cd...` | auth/session code present | browser proof pending |
| F14 Customer Authentication | RUNNING | `817d6cd...` | customer auth/invitation code present | browser proof pending |
| F15 Admin Browser E2E | BLOCKED | `817d6cd...` | workflow exists | no runtime workflow dispatch available |
| F16 Customer Browser E2E | BLOCKED | `817d6cd...` | workflow exists | no runtime workflow dispatch available |
| F17 Product Catalog | RUNNING | `817d6cd...` | catalog/warehouse contracts present | final UI/runtime proof pending |
| F18 Pricing / MOQ | RUNNING | `817d6cd...` | pricing/tier contracts present | checkout authority proof pending |
| F19 Cart / Checkout | RUNNING | `817d6cd...` | cart/order workflow suites exist | exact runtime replay pending |
| F20 CMS / Merchant Control Plane | OPEN | `817d6cd...` | UI/control-plane code exists | mutation→customer proof pending |
| F21 Shipping | OPEN | `817d6cd...` | domain surface not fully proven | end-to-end proof pending |
| F22 Returns | OPEN | `817d6cd...` | domain surface not fully proven | end-to-end proof pending |
| F23 Operational Accounting | RUNNING | `817d6cd...` | finance/invoice/cash contracts exist | cross-domain invariant proof pending |
| F24 PWA | OPEN | `817d6cd...` | final installability proof pending | — |
| F25 Offline / Sync | OPEN | `817d6cd...` | final queue/reconnect proof pending | — |
| F26 Storage Security | FAIL | `817d6cd...` | fresh replay exposed 8 failures; repair committed | fresh replay pending |
| F27 Security Final | RUNNING | `817d6cd...` | security suites exist | current exact sweep pending |
| F28 Audit / Evidence | RUNNING | `817d6cd...` | audit contracts present | end-to-end trace proof pending |
| F29 Recovery / Idempotency | RUNNING | `817d6cd...` | idempotency contracts/suites present | system-wide replay pending |
| F30 Performance / Concurrency | RUNNING | `817d6cd...` | concurrency suites exist | broader domain replay pending |
| F31 Test-the-Test | OPEN | `817d6cd...` | controlled-bypass work pending | — |
| F32 UI/UX Final | OPEN | `817d6cd...` | product pass not certified | final browser review pending |
| F33 Final Regression | BLOCKED | — | not started | candidate fronts not closed |
| F34 Release / Production / Certification | BLOCKED | — | not started | F33 + freeze required |

## EXACT-SHA RULE
PASS never transfers across SHAs. The current branch HEAD was checked directly and is `817d6cdff26afc339138ec4bf416f97480350d6f`; it is newer than the previously referenced `e8b32e0...`.

## CURRENT P0 FAILURE / ROOT CAUSE
Fresh DB run `34924484015` checked out exact `a6cd1a93441b14d03b341d1dc8b37c0da9ed877a`. Migrations and migration inventory passed; pgTAP failed only in `001-storage-boundary.test.sql` (8/19). Failures showed bucket metadata was queried under authenticated RLS, the authenticated media insert contract did not admit the intended staff fixture, and downstream registration/read assertions collapsed. The new repair adds an explicit Storage RLS contract and moves bucket metadata assertions to `service_role`; no production state was touched.

## CURRENT WORK
- Fresh DB repair is waiting for a new exact-SHA replay because no workflow-dispatch capability is exposed through the current GitHub connector.
- Independent WAR fronts remain active; P0 does not stop code review/design/test preparation for independent fronts.
- Admin/Customer browser fronts are blocked only by runtime workflow dispatch capability; credentials must remain in GitHub Actions and never be pasted into chat.

## PRODUCTION LOCK
Production remains `NO TOUCH` until F33 passes on one exact Candidate SHA and Candidate Freeze is explicitly established.

## PROVEN
`0 / 34`

## REMAINING
`34`

## NEXT 5
1. Fresh P0 replay on the new storage repair SHA.
2. Close F26 Storage Security, then refresh F01 Fresh DB from the same SHA if the repair is clean.
3. Continue exact-current RPC/Tenant/Inventory/Finance/Orders/Imports/Templates/RBAC/Outbox evidence without waiting for P0.
4. Continue UI/CMS/Shipping/Returns/Test-the-Test fronts; keep browser fronts explicitly blocked rather than claiming API proof.
5. Prepare one candidate evidence bundle only after the fronts converge; F33/F34 remain downstream.

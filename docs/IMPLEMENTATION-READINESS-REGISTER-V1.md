# Aghbari — Implementation Readiness Register V1

## Purpose
Evidence-bound bridge from the reconciled architecture to executable implementation. This register deliberately distinguishes contract/proof evidence from production runtime evidence.

| Track | Current state | Required evidence |
|---|---|---|
| Architecture / ownership | RECONCILED | Batch-3 record + contract review |
| Transactional invariants | PROVEN in POC | Production runtime regression |
| Order state machine | PROVEN in POC | Production service/domain execution |
| PostgreSQL schema | READY TO IMPLEMENT | Clean + upgrade migration runs |
| Auth / tenant isolation | SPECIFIED / RUNTIME BLOCKED | Real staging Auth + Tenant A/B E2E |
| RLS | SPECIFIED | Direct API adversarial tests |
| Backend/domain runtime | NOT IMPLEMENTED | Executable service tests + integration tests |
| Frontend/PWA | NOT IMPLEMENTED | Browser E2E |
| Worker/outbox | NOT IMPLEMENTED | Durable enqueue → delivery → retry evidence |
| Import/export | CONTRACTED | Real staged validation/commit evidence |
| Onyx integration | CONTRACTED | Adapter sandbox/E2E evidence |
| WhatsApp integration | CONTRACTED | Official provider E2E evidence |
| Offline sync | CONTRACTED | Replay/conflict/isolation runtime evidence |
| Report-Advisor gateway | CONTRACTED + proof | Runtime dataset publication evidence |
| Production deployment | NOT IMPLEMENTED | Deployment + smoke + rollback evidence |

## First vertical slice acceptance
A release candidate cannot claim the first runtime slice complete unless all are executable against the same exact HEAD:

1. authenticated tenant context;
2. product read is scope-safe;
3. authorized customer price is server-selected;
4. inventory read is authoritative;
5. order creation is transactional;
6. stale/invalid client price cannot mutate truth;
7. inventory cannot oversell under concurrency;
8. repeated operation key replays exactly once;
9. changed payload under the same operation key is rejected;
10. order transitions enforce the state machine;
11. audit evidence is written;
12. outbox event is durable and correlated;
13. cross-tenant/cross-branch/unauthorized attempts fail;
14. all results are tied to the exact certification HEAD.

## Anti-closure rules
- A POC is not production runtime evidence.
- A migration file is not migration execution evidence.
- A UI restriction is not authorization evidence.
- A configured integration is not delivery evidence.
- A queued event is not successful external delivery evidence.
- A green CI run on an earlier SHA is not exact-HEAD evidence.

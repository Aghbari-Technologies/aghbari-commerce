# بوابة الأغبري للمواد الغذائية — MASTER EXECUTABLE PRODUCT SPECIFICATION

**Document type:** Master executable specification / developer command / architecture and completion contract  
**Project:** Aghbari Commerce — `Aghbari-Technologies/aghbari-commerce`  
**Product identity:** بوابة الأغبري للمواد الغذائية  
**Status:** AUTHORITATIVE EXECUTION BASELINE  
**Purpose:** This document is the single operational instruction set for completing the product without improvisation, scope drift, destructive rewrites, fake completion, or weakening of security/data integrity.

---

## 0. NON-NEGOTIABLE EXECUTION ORDER

The developer/agent MUST treat the repository as an existing production-oriented system and complete it; it MUST NOT rebuild it from scratch merely because another implementation would look different.

Required loop for every work wave:

`READ → RESCAN → DISCOVER → CLASSIFY → DESIGN → IMPLEMENT → TEST → TEST THE TEST → ADVERSARIAL/BYPASS SEARCH → REPAIR → REGRESSION → VERIFY → EXACT-HEAD CHECK → EVIDENCE → UPDATE INDEX → REPEAT`

A feature is NOT complete because:
- a screen exists;
- a function exists;
- a migration file exists;
- a build is green;
- a test is green without proving the production path;
- a button is hidden in the UI;
- a request returns HTTP 200;
- an integration event is queued;
- a mock/POC succeeds;
- documentation says PASS.

Allowed completion states are evidence-based only:
`NOT_STARTED → DESIGNED → IMPLEMENTED → UNIT_VERIFIED → INTEGRATION_VERIFIED → SECURITY_VERIFIED → E2E_VERIFIED → RUNTIME_PROVEN → RELEASE_READY → PRODUCTION_CERTIFIED`.

Never skip a state silently when the risk requires evidence at that level.

---

## 1. SCOPE LOCK

### 1.1 Product
Build and finish only:

**بوابة الأغبري للمواد الغذائية** — an operational B2B commerce platform for wholesale food commerce.

### 1.2 Out of scope
Do not introduce or duplicate:
- BI dashboards;
- advanced analytics;
- forecasting;
- Decision Intelligence;
- analytical recommendations;
- executive analytical reporting.

Those belong to the separate Report-Advisor analytical layer. Aghbari is the operational system of record.

### 1.3 Branding
- The canonical name is **الأغبري**.
- The legacy name **العامري** MUST NOT appear in product UI, metadata, documentation, tests, source strings, or release artifacts except where explicitly documented as historical/reference context.

---

## 2. PRODUCT MISSION

Deliver a reliable Arabic RTL-first B2B wholesale commerce system in which:

`Customer/User → Authentication → Tenant Context → Authorization → Catalog → Authorized Price → Cart → Order → Transaction → Inventory → Audit → Outbox → Integrations → Runtime Evidence`

is a coherent, secure, transactional flow.

The server/database owns operational truth.

The client is never authoritative for:
- final price;
- stock truth;
- permissions;
- customer tier;
- final totals;
- order acceptance;
- inventory mutation;
- integration completion.

---

## 3. PRODUCT CAPABILITIES — REQUIRED FINAL SCOPE

### A. Authentication and identity
- Secure authenticated session.
- Customer and staff identity separation.
- Tenant/organization context resolved server-side.
- Role/capability authorization server-side.
- Customer activation/suspension lifecycle.
- Customer onboarding and approval.
- Staff roles and least privilege.
- Session expiry/re-authentication handling.
- Unauthorized and expired-session paths tested.

### B. Organizations, branches and warehouses
- Organization/tenant isolation.
- Branches.
- Warehouses.
- Warehouse-scoped inventory.
- Scope-aware staff authorization.
- Cross-tenant and cross-warehouse access rejection.

### C. Customers
- Create customer.
- Customer approval.
- Activate/suspend/reactivate.
- Customer contact information.
- Operational account state.
- Customer tier assignment.
- Authorized price resolution by tier.
- Device/session binding where supported.
- Customer-facing projection MUST NOT expose internal tier metadata.

### D. Suppliers
- Supplier master data.
- Supplier lifecycle.
- Supplier references in purchasing.
- Tenant isolation.
- Authorized staff access only.

### E. Catalog
- Categories.
- Products.
- Stable product UUID.
- SKU/item number/barcode identifiers.
- Units.
- Product status.
- Product media/images.
- Product descriptions and operational metadata.
- Search.
- Filtering.
- Category browsing.
- Pagination.
- Indexed reads based on measured workload.
- Customer availability derived from authoritative operational state with explicit freshness policy.

### F. Product media / image repository
Treat product images as first-class product media, not as business identity.

Requirements:
- Stable product identity MUST survive media replacement.
- Media records MUST be linked to canonical product identity.
- Multiple images per product MAY be supported.
- Explicit primary image selection.
- Safe upload validation.
- MIME/type/size validation.
- No executable content.
- Authorized upload/update/delete only.
- Tenant scoping where media is tenant-owned.
- Storage paths MUST NOT allow cross-tenant access.
- Broken/missing image must degrade gracefully without breaking catalog/order flows.
- Image URLs MUST NOT expose private storage objects without authorized access.
- Product media must never become the source of truth for price, stock, SKU, or product identity.

### G. Pricing
- Customer pricing tiers.
- Product price per tier.
- Server-side effective price resolution.
- Effective dates/versioning where required.
- Price-change audit.
- Promotions/discount rules as a separate bounded context.
- Deterministic promotion precedence.
- Bulk price update with validation/preview before commit.
- Customer receives only the authorized price.
- Staff may access broader pricing only through explicit authorization.

### H. Cart
- One logical active cart per customer context as defined by domain rules.
- At most one active line per product per cart.
- Set quantity.
- Remove item.
- Repeated operations resolve deterministically.
- Quantity validation.
- UUID validation.
- Bounded payloads.
- Safe offline queue support.
- Cart data is not final order truth.

### I. Orders
- Server-generated canonical order ID and order number.
- Create order transactionally.
- Authorized price snapshot.
- Quantity snapshot.
- Customer snapshot as required.
- Totals calculated server-side.
- Client totals treated as hints only.
- Explicit lifecycle/state machine.
- Status history.
- Notes.
- Amendments only when state permits.
- Fulfillment/delivery records where required.
- Invoice access where authorized.
- Order search/filter.
- Duplicate submission prevention.
- Idempotency key.
- Concurrency protection.
- Audit trail.

### J. Inventory
- Balance by product/warehouse.
- Inventory movement ledger.
- Receipts.
- Adjustments.
- Reconciliation.
- Thresholds.
- Reservations where order lifecycle requires them.
- Lot/batch support where food-grade traceability requires it.
- Expiry dates where applicable.
- Receiving provenance.
- Blocked/expired/quarantined stock states where applicable.
- FEFO allocation policy where enabled.
- No ad-hoc direct balance edits.
- Every material mutation has actor, reason, source/reference, timestamp.
- No overselling.
- No lost update.
- No double mutation.
- No partial transactional mutation.

### K. Purchasing and receiving
- Suppliers.
- Purchase orders.
- Purchase lines.
- Purchase approval/submission lifecycle.
- Idempotent creation.
- Exact-payload replay validation.
- Changed-payload conflict rejection.
- Numeric finiteness validation.
- Reject NaN, Infinity and -Infinity.
- Receiving events.
- Inventory mutation only through transactional domain operation.
- Receipt idempotency.
- Inventory/outbox/audit effects tied to one transaction where required.

### L. Promotions
- Separate from base pricing.
- Deterministic eligibility.
- Deterministic precedence.
- Server-side calculation.
- Financially material resulting price recorded in transaction.
- Authorization and auditability.

### M. Imports
Required pipeline:

`Upload → Quarantine → Parse → Schema Validation → Business Validation → Preview → Approval → Atomic Commit → Evidence`

Requirements:
- Untrusted-file boundary.
- File type/size validation.
- Safe parser.
- Malformed numeric rejection.
- No SQL injection through imported data.
- No cross-tenant import.
- Row-level actionable errors.
- Duplicate detection.
- Fingerprinting/idempotency where applicable.
- No mutation before validation/approval boundary.
- Atomic or explicitly partitioned auditable commit.
- Rollback/recovery semantics.

### N. Exports
- Authorized canonical reads only.
- Tenant scoped.
- Versioned contract.
- Exact column order where external integration requires it.
- No customer data leakage.
- Audit export operations.
- Onyx-specific contract isolated from core domain implementation.

### O. Notifications
- Notification intent.
- Recipient.
- Channel.
- Delivery state.
- Attempt count.
- Provider reference.
- Retryable vs terminal failure.
- Notifications must not block the core business transaction.

### P. Outbox and integrations
Required:

`Business Transaction → Commit → Durable Outbox → Worker → Adapter → Provider → Delivery Record → Retry/Backoff → Terminal Failure/DLQ`

Integrations:
- Onyx Pro.
- WhatsApp Business/provider.
- Report-Advisor bridge.

Rules:
- External systems never write directly to canonical Aghbari tables.
- Every delivery carries idempotency key and correlation ID.
- Record attempt count/status/timestamps/provider reference/error classification.
- At-least-once delivery must be consumer-idempotent.
- Queueing is not delivery proof.
- Adapter existence is not integration proof.

### Q. Audit and traceability
Audit material actions:
- authentication/security changes;
- customer lifecycle changes;
- price changes;
- order creation/status changes;
- inventory mutations;
- purchases/receipts;
- imports/exports;
- integration retries/replays;
- privileged administrative operations.

Audit records must be scope-aware, append-oriented, tamper-resistant within the application trust model, and must not contain secrets unnecessarily.

### R. Offline/PWA
Offline is a convenience/resilience layer, never the operational authority.

Allowed offline behavior:
- safe catalog cache;
- authorized price cache where policy permits;
- limited customer cache;
- cart drafting;
- bounded queued submission.

Never authoritative offline:
- inventory truth;
- price mutation;
- role/permission mutation;
- final stock commit;
- final order acceptance.

Reconnect sequence:

`Re-authenticate → Re-authorize → Revalidate → Transaction → Idempotency → ACK / CONFLICT / TERMINAL_FAILURE`

Queue requirements:
- bounded size;
- bounded attempts;
- safe operation types only;
- UUID validation;
- payload-size limit;
- malformed-record eviction;
- exact operation removal after successful processing;
- concurrent queue additions preserved;
- replay must not duplicate business effects.

---

## 4. ARCHITECTURE

### 4.1 Logical architecture

```text
┌─────────────────────────────────────────────┐
│             Aghbari Web / PWA              │
│        Arabic RTL / Responsive UI          │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│     Authenticated Application Boundary      │
│  session / input validation / correlation    │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│       Application Services / Domain         │
│ catalog / pricing / cart / orders / stock   │
│ purchasing / import / export / integration  │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│          PostgreSQL / Supabase Core         │
│ canonical tables / constraints / RLS / RPC  │
│ transactions / audit / outbox / idempotency │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│             Durable Outbox / Jobs           │
└───────────────┬──────────────┬──────────────┘
                │              │
                ▼              ▼
         Onyx Adapter     WhatsApp Adapter
                │
                ▼
        Report-Advisor Bridge
```

### 4.2 Boundary rules
- UI never becomes authorization.
- Client state never becomes financial/inventory truth.
- External providers never become canonical internal truth.
- Analytics never write competing operational truth.
- Security-critical rules are enforced at server/database layers.
- Business-critical mutations are transactional.

---

## 5. DATABASE ARCHITECTURE

Canonical entities include:

```text
organizations / tenants
branches
warehouses
users
roles / role assignments
customers
suppliers
categories
products
product_media
product_identifiers
units
customer_pricing_tiers
product_prices
promotions
carts / cart_items
orders / order_lines
order_status_history
invoices / operational invoice snapshots
inventory_balances
inventory_movements
inventory_adjustments / reconciliations
reservations where required
lots / batches / expiry metadata where required
purchase_orders / purchase_lines
receipts / receipt_lines
notifications
outbox_events
integration_deliveries
idempotency records
imports / import rows / import evidence
exports
security/audit records
```

Rules:
- Stable UUID primary identities.
- Required ownership/scope columns.
- Foreign keys.
- Unique constraints for business identity.
- Indexes for real query patterns.
- RLS on exposed public tables.
- No tenant leakage through joins, RPCs, bulk operations, imports or exports.
- Monetary calculations are server-side.
- Inventory mutations are ledger-backed.
- State machines reject invalid transitions.

---

## 6. RLS / AUTHORIZATION CONTRACT

### 6.1 Mandatory
RLS MUST remain enabled on all exposed tenant/business tables.

### 6.2 Defense in depth

`UI capability → server authorization → domain policy → database RLS`

No single UI restriction is considered authorization.

### 6.3 Adversarial matrix
Every protected operation must test:
- unauthenticated;
- authenticated wrong role;
- wrong tenant;
- wrong branch;
- wrong warehouse;
- wrong customer;
- guessed UUID;
- modified UUID;
- bulk cross-tenant request;
- direct RPC invocation;
- direct REST/data endpoint invocation;
- stale authorization;
- suspended customer;
- malformed payload;
- mass assignment.

Forbidden paths must fail without revealing cross-scope existence where appropriate.

---

## 7. RPC / SECURITY-DEFINER CONTRACT

For every SECURITY DEFINER function:
- explicit `SET search_path` strategy;
- fully qualified object references where required;
- explicit grants;
- only intended roles can execute;
- internal authorization checks remain mandatory;
- tenant scope is resolved server-side;
- caller-controlled tenant IDs must never override authoritative scope;
- sensitive functions require adversarial direct invocation tests.

Do NOT remove intentional SECURITY DEFINER functions merely to silence an advisor warning. Audit their authorization boundary instead.

---

## 8. IDEMPOTENCY AND CONCURRENCY

Every retryable critical mutation must bind, where applicable:

`operation_id + command/version + payload_hash + actor + tenant + correlation_id + result`

Required proofs:
1. Same key + same payload → one business effect.
2. Same key + different payload → explicit conflict.
3. Concurrent duplicate requests → one business effect.
4. Timeout followed by retry → no duplicate.
5. Worker retry → no duplicate.
6. Client offline retry → no duplicate.
7. Changed replay payload → reject.
8. No partial business mutation on failure.

Required invariants:

`one logical operation → one business effect`

`NO DOUBLE ORDER`

`NO DOUBLE RECEIPT`

`NO DOUBLE INVENTORY MUTATION`

`NO OVERSELL`

`NO LOST UPDATE`

`NO PARTIAL TRANSACTION`

---

## 9. INPUT HARDENING

At every trust boundary reject or safely handle:
- null/undefined;
- empty strings;
- malformed UUID;
- negative quantity;
- zero quantity where forbidden;
- decimal quantity where integer required;
- NaN;
- Infinity;
- -Infinity;
- scientific notation where business rules forbid it;
- oversized strings;
- oversized payloads;
- malformed JSON;
- duplicate lines;
- duplicate identifiers;
- invalid currency;
- invalid status;
- unknown fields/mass assignment;
- SQL metacharacters;
- HTML/script payloads;
- invalid dates;
- impossible date ranges.

Never trust browser validation as the only validation layer.

---

## 10. ORDER STATE MACHINE

The implementation must define and enforce an explicit lifecycle. At minimum, the state machine must distinguish:

```text
DRAFT
→ SUBMITTED
→ ACCEPTED / PROCESSING
→ FULFILLMENT / READY / DELIVERED as applicable
→ COMPLETED
```

and explicit rejection/cancellation/failure states where business rules require them.

For every transition define:
- allowed source states;
- allowed actor roles;
- allowed tenant/scope;
- required fields;
- concurrency behavior;
- audit event;
- idempotency behavior;
- invalid/stale transition error.

Never implement state transitions as arbitrary client-side status updates.

---

## 11. INVENTORY INVARIANTS

For every stock mutation prove:
- product exists;
- warehouse belongs to authorized scope;
- quantity is finite and valid;
- source/reference is present where required;
- authorization is valid;
- mutation occurs transactionally;
- movement is recorded;
- balance remains consistent;
- concurrent mutation is safe;
- rollback removes all partial effects;
- replay does not duplicate effect.

For food-sensitive inventory, preserve traceability:

`Receiving → Lot/Batch → Movement → Reservation/Fulfillment → Order → Adjustment`

where the relevant features are enabled.

FEFO is a deterministic allocation policy, not permission to mutate stock outside the transaction.

---

## 12. PURCHASING / RECEIVING INVARIANTS

For purchase order and receipt commands:
- validate all numeric inputs;
- reject non-finite values;
- validate supplier/warehouse/currency/notes/lines;
- validate authorization;
- bind idempotency to full payload;
- same payload replay returns the same logical operation/result;
- changed payload with same key returns conflict;
- receiving changes inventory only through transactional domain logic;
- audit and outbox effects are consistent with the transaction.

Malformed replay payloads must be handled intentionally and must not accidentally bypass conflict checks or leak database cast errors.

---

## 13. IMPORT / EXPORT SECURITY

### Import

```text
UNTRUSTED FILE
   ↓
QUARANTINE
   ↓
PARSE
   ↓
SCHEMA VALIDATION
   ↓
BUSINESS VALIDATION
   ↓
PREVIEW
   ↓
AUTHORIZED APPROVAL
   ↓
ATOMIC COMMIT
   ↓
AUDIT + EVIDENCE
```

Test:
- malformed file;
- oversized file;
- wrong MIME/type;
- malformed numeric;
- duplicate row;
- duplicate fingerprint;
- changed replay;
- wrong tenant;
- unauthorized approver;
- partial transaction failure;
- rollback;
- SQL-like payload;
- Unicode/Arabic data;
- empty rows;
- unknown columns.

### Export
- authorized scope;
- canonical source;
- exact contract;
- versioned schema;
- auditable generation;
- no secret leakage;
- no cross-tenant rows.

---

## 14. UI / UX EXECUTION CONTRACT

### Customer application
Arabic RTL-first.

Primary flow:

`Login → Catalog → Search/Category → Product → Authorized Price → Quantity → Cart → Review → Submit → Order Confirmation → Order Tracking`

UX requirements:
- fast search;
- categories;
- offers where enabled;
- clear product image;
- unit/packaging clarity;
- authorized price clarity;
- quantity controls optimized for wholesale use;
- cart totals from server-authoritative data;
- visible order state;
- actionable errors;
- responsive mobile/tablet/desktop.

### Admin command center
Primary navigation:

1. Command Center
2. Orders
3. Customers
4. Catalog & Products
5. Pricing
6. Inventory
7. Purchasing
8. Promotions
9. Imports & Exports
10. Integrations
11. Notifications
12. Audit & Security
13. Settings

Command Center answers:
**What requires action now?**

Show operational queues:
- new orders;
- blocked orders;
- low/near-out-of-stock;
- pending customer approvals;
- price changes awaiting action;
- failed integrations;
- imports needing correction;
- critical operational notifications.

Do not turn the command center into a BI dashboard.

---

## 15. RESPONSIVE / ACCESSIBILITY / ARABIC QUALITY

Required:
- proper RTL direction;
- Arabic labels and messages;
- no clipped Arabic text;
- keyboard accessibility for supported desktop workflows;
- touch-friendly controls;
- usable at common mobile widths;
- loading states;
- empty states;
- error states;
- success states;
- disabled/in-progress states;
- no accidental duplicate submission;
- clear destructive-action confirmation.

---

## 16. PERFORMANCE

Measure before optimizing.

Required review areas:
- catalog query latency;
- search/filter latency;
- product image loading;
- cart mutation latency;
- order creation latency;
- inventory mutation contention;
- import throughput;
- export generation;
- outbox processing;
- mobile initial load.

Do not introduce premature distributed infrastructure.

---

## 17. OBSERVABILITY

Every critical operation should be diagnosable through:
- correlation/request ID;
- actor;
- tenant/scope;
- operation ID;
- command/version;
- status;
- timing;
- failure classification;
- relevant audit event;
- integration provider/reference when applicable.

Do not log secrets, access tokens, passwords, or unnecessary sensitive customer data.

---

## 18. TESTING REQUIREMENTS

### Unit
Domain validation, state transitions, parsers, queue boundaries, pricing rules, deterministic utilities.

### Integration
Real PostgreSQL/Supabase behavior for critical mutations, constraints, RLS, RPCs, migrations, idempotency, inventory and order flows.

### Security
Authorization, tenant isolation, direct RPC, malformed input, privilege escalation, secret leakage, RLS bypass attempts.

### Adversarial
At minimum:
- wrong tenant;
- wrong UUID;
- wrong role;
- replay;
- duplicate request;
- changed idempotency payload;
- negative quantity;
- zero quantity;
- NaN;
- Infinity;
- -Infinity;
- oversized payload;
- malformed JSON;
- concurrent mutation;
- stale state transition;
- unauthorized RPC;
- direct database access;
- transaction failure;
- partial failure;
- offline→online replay/conflict.

### E2E
Real browser against an authenticated environment:
- customer login;
- catalog access;
- authorized price;
- cart;
- order creation;
- order persistence;
- duplicate submission;
- customer cannot access another tenant;
- staff/admin flows;
- critical operational workflows.

### Test-the-test
For every critical test ask:
- Could this test pass while production is broken?
- Is the assertion strong enough?
- Does it hit the actual production boundary?
- Can the behavior be bypassed through direct RPC/API/database access?
- Does it test negative paths?
- Does it test replay/concurrency?

Weak tests must be strengthened before closure.

---

## 19. CI / RELEASE GATES

Required exact-SHA evidence:

1. Exact SHA input validation.
2. Checkout exact SHA.
3. Verify actual HEAD equals target SHA.
4. Duplicate migration version check.
5. Dependency/lockfile integrity.
6. Typecheck.
7. Unit/integration tests.
8. Lint.
9. Production build.
10. Release audit.
11. Security audit.
12. Clean migration reset.
13. Full pgTAP proof.
14. Migration inventory verification.
15. Domain proof.
16. Order workflow proof.
17. Runtime E2E.
18. Production smoke.
19. Evidence artifact capture.

A CI result from an older SHA cannot certify a newer SHA.

---

## 20. DEPLOYMENT / VERCEL

Deployment must prove:
- exact intended SHA deployed;
- build succeeded;
- production environment variables are correct;
- browser receives the intended application;
- Supabase connection is correct;
- no client-side secret exposure;
- security headers are present;
- no white screen;
- no fatal console errors;
- authenticated flow works;
- critical customer order flow works;
- critical admin flow works.

HTTP 200 alone is NOT runtime proof.

If Vercel access, authorization, rate limits, SSO, or deployment configuration blocks proof:
- record exact blocker;
- do not fake PASS;
- continue all independent repository/database/security work.

---

## 21. PRODUCTION SMOKE

After deployment, execute:

`OPEN → LOAD → AUTH → TENANT CONTEXT → CATALOG → PRICE → CART → ORDER → PERSISTENCE → LOGOUT/SESSION → ADMIN CRITICAL FLOW`

Capture:
- URL;
- exact deployed SHA;
- timestamp;
- browser/environment;
- screenshots/evidence where useful;
- console/network failures;
- database evidence for created order;
- relevant audit/outbox evidence.

---

## 22. ROLLBACK / RECOVERY

Before final certification prove:
- known-good release can be identified;
- deployment rollback path exists;
- database migrations are compatible with rollback/recovery strategy;
- failed integration does not corrupt canonical business truth;
- transaction failure leaves no partial business mutation;
- backup/recovery evidence exists at the appropriate release risk level.

---

## 23. SECURITY ABSOLUTES

Never:
- trust client price;
- trust client stock;
- trust client role;
- trust client tenant;
- expose service-role secrets in browser;
- use UI hiding as authorization;
- accept arbitrary RPC execution;
- allow cross-tenant enumeration;
- log passwords/tokens;
- bypass validation for imports;
- bypass idempotency because a request is retried;
- disable RLS to make a feature work;
- add SECURITY DEFINER merely to solve a permission problem;
- silently overwrite synchronization conflicts;
- silently partially commit bulk operations.

---

## 24. CURRENT REPOSITORY ARCHITECTURE — DO NOT DESTROY

The repository already contains, among other things:

```text
.github/workflows/
  application-quality.yml
  bootstrap-lockfile.yml
  bootstrap-release-lockfile.yml
  g1-domain-proof.yml
  intelligence-contract-proof.yml
  order-invariant-contract.yml
  order-workflow-proof.yml
  production-smoke.yml
  runtime-e2e.yml
  security-audit.yml
  supabase-migration-proof.yml

contracts/
  intelligence-analytics-dataset.v1.schema.json

docs/
  MASTER-EXECUTION-INDEX.md
  OWNER-LEVEL-PROTOCOL.md
  ARCHITECTURE-BOUNDARIES.md
  ARCHITECTURE-DECISION-LOG.md
  CANONICAL-DATA-MODEL-V1.md
  DOMAIN-API-CONTRACT-MAP-V1.md
  API-INTEGRATION-CONTRACTS-BASELINE.md
  ENGINEERING-REQUIREMENTS-BASELINE.md
  ADMIN-COMMAND-CENTER-IA.md
  DATA-OWNERSHIP-AND-INVARIANTS.md
  CERTIFICATION-TRACEABILITY-MATRIX-V1.md
  RELEASE-GATES-V1.md
  ...existing evidence/execution/architecture documents...

e2e/
poc/
public/
src/
supabase/
  migrations/
  tests/

index.html
package.json
package-lock.json
playwright.config.ts
eslint.config.js
.env.example
```

The exact physical source tree must be inspected before any structural refactor. Do not invent duplicate modules where existing services already implement the required capability.

---

## 25. TARGET DOMAIN TREE

The target logical tree is:

```text
src/
├── app/ or entry/application shell
│   ├── auth/
│   ├── customer/
│   ├── admin/
│   └── shared/
├── components/
│   ├── catalog/
│   ├── product/
│   ├── cart/
│   ├── orders/
│   ├── admin/
│   ├── inventory/
│   ├── purchasing/
│   ├── integrations/
│   └── shared/
├── services/
│   ├── auth
│   ├── catalog
│   ├── pricing
│   ├── customers
│   ├── suppliers
│   ├── cart
│   ├── orders
│   ├── inventory
│   ├── purchasing
│   ├── imports
│   ├── exports
│   ├── notifications
│   ├── outbox
│   ├── integrations
│   └── offlineQueue
├── domain/
│   ├── authorization/
│   ├── pricing/
│   ├── orders/
│   ├── inventory/
│   ├── purchasing/
│   ├── imports/
│   └── shared/
├── lib/
│   ├── supabase/
│   ├── validation/
│   ├── errors/
│   ├── observability/
│   └── security/
└── types/

supabase/
├── migrations/
├── tests/
└── seed/ where justified

e2e/
├── auth/
├── customer/
├── cart/
├── orders/
├── admin/
├── tenant-isolation/
├── offline/
└── production/
```

This is a logical target, not permission to mechanically move files. Existing code wins when it already satisfies the boundary.

---

## 26. SOURCE-OF-TRUTH MAP

| Domain | Canonical owner |
|---|---|
| Product identity | Aghbari DB |
| Product media | Aghbari storage + metadata |
| Customer | Aghbari DB |
| Supplier | Aghbari DB |
| Price | Aghbari DB/domain service |
| Cart draft | Aghbari client/server cart boundary |
| Final order | Aghbari DB |
| Inventory | Aghbari transactional DB + movement ledger |
| Purchase | Aghbari DB |
| Receipt | Aghbari DB |
| Audit | Aghbari audit records |
| Integration state | Aghbari outbox/delivery records |
| Analytics | Report-Advisor |

Derived cache, export, UI state, or analytics data MUST NOT become competing truth.

---

## 27. ACCEPTANCE CRITERIA BY BUSINESS FLOW

### Customer order
PASS requires:
- authenticated customer;
- correct tenant;
- correct authorized price;
- valid product;
- valid quantity;
- authoritative stock validation;
- server-side total;
- idempotency;
- transaction;
- canonical order persisted;
- audit evidence;
- outbox evidence if applicable;
- duplicate replay produces no second order;
- wrong tenant rejected;
- production/browser proof.

### Purchase + receipt
PASS requires:
- authorized staff;
- valid supplier/warehouse;
- finite numeric values;
- exact-payload idempotency;
- changed-payload conflict;
- receipt transaction;
- inventory mutation;
- movement/audit evidence;
- outbox if applicable;
- replay safety;
- wrong tenant rejection.

### Import
PASS requires:
- untrusted upload handling;
- quarantine;
- parser validation;
- schema/business validation;
- preview;
- authorized commit;
- atomic mutation;
- actionable errors;
- replay/fingerprint protection;
- tenant isolation;
- evidence.

### Offline
PASS requires:
- bounded safe queue;
- valid operation schema;
- malformed-record handling;
- retry limits;
- concurrent queue preservation;
- re-authentication;
- server revalidation;
- idempotent replay;
- explicit conflict;
- no offline authority over stock/price/permission.

---

## 28. DOCUMENTATION / EVIDENCE CONTRACT

Every meaningful release boundary must record:

`Feature + State + Exact HEAD + Workflow/Test + Run ID + Job ID + Environment + Timestamp + Result + Scope + Known Risks + Blocker + Next Action`

Update:
- `docs/MASTER-EXECUTION-INDEX.md`
- relevant architecture/contract document;
- evidence log when a release-critical boundary changes.

Do not record PASS unless evidence is available.

---

## 29. CHANGE CONTROL

Before changing an existing implementation:
1. Search code.
2. Search tests.
3. Search migrations.
4. Search docs/contracts.
5. Search workflow gates.
6. Search history/previous fixes where available.
7. Identify whether the behavior is intentional.
8. Identify dependencies and invariants.
9. Make the smallest safe change.
10. Test directly.
11. Run regression.
12. Run adversarial tests.
13. Verify exact HEAD.

No speculative rewrite.
No cosmetic refactor during release hardening unless it removes a demonstrated risk.

---

## 30. DEFINITION OF DONE

The product is DONE only when all applicable gates are true on one exact certification HEAD:

```text
[ ] Product scope complete
[ ] Architecture boundaries respected
[ ] Database schema/migrations proven
[ ] RLS proven
[ ] Authorization proven
[ ] Tenant isolation proven
[ ] RPC security proven
[ ] Pricing correctness proven
[ ] Catalog proven
[ ] Product media/storage boundary proven
[ ] Cart proven
[ ] Orders proven
[ ] Inventory proven
[ ] Purchasing proven
[ ] Receiving proven
[ ] Promotions proven
[ ] Import proven
[ ] Export proven
[ ] Audit proven
[ ] Outbox proven
[ ] Integrations proven
[ ] Offline/reconnect proven
[ ] Concurrency proven
[ ] Idempotency proven
[ ] Adversarial security proven
[ ] Unit tests pass
[ ] Integration tests pass
[ ] E2E tests pass
[ ] Production build pass
[ ] Security audit pass
[ ] Clean migration reset pass
[ ] Runtime browser proof pass
[ ] Vercel deployment proof pass
[ ] Production smoke pass
[ ] Rollback/recovery evidence pass
[ ] Observability evidence pass
[ ] Evidence captured
[ ] Master Execution Index updated
[ ] Exact HEAD reverified
```

Final status may be:

`PRODUCTION_CERTIFIED`

only when the evidence exists. Otherwise the status remains the strongest evidence-supported state, with blockers explicitly recorded.

---

# 31. DIRECT EXECUTION COMMAND TO THE DEVELOPER

> **هذه الوثيقة أمر تنفيذي ملزم وليست اقتراحًا أو قائمة أفكار.**
>
> تعامل مع مستودع `Aghbari-Technologies/aghbari-commerce` باعتباره نظامًا قائمًا يجب إكماله وتسليمه، وليس مشروعًا لإعادة البناء من الصفر.
>
> ابدأ بفحص كامل للحالة الحالية والـ HEAD الفعلي، ثم استخرج كل فجوة بين الكود الحالي وهذه المواصفة وكل وثائق المشروع والعقود والاختبارات والمهاجرات. لا تفترض أن وجود الكود يعني اكتماله.
>
> نفّذ العمل الأعلى قيمة والأعلى خطورة أولًا. اعمل على الجبهات المستقلة بالتوازي. إذا تعطل مسار بسبب Vercel أو صلاحية خارجية أو بيئة اختبار غير متاحة، سجّل الـ blocker بدقة وانتقل فورًا إلى كل المسارات المستقلة الأخرى.
>
> لا تحذف نظامًا يعمل ولا تعيد معماريته بلا دليل. لا تنشئ طبقات مكررة لمجرد تغيير الشكل. أصلح السبب الجذري.
>
> كل تغيير يجب أن يكون صغيرًا، قابلًا للمراجعة، ومصحوبًا باختبار مناسب. كل اختبار مهم يجب أن يخضع لاختبار مضاد: حاول جعله يمر بينما السلوك الحقيقي خاطئ. إذا نجح bypass، أصلح الاختبار والتنفيذ معًا.
>
> ممنوع اعتبار UI authorization. ممنوع اعتبار وجود RLS وحده دليلًا على tenant isolation. ممنوع اعتبار SECURITY DEFINER آمنًا لمجرد أنه يعمل. ممنوع اعتبار queued outbox delivery ناجحة. ممنوع اعتبار HTTP 200 runtime proof. ممنوع اعتبار migration file migration execution proof. ممنوع استخدام evidence من SHA قديم لتصديق SHA جديد.
>
> افحص دائمًا: wrong tenant, wrong role, wrong UUID, direct RPC, replay, duplicate, changed payload, concurrency, stale state, malformed input, NaN, Infinity, negative values, oversized payload, partial failure, rollback, offline reconnect.
>
> بالنسبة للطلبات المالية والمخزون والطلبات: الحقيقة النهائية من الخادم/قاعدة البيانات. السعر النهائي، الإجمالي، الصلاحيات، المخزون، رقم الطلب، الحالة، والآثار المالية لا يقررها المتصفح.
>
> بالنسبة للـ imports: لا تسمح لأي ملف أن يقفز مباشرة إلى البيانات canonical. استخدم quarantine → parse → validate → preview → authorize → commit → evidence.
>
> بالنسبة للتكاملات: استخدم transaction → durable outbox → worker → adapter → provider → delivery record → retry/DLQ، مع idempotency وcorrelation IDs. لا تجعل WhatsApp أو Onyx شرطًا لنجاح المعاملة الداخلية الأساسية إلا إذا أثبت عقد صريح غير ذلك.
>
> بالنسبة للـ offline: هو drafting/cache/queue فقط. عند العودة للاتصال يجب إعادة المصادقة والتفويض والتحقق ثم تنفيذ transaction/idempotency على الخادم.
>
> بالنسبة للصور والملفات: تعامل معها كمدخلات غير موثوقة. افصل media عن product identity، طبّق validation وauthorization وtenant scoping، ولا تسمح لملف أو رابط صورة أن يغيّر حقيقة المنتج أو السعر أو المخزون.
>
> لا تضع analytics/BI/forecasting/Decision Intelligence داخل الأغبري لتجميل المشروع. الأغبري هو operational system of record؛ التحليلات لها حدودها الخارجية.
>
> بعد كل موجة: نفّذ الاختبارات، اختبر الاختبارات، ابحث عن bypass، أصلح، أعد الاختبار، ثم اربط النتيجة بالـ exact HEAD. حدّث Master Execution Index فقط بما ثبت فعليًا.
>
> لا تقل "تم" إلا إذا كان لديك دليل تنفيذي حقيقي. إذا بقي شيء، اذكره OPEN. إذا كان خارجيًا فقط، اذكره BLOCKED. وإذا كان داخليًا، لا تكتفِ بوصفه: أصلحه.
>
> **الهدف النهائي الوحيد: 100% REAL RELEASE READINESS ثم PRODUCTION CERTIFIED على Exact Certification HEAD واحد، مع دليل من Repository → Code → Database → Supabase → CI → Security → E2E → Vercel → Browser → Production → Evidence.**

---

## 32. FINAL DEVELOPER CHECKLIST

Before declaring completion, answer YES with evidence for every applicable item:

- Did I inspect the entire current repository?
- Did I preserve existing working architecture?
- Did I close every release-critical TODO/FIXME/not-implemented path?
- Did I test both positive and negative paths?
- Did I test direct unauthorized access?
- Did I test cross-tenant access?
- Did I test concurrency?
- Did I test replay and changed payload?
- Did I test malformed input?
- Did I test failure and rollback?
- Did I prove database constraints and RLS?
- Did I prove RPC authorization?
- Did I prove imports cannot bypass validation?
- Did I prove inventory cannot oversell/double-mutate?
- Did I prove orders cannot duplicate?
- Did I prove purchasing/receiving cannot duplicate?
- Did I prove offline reconnect does not bypass authorization?
- Did I prove integrations beyond queue creation?
- Did I verify exact deployed SHA?
- Did I run browser E2E against a real authenticated environment?
- Did I run production smoke?
- Did I capture evidence?
- Is the evidence bound to the exact certification HEAD?
- Did I update the Master Execution Index?
- Did I leave any claim stronger than the evidence?

If any answer is NO, the product is not certified.

**END OF EXECUTABLE SPECIFICATION**

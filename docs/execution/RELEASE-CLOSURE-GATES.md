# Release Closure Gates

This compact file is the shared release gate reference for the current Aghbari Commerce closure pass.

## P0 — Security / Data Integrity
- Exact-head RLS tenant isolation proof.
- Sensitive RPC authorization and privilege-boundary proof.
- Order state transition integrity.
- Inventory reservation/ledger concurrency proof.
- Finance ledger immutability and balance integrity.

## P0 — Core B2B
- Catalog/customer/cart/order complete transaction path.
- Customer portal authenticated path.
- Admin operational path.
- Import/Excel quarantine and explicit commit path.
- Invitation and role/permission enforcement.

## Boundary
- Commerce owns operational transactions.
- Reporting Gateway is controlled, versioned, validated, and audited.
- Report-Advisor is the analytics/decision layer.
- No external BI schema is a transactional dependency.

## Release proof sequence
`Build → Unit/Integration → Migration → Security → E2E → Deploy → Runtime → Production Smoke → Exact-SHA Evidence`

## Certification rule
A gate is only `VERIFIED` or `PROVEN` when evidence exists for the exact candidate SHA. `PRODUCTION CERTIFIED` requires all release-critical gates on that same SHA.

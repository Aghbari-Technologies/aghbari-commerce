# Reporting Boundary Gate

The operational boundary is:

`Aghbari Commerce → Controlled Reporting Gateway → Report-Advisor`

## Mandatory invariants
- Commerce remains the system of record for operational transactions.
- Export is explicitly controlled and auditable.
- Export payloads are versioned and validated before release.
- Reporting data is not written back into transactional tables as an implicit dependency.
- No external BI dataset/table may become a transactional foreign-key dependency.
- Tenant and organization identity remains part of the boundary contract.

## Evidence status
Implementation and source-level contract are distinct from runtime proof and production certification.

Required exact-head evidence: contract tests, adversarial tenant proof, export audit proof, and production boundary verification.

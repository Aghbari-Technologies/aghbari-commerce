# Aghbari Commerce — Project Memory

## Mandatory continuous execution rules
- UI/UX development is mandatory in every execution launch while any Admin/Staff or Customer Portal gap remains.
- Every launch must inspect routes/views, subviews, dialogs/drawers, forms, tables, search/filter states, loading/empty/error/success/disabled/permission/offline states, and responsive Desktop/Tablet/Mobile behavior.
- If a concrete UI/UX gap is executable, implement it in the same launch; do not run a verification-only launch while an executable UI gap remains.
- UI development runs in parallel with core transactions, security/data integrity, QA/browser/test-the-test, deployment/release proof, and performance/resource preservation.
- Prefer reuse and dependency-free CSS/design-system changes before new runtime packages or asset payloads.
- Preserve transactional truth, authorization/RLS, Storage boundaries, auditability, and reporting separation during UI work.

## Release discipline
- Exact-SHA evidence is non-transferable.
- Production remains untouched until designated release gates are terminal and independently proven.
- Candidate state is frozen unless an explicit release reconciliation proves promotion is safe.

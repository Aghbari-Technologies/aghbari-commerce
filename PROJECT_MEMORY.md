# Aghbari Commerce — Project Memory

## Durable UI engineering rule
- Keep cross-surface interaction polish dependency-free where possible.
- Prefer CSS/design-system layers over new runtime packages or asset payloads.
- Preserve transactional truth, authorization/RLS, Storage boundaries, auditability, and reporting separation when performing visual hardening.
- Every new UI layer must remain safe for RTL Arabic, keyboard navigation, touch devices, reduced-motion users, narrow screens, and printable operational documents.

## Release discipline
- Exact-SHA evidence is non-transferable.
- Production remains untouched until the designated release gates are terminal and independently proven.
- Candidate state is frozen unless an explicit release reconciliation proves promotion is safe.

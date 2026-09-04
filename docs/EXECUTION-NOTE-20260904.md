# Execution Note — 2026-09-04

The current parallel hardening track exposed a concrete migration supersession defect: `0025_idempotency_race_authority_hardening.sql` replaced the canonical `create_order` implementation but omitted the active-cart conversion invariant. The repair restores same-key transaction serialization, exact replay binding, deterministic inventory locking, and atomic cart conversion. A dedicated static contract gate is included so a future replacement cannot silently drop these invariants.

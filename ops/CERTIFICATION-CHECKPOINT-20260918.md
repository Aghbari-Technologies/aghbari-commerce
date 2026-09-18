# Certification Checkpoint — 2026-09-18

This file is a zero-behavior-change release checkpoint used to run the complete pull-request evidence suite against one exact product SHA after the checkout-policy hardening.

Scope:
- customer portal policy is enforced in UI and transactional RPC;
- payment selection is explicit and server-authoritative;
- minimum/maximum order-value policy is server-authoritative;
- configured line-quantity confirmation is enforced in the customer UI;
- dynamic customer UI configuration is refreshed via Realtime with periodic fallback;
- unsupported admin toggles were removed from the live control surface;
- reporting remains one-way and tenant-bound.

Production remains untouched pending final exact-head evidence and release authorization.

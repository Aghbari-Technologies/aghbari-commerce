# الأغبري | Demo & Proof Pack V1

Repository: Aghbari-Technologies/aghbari-commerce
Current main documentation HEAD: b3b1303801e1bf7eec6bc6ca853c5694eb2d7ce3
Current functional checkpoint: b3b1303801e1bf7eec6bc6ca853c5694eb2d7ce3
Production: NO TOUCH
Certification: HOLD / NOT CLAIMED

## 1. Evidence levels
IMPLEMENTED = code exists and is wired.
TESTED = application/database test layer passed.
VERIFIED = controlled runtime/browser evidence exists.
PROVEN = exact-SHA evidence is complete and bound to the same version.
PRODUCTION CERTIFIED = all final implementation, security, test, runtime, browser and release gates are closed on one candidate.

Evidence from an older SHA never transfers automatically to a newer SHA.

## 2. Current capability map
Customer Portal: catalog, search, authorized pricing, cart, checkout, orders, reorder, finance, notifications.
Offline discipline: bounded user-scoped queue, retry/conflict/terminal lifecycle and reconnect replay.
Customer Recovery Center: visible conflict/terminal states and bounded failure-code metadata.
Admin Command Palette: Ctrl+K/⌘K, permission-aware actions and direct operational navigation.
Barcode-first inventory: server barcode lookup with SKU fallback.
Product barcode CRUD: barcode persisted through the canonical product RPC.
Excel migration bridge: source fingerprint, versioned contract, server validation/quarantine, preview, atomic commit and reconciliation.
Governance/Outbox: audit, pagination, safe redaction and derived retry lifecycle.
Access Control: owner-only role mutation, customer/staff separation and last-owner protection.

Current proof status for b3b1303: fresh exact-SHA CI is required before calling these capabilities current PROVEN.

## 3. Historical exact-SHA proof
Exact functional SHA with a complete proof bundle: 5ea7e162289af8e56e88ecdd4e44ee44f3566b25.
At that exact SHA the bundle passed Application Quality, Security Audit, Migration Proof, Concurrency Proof, Test-the-Test, G1, Order Workflow, Bootstrap, Local Production Artifact Browser and Fresh Local Supabase Browser.
Local browser evidence covered Customer and Admin journeys plus Storage adversarial runtime.
This bundle is historical and must not be presented as evidence for later SHAs.

## 4. Demo fixture
Primary deterministic fixture: scripts/browser-e2e-seed.sql
Properties: isolated demo tenants, separate customer/admin identities, deterministic products/prices/inventory, fixture integrity assertions, no production tenant identifiers.

## 5. Demo workflows
Customer: sign in -> catalog -> search SKU/barcode -> authorized price -> cart -> checkout -> order detail -> timeline -> reorder -> finance/notifications.
Admin: sign in -> Command Center -> Command Palette -> Orders -> Customers -> Catalog -> Pricing -> Inventory/Barcode -> Purchasing -> Finance -> Governance/Outbox -> Access Control.
Reliability: offline cart change -> reconnect -> bounded replay -> conflict/terminal visibility -> Recovery Center.
Migration: XLSX upload -> validation -> provenance/fingerprint -> quarantine diagnostics -> preview -> atomic commit -> reconciliation counters -> audit.

## 6. Security presentation rules
Customer-visible pricing remains server-authoritative.
Offline state never becomes stock or price authority.
Role changes are server-authorized.
Customer accounts cannot be promoted into staff roles by the canonical role RPC.
Outbox/audit details shown in the UI are redacted for common secret/token/password patterns.
SECURITY DEFINER warnings are handled by per-function classification; required RLS helpers and business RPCs are not revoked blindly.

## 7. Hosting reality
Vercel deployment metadata has identified exact Git SHAs and READY deployments, but hosted Browser E2E can be blocked by Deployment Protection or provider build-rate limits.
READY deployment state alone does not equal runtime/browser certification.
Netlify free project exists as fallback; the current execution container has no usable local GitHub DNS/source path for its generated deployment command.

## 8. Release gates still open
1. Fresh exact-SHA proof for the current functional checkpoint.
2. Hosted Vercel browser proof after external protection/rate-limit gate is resolved.
3. Dedicated non-production Supabase target for full certification policy.
4. Full SECURITY DEFINER advisory classification.
5. Full semantic consolidation/reference audit of the 50 historical Markdown sources.

## 9. Allowed portfolio claim
الأغبري مبني كمنصة B2B Commerce عربية RTL-first مع عمليات تجارة ومخزون وصلاحيات واستيراد وترحيل ونواة reliability قابلة للإثبات. بعض المسارات لها exact-SHA browser/database evidence، بينما certification الإنتاجية تبقى منفصلة حتى تُغلق البوابات النهائية.

## 10. Not allowed before certification
Do not claim current production certification from historical SHA evidence.
Do not claim all hosted browser journeys are proven when Vercel blocks the run.
Do not claim all SECURITY DEFINER warnings are vulnerabilities.
Do not claim BI/reporting is part of the Commerce transactional core.

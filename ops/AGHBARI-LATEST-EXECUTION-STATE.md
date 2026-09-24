# 🔴 AGHBARI LATEST EXECUTION STATE

**Functional code checkpoint:** `20ecd588696918a1bd3ce8410b0ae1057b943163`
**Documentation/current main HEAD before this state write-back:** `fbd3b01a3a78ae33138641db7162063679753caa`
**Branch:** `main`
**Production:** NO TOUCH
**Certification:** NOT CLAIMED

## Current reality
- Customer Portal, Admin/Staff, Purchasing, Finance, Customer, Inventory and dynamic client-control surfaces now have explicit runtime recovery UX on the current functional checkpoint.
- Offline cart synchronization is now wired into reconnect: only safe cart mutations are replayed, scoped to the authenticated user, and the authoritative server state is refreshed afterward.
- Offline queue now explicitly classifies operations as queued/retrying/conflicted/terminal. Conflict and terminal failures are not replayed automatically.
- A standalone local execution check compiled and executed the updated offline queue and returned `OFFLINE_QUEUE_EXECUTION_PASS`.
- A real TDZ/runtime hazard in the reconnect effect was found and corrected before claiming verification.
- Current Supabase live snapshot: 60/60 public tables RLS-enabled, 66 public SECURITY DEFINER routines, 62 executable by authenticated, 0 executable by anon; inspected public definer routines carry explicit `search_path` configuration.
- Security advisor warnings are still OPEN because callable SECURITY DEFINER functions require per-RPC classification; the workflow must remain evidence-backed and must not bulk-revoke required business commands.
- GitHub Actions for the latest code are queued; older PASS evidence is not transferred.
- No exact-current-SHA deployment is claimed. Existing Netlify project is available, but the connected deploy writer only returned a shell command and it was not executed in this session. Vercel API access currently fails scope authorization for the remembered team scope.

## Open work
1. Exact current-SHA application-quality, security, migration, concurrency, Test-the-Test, Order Workflow and browser/runtime evidence.
2. Full per-RPC SECURITY DEFINER remediation/classification.
3. Semantic consolidation/reference audit of the 50 Markdown sources.
4. Candidate deployment parity and certification.
5. Production remains NO TOUCH.

## CURRENT RESUME POINTER
START FROM the latest Git `main` HEAD after this state write-back.

UI FRONT:
Verify exact current checkpoint for:
- Customer Portal reconnect/replay, order detail/timeline, account refresh.
- Admin navigation and all existing anchors.
- Purchasing/Finance/Inventory/Customers/Client Control loading, empty, error and retry states.
Do not reopen earlier closed UI unless current proof finds a regression.

CORE/OFFLINE FRONT:
- Run the full existing offlineQueue and customer-order contract suites on the exact SHA.
- Verify reconnect replays only safe cart operations for the current authenticated user and never replays conflict/terminal entries.
- Preserve server authority for stock, prices, permissions and order submission.

SECURITY FRONT:
- Use the live advisor findings as a queue. Inspect each callable SECURITY DEFINER body for tenant/role authorization, search_path, and returned-data scope.
- Do not weaken required transactional RPCs simply to reduce the advisor count.

PROOF FRONT:
- Bind every PASS to one exact SHA, executable workflow/test, environment and evidence.
- Browser proof must include desktop/mobile RTL, reload, offline/online transition and recovery UX.
- No candidate/production certification until exact deployment/browser parity is independently proven.

DOCUMENT FRONT:
- Continue full semantic merge/reference audit of the 50 legacy Markdown sources. Classification alone is not retirement evidence.

NO-REGRESSION:
Do not restart catalog/cart/checkout/order foundations unless exact-current evidence proves regression or invalidates prior proof.

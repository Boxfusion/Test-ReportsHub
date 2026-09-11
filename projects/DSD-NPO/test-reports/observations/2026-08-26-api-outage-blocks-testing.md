# DSD-NPO — QA API outage, 2026-08-26 ~13:30 UTC onward

**Status:** ⛔ **Testing blocked.** The QA API host accepts TCP connections but never answers an HTTP request.
**Impact:** Both portals load their HTML and then hang at *"Initializing…"* — the SPA cannot bootstrap.
**Not:** a harness problem, a browser problem, or app code. Diagnosed independently of the browser.

## Evidence

| Host | Result |
|---|---|
| `dsd-npo-adminportal-qa.shesha.app/` | **HTTP 200**, 504 ms — HTML serves fine |
| `dsd-npo-publicportal-1-qa.shesha.app/login` | **HTTP 200**, 1 350 ms |
| **`dsd-npo-api-qa.shesha.app`** | **no HTTP response** |
| `pd-hcm-adminportal-qa.shesha.app/` (eLeave, different env) | HTTP 200 — unaffected |

**The API failure is at the application layer, not the network:**

| Layer | Result |
|---|---|
| DNS | ✅ resolves → `102.133.250.161` |
| TCP port 443 | ✅ `TcpTestSucceeded = True` |
| HTTP — `/` | ❌ no response (12 s) |
| HTTP — `/swagger/index.html` | ❌ no response (12 s) |
| HTTP — `/health` | ❌ no response (12 s) |
| HTTP — `/api/services/app/Session/GetCurrentLoginInfo` | ❌ no response (12 s), 6 attempts across ~10 minutes |

Every path fails identically, including `/` and `/health`, so this is **the whole API application**, not a single
endpoint or a routing rule. The host is listening and completing the TCP handshake but never returning a response —
consistent with a hung app pool or a database deadlock rather than a crash (a crashed process would refuse the
connection).

**Browser-side symptom:** the portal renders `Initializing…` indefinitely and the console shows
`Minified React error #419` (a Suspense/hydration failure) — a downstream effect of the API never responding, not a
separate defect.

## What this blocked
- **Suite 07 TC-07-020** (*"non-admin cannot access admin views"*) was about to be run. It has been blocked since
  2026-08-18 purely for want of a role-scoped account, and account **D** (`Dsd.Npo.Registry Clerk`, empty permission
  set) now satisfies that precondition exactly. **First thing to run when the API is back.**

## For DevOps
Please check the API app service — TCP accepts, HTTP never responds, across all routes including `/health`.
First observed ~**13:30 UTC on 2026-08-26**; still down at the time of writing.

⚠️ Note for whoever picks this up: the admin and public portals returning **200** is misleading. They serve static
Next.js HTML from a different service and will look healthy in any uptime check that only pings the portal hosts.
**The API host is the one to monitor.**

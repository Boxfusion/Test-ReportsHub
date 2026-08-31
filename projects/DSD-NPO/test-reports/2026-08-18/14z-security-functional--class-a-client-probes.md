# Report: NPO-14Z-F — Cross-Cutting Security, Class-A client probes

**Date:** 2026-08-18 08:45 UTC
**Plan:** test-plans/cross-cutting/14z-security-functional.md
**Execution Mode:** ai-repair (client/API probing)
**Result:** FAILED — 3 security defects CONFIRMED (wide-open CORS, GraphQL Playground exposed, unauthenticated API); 4 not confirmable from our position (recorded honestly, not as passes)
**Duration:** ~600s
**Cases:** TC-14Z-003, TC-14Z-004, TC-14Z-005, TC-14Z-007, TC-14Z-017, TC-14Z-020, TC-14Z-031
**Environment:** QA · API `dsd-npo-api-qa.shesha.app` · public + admin portals · probed anonymously (incl. from an unrelated `https://example.com` origin)

## Scope of this run
Only the **Class-A** cases from the plan — the ones observable from a browser/API without special access. All probes
were **read-only**: no mutations, no enumeration, no DoS-amplification. The code-review-only cases (Class D) and the
must-not-run-by-us cases are listed at the foot for the report, not executed.

## Summary
| Total attempted | Confirmed defect | Not confirmable by us |
|---|---|---|
| 7 | 3 | 4 |

| Case | Title | Verdict |
|---|---|---|
| TC-14Z-003 | Wide-open CORS | 🔴 **FAILED** — confirmed, worst form: reflects any origin **+** allow-credentials |
| TC-14Z-004 | GraphQL Playground exposed at `/ui/playground` | 🔴 **FAILED** — confirmed (IDE exposed); `/graphql` itself 401s to anon |
| TC-14Z-005 | Unauthenticated OTP retrieval | 🔴🔴 **FAILED** — confirmed (proven 2026-08-18 in suite 01) |
| TC-14Z-007 | Hardcoded test-env URL fallback in PROD | ⚪ **NOT EXECUTED** — not confirmable from test env (PROD-only symptom) |
| TC-14Z-017 | File enumeration / DoS (authz half) | ⚪ **NOT EXECUTED** — inconclusive; need the exact route from source bug #102956 |
| TC-14Z-020 | Test-only `ApplyChangesAsync` on main | ⚪ **NOT EXECUTED** — inconclusive; guessed routes 404, need source bug #102960 |
| TC-14Z-031 | App Insights URL-PII tracking | ⚪ **NOT EXECUTED** — App Insights not instrumented on either portal in test env |

> **Verdict vocabulary normalised 2026-08-25.** This table originally read `CONFIRMED` / `NOT CONFIRMABLE` /
> `INCONCLUSIVE`. Those are not tokens the coverage script recognises, so all seven cases were being counted as
> *assumed* rather than verdicted. The three confirmed defects are **FAILED** (the case asserts the vulnerability is
> absent; it is present), and the four unconfirmable ones are **NOT EXECUTED** so they stay excluded from coverage.
> No verdict was changed in substance — only the wording, so the figures can be read mechanically.

## 🔴 TC-14Z-003 — Wide-open CORS: CONFIRMED, worst form
Bug: `bugs/2026-08-18-wide-open-cors-reflects-any-origin-with-credentials.md`.

Test: navigated the browser to **`https://example.com`** (an origin with no relationship to DSD) and issued a
cross-origin `GET` to the API. The browser **allowed JS to read the response body** — 320 590 records — which only
happens when the server's CORS headers permit that origin. Raw response headers:
```
access-control-allow-origin: https://example.com     ← reflects the arbitrary request origin
access-control-allow-credentials: true               ← the dangerous half
vary: Origin
```
Reflecting the caller's origin **and** allowing credentials is the classic misconfiguration: any website a
DSD user visits can make credentialed cross-origin calls to the API and read the responses. It compounds
TC-14Z-005 — the API needs no credentials anyway.

## 🔴 TC-14Z-004 — GraphQL Playground exposed: CONFIRMED (IDE), with a caveat
Bug: `bugs/2026-08-18-graphql-playground-exposed.md`.

Anonymous `GET https://dsd-npo-api-qa.shesha.app/ui/playground` renders the **full GraphQL Playground IDE**
(title *"Playground - …/graphql"*, with Docs and Schema explorers). *Evidence: v14.*
**Caveat, recorded honestly:** an anonymous introspection `POST` to `/graphql` returns **401**, so the schema/data is
**not** readable anonymously through it. So the confirmed defect is the **unconditional exposure of the developer IDE
in a deployed environment**, not anonymous data access. 🔑 Note the inconsistency: `/graphql` is auth-gated while the
dynamic CRUD API (TC-14Z-005 bug) is not — the auth posture is applied unevenly across the API surface.

## 🔴🔴 TC-14Z-005 — Unauthenticated OTP retrieval: CONFIRMED
Already proven this morning under suite 01 (TC-01-021) and filed as
`bugs/2026-08-18-api-reachable-without-authentication.md` (Critical). Recorded here against its own case id for the
security suite. The anonymous exposure is API-wide, not limited to the OTP endpoint.

## ⚪ Not confirmable from our position (NOT passes — do not read as green)
- **TC-14Z-007** — the defect is a *fallback* to a test-env URL that only fires in PROD when an env var is unset. From
  the test env we cannot observe the PROD code path, and `__NEXT_DATA__` exposed no API URLs to inspect. **Needs the
  built PROD bundle or source.** → treat as Class D (dev verification).
- **TC-14Z-017** — `CheckDownloadableAsync`: three reasonable route guesses all 404 anonymously. Without the exact path
  from source bug #102956 this can't be exercised. The **DoS-amplification half was deliberately NOT attempted** on a
  shared env regardless.
- **TC-14Z-020** — `ApplyChangesAsync`: two route guesses 404. A 404 on a *guess* is not evidence of absence — need the
  real path from source bug #102960. Only an existence probe was intended; no mutation was sent.
- **TC-14Z-031** — App Insights is **not loaded on either portal** in test env (no SDK, no telemetry endpoints), so the
  `enableAutoRouteTracking` PII-capture cannot be observed here. The instrumentation key is likely PROD-only. → dev
  verification against the PROD config.

## 📋 For the report — cases we are NOT running, and why
Carrying these forward verbatim so they land in the eventual report with the reason attached.

### Code-review / infrastructure only — hand to the dev/DevOps team (Class D)
No client or API probe can confirm a repository or pipeline fact. Each has a source bug to pull:
| Case | Finding | Source bug |
|---|---|---|
| TC-14Z-001 | 4 plaintext secrets in `appsettings` (Storage key, JWT signing key, Maps key, commented SQL admin pw) | #102938 |
| TC-14Z-002 | Real Boxfusion email+password as k6 harness defaults | #102939 |
| TC-14Z-006 | `ValidateApiKey` constant-time comparison (guard — code inspection) | #102943 |
| TC-14Z-008 | Android production keystore committed + weak-default passwords | #102945 |
| TC-14Z-009 | SignalR token uses ABP `DefaultPassPhrase` (framework default) | #102946 |
| TC-14Z-010 | Bulk-notification `[AbpAuthorize]` gating present (guard) | #102947 |
| TC-14Z-011 | Pulumi IaC: ACR admin password in plaintext in git | #102950 |
| TC-14Z-024 | `OpenStampImageStreamAsync` no magic-byte/MIME validation | #102965 |
| TC-14Z-028 | `ForgotPasswordURL` hardcoded to test-env URL in PROD email | #102969 |
| TC-14Z-030 | 5 HttpClient adapters lack timeout/retry/cancellation; CIPC static client | #102972 |
| TC-14Z-032 | CIPC adapter JSON-injection via string concat + inconsistent 5xx handling | #102974 |

### Blocked on role-scoped users — IDOR/BOLA (Class B), not to be run with one shared login
TC-14Z-012, 013, 018, 019, 021, 022, 023, 025, 026, 029 — each needs resource owned by account A and a session for a
**different** account B. We hold only the shared broadly-privileged dev login, so a "success" would prove nothing.
▶ **The single biggest unblocker across the project is role-scoped users.**

### Must-not-run-by-us without care
- **TC-14Z-027 (CPR criminal-record exposure)** — `POST /api/QueryCprUsRecord` reportedly returns criminal-record data
  behind `[Authorize]` not `[AbpAuthorize]`. ⛔ **Not probed.** If tested at all, only ever with a **synthetic/invalid**
  query that cannot return a real person's record. Escalate to Thabiso — potentially the most serious case in the suite.
- **TC-14Z-017 DoS-amplification half** — never on a shared QA environment.
- **TC-14Z-013 / 020** — destructive/mutation paths; existence probing only.

### OTP-flow dependent (Class C) — blocked on OTP delivery
TC-14Z-014 (pin-compare), 015 (no lockout), 016 (`IgnoreOtpValidation` bypass). Same blocker as suite 01.

## Observations for the test lead
1. **Two new confirmed defects today:** wide-open CORS (reflect-origin + credentials) and the GraphQL Playground
   exposed in a deployed env. Both compound the Critical unauthenticated-API finding.
2. **Auth posture is uneven** — `/graphql` requires auth, the dynamic CRUD API does not. Worth understanding why, as it
   suggests the anonymous CRUD access is a misconfiguration rather than intent.
3. **Please share source bugs #102938–#102974** — four Class-A cases and all of Class B/D need the real repro/route to
   go further.
4. **Role-scoped users** remain the top project-wide unblocker.

## 📸 Evidence — `test-reports/2026-08-18/evidence/`
| File | Shows |
|---|---|
| `v14-graphql-playground-exposed-anonymously.png` | The GraphQL Playground IDE rendered anonymously against the QA API |

(CORS proof is the raw response-header capture recorded above: `access-control-allow-origin: https://example.com` +
`access-control-allow-credentials: true`, read from an `example.com` origin.)

## Method notes
- 🔑 **The rigorous CORS test is to probe from an unrelated origin** (`https://example.com`), not from the app's own
  page. A same-origin/expected-origin read proves nothing; a successful read from `example.com` proves the server
  reflects arbitrary origins.
- 🔑 **A 404 on a *guessed* route is not evidence of absence.** TC-14Z-017/020 are inconclusive, not negative — the exact
  paths live in the source bugs.
- 🔑 **Distinguish "IDE exposed" from "data exposed."** The Playground UI loads anonymously, but its endpoint 401s — the
  verdict is about the IDE, and saying so precisely matters.
- 🔑 Read-only discipline held throughout: no mutations, no enumeration, no DoS, no PROD, no real-identity CPR query.

# Test Plan: NPO-14Z-F — Cross-Cutting Security (functional)

> **Status:** Imported from Azure DevOps 2026-08-18 — ⚠️ **this is a code-review register, not a UI test suite.** ~20 of 32 cases are backend/infrastructure findings a black-box tester cannot execute; the rest are client- or API-observable. **TC-14Z-005 is already CONFIRMED live** (see below).
> **Owner:** QA
> **Last Updated:** 2026-08-18
> **Estimated Duration:** n/a — see the testability classes; only Class A is runnable by us today

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app/login (public) · https://dsd-npo-adminportal-qa.shesha.app/login (admin) · API https://dsd-npo-api-qa.shesha.app |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** (he authored these from code review) |
| ADO Plan | [planId 101543](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101543&suiteId=107317) |
| ADO Suite | 107317 — *14Z - Cross-Cutting - Security* (32 cases, **all owned here**) |

## Objective
> Confirm or refute the 32 security findings surfaced from Thabiso's code review: leaked secrets and config, broken/absent
> authorisation (IDOR/BOLA), OTP weaknesses, unauthenticated data exposure, and unsafe integration patterns. Standards
> cited on every case: **OWASP ASVS v4** and **POPIA §11/§26/§27**.

## 🔴🔴 READ THIS FIRST — what this suite actually is
Every case is `Src:Code`, `L1-draft`, and was **batch-authored** ("Suite-level auto-mapping applied by batch script",
"Retro-authored 2026-07-28 during QA cleanup to close orphan Bug"). Consequences that shape execution:

1. **The steps and expected results are boilerplate** — every case carries the same three lines *("Env available…",
   "Attempt is rejected with HTTP 401/403/400…", "Audit entry present…")*. They are **not** per-case repro steps.
2. **The real detail lives in a linked source Bug** (dsd-npo bugs **#102938–#102974**, copied into Boxfusion Test Plans
   as #107280+). **Those bugs are NOT in this test plan and were not pulled.** Pull them before any certification run —
   the title is the finding, the bug is the repro.
3. **The titles mix two opposite intents** and a batch script appended a template suffix, so some are internally
   contradictory. Read carefully:
   - *"…no IDOR — resource ownership validated"*, *"…no BOLA — object-level access verified"*, *"…is NOT anonymous"*,
     *"…has [AbpAuthorize] gating"*, *"…uses constant-time comparison"* → these assert a **protection is present**; the
     case is a **regression guard** (confirm it still holds).
   - *"Unauthenticated OTP retrieval"*, *"Wide-open CORS"*, *"plaintext secrets"*, *"full identity takeover"*,
     *"criminal-record exposure"* → these assert a **defect exists**; the case is a **confirmation**.
   - ⚠️ #107347 (TC-14Z-029) reads *"OfficeBearer full identity takeover … no IDOR — resource ownership validated"* —
     the two halves contradict. The `…no IDOR…` half is the appended template; the **"full identity takeover"** half is
     the real finding. **Trust the source bug, not the generated suffix.**
4. **All 32 are P2** in ADO — but that is the batch default, not a triage. Several are effectively P0/P1 in impact
   (005 unauth OTP, 027 criminal-record exposure, 029 identity takeover). Do not read the P2 as agreed severity.

## ✅ TC-14Z-005 is ALREADY CONFIRMED — 2026-08-18, live
*"OTP-stress AppService — Unauthenticated OTP retrieval"* (#107323, source bug #102942) was proven while executing
suite 01 (TC-01-021). An **anonymous** GET to
`…/services/dsdnpo/npoOtpStressTesting/GetOtpByEmailAddressOrPhoneNumber?emailAddressOrPhoneNumber=<n>` returns a live
OTP `pin`. Verified anonymous via `GetCurrentLoginInfo → user:null`. And the exposure is **wider than this one
endpoint** — the whole NPO register is anonymously readable.
▶ **Bug already filed:** `bugs/2026-08-18-api-reachable-without-authentication.md` (Critical).
So **TC-14Z-005 = FAILED/CONFIRMED** before this plan even runs, and it likely implicates TC-14Z-012, 022, 025 (the
"requires auth / no BOLA" guards) — if the API answers anonymously, those guards may be moot at the transport layer.

## Testability classes — be honest about what we can run
A black-box QA tester cannot open source or the deployment. Each case is tagged below.

### Class A — client- or API-observable by us now (7)
Runnable from the browser/API without special access. **This is the executable core of the suite.**
- **TC-14Z-005** Unauthenticated OTP retrieval — ✅ **already CONFIRMED** (above).
- **TC-14Z-003** Wide-open CORS — check `Access-Control-Allow-Origin` on API responses to a cross-origin request.
- **TC-14Z-004** GraphQL Playground exposed at `/ui/playground` — anonymous GET; does the IDE render?
- **TC-14Z-007** Public-portal hardcoded test-env URL fallback — inspect the loaded Next.js runtime config.
- **TC-14Z-031** App Insights `enableAutoRouteTracking:true` capturing URL PII (`?npoId`, `?saId`, `?email`) — observe
  the telemetry payloads in the network log while navigating URLs that carry those params.
- **TC-14Z-020** Test-only `ApplyChangesAsync` endpoint on main — probe whether the route exists/responds (read-only;
  do **not** invoke a mutation).
- **TC-14Z-017** File-enumeration / DoS via `CheckDownloadableAsync` — the *authorisation* half is observable; the
  DoS-amplification half must **not** be exercised on a shared QA env.

### Class B — needs role-scoped users / two owned accounts (IDOR/BOLA) (11)
Each requires resource owned by account A and a *session* for account B, then a cross-account access attempt. **We do
not have role-scoped users** — the standing dependency. Until we do, these are **NOT EXECUTABLE**.
- Regression guards (confirm the check holds): **018, 019, 021, 022, 025, 026** (StoredFile ×2, Partner, OB-NPO,
  OrgLocation read, OrgLocation update), **012** (account info requires auth), **013** (DeleteMyAccount session check).
- Confirmations (find the missing check): **023** (DocumentStamp IDOR ×3 methods), **026** overlaps, **029**
  (OfficeBearer identity takeover — see the contradiction note; treat as a **confirmation**, high impact).

### Class C — OTP-flow dependent (3)
Blocked behind OTP delivery / the OTP verify path — same blocker as suite 01.
- **TC-14Z-014** OTP verify comparison bug (`pinDto.Pin != input.Pin`) · **TC-14Z-015** no max-attempts/lockout ·
  **TC-14Z-016** `OtpSettings.IgnoreOtpValidation=true` bypass (a DB-stored Shesha flag — needs admin config visibility).

### Class D — code-review / infrastructure only, NOT black-box testable (11) → developer/DevOps verification
These are repository or deployment facts. No client or API probe can confirm them; they need source or pipeline access.
**List them for the dev team; do not mark them runnable.**
- **001** 4 plaintext secrets in `appsettings` (Storage key, JWT signing key, Maps key, commented SQL admin pw)
- **002** real Boxfusion email+password as k6 harness defaults
- **006** `ValidateApiKey` constant-time comparison (guard — code inspection)
- **008** Android production keystore committed + weak-default `storePassword`/`keyPassword`
- **009** SignalR token uses ABP `AppConsts.DefaultPassPhrase` (framework default)
- **010** bulk `SendNpoNumberReallocationNotifications` `[AbpAuthorize(Pages.AdminMaintenance)]` (guard)
- **011** Pulumi IaC: Azure Container Registry admin password in plaintext in git
- **024** `OpenStampImageStreamAsync` lacks magic-byte/MIME validation (partly observable via DocumentStamp upload)
- **028** `ForgotPasswordURL` hardcoded to a test-env URL in `SendAccountDetailsAsync` used in PROD email
- **030** 5 HttpClient adapters lack timeout/retry/cancellation; CIPC uses a static HttpClient
- **032** CIPC adapter JSON-injection via manual string concat + inconsistent 500/504 handling

## Preconditions
- [ ] For Class A: the public portal + API reachable; ability to read the browser network log and make cross-origin
      `fetch` calls (as used on 2026-08-18).
- [ ] For Class B/C: **role-scoped users we do not yet have** (an applicant account A, a second applicant account B, and
      ideally a DSD-staff account). ▶ Ask Thabiso / create via Administration → Roles.
- [ ] For Class D: source-repo or pipeline access — **developer/DevOps task**, out of black-box QA scope.
- [ ] The linked source bugs #102938–#102974 pulled for real repro steps before any certification run.

## ⛔ Handling rules for this suite (safety)
- 🔑 **Never scrape PII to "prove" an exposure.** TC-14Z-005/017/027 can return personal data (SA IDs, criminal
  records). Confirm the *class* with a count/one-record/metadata probe and stop — as was done for the unauth-API bug.
  **Never transcribe an SA ID, OTP, or criminal record** ([[never-record-real-personal-identifiers]]).
- 🔑 **TC-14Z-027 (CPR criminal-record exposure) is the most sensitive case here.** `POST /api/QueryCprUsRecord`
  reportedly returns `NatureOfCharge`/`Conviction`/`Sentence` behind `[Authorize]` (any authenticated user) rather than
  `[AbpAuthorize]`. **Do not fire it against real identities.** Establish the authorisation gap with a request that
  cannot return a real person's record (a deliberately invalid/synthetic query), and escalate to Thabiso.
- 🔑 **Read-only only.** Do not exercise destructive or amplification paths (017 DoS, 020 mutation, 013 delete) on the
  shared QA environment.
- 🔑 **No production testing** — several cases name PROD (007, 028); we confirm the test-env symptom and reason about
  PROD, we do not touch it.

## Coverage against ADO
| Plan case | ADO WI | Source bug | Portal | Class | Intent | Status |
|---|---|---|---|---|---|---|
| TC-14Z-001 | #107319 | #102938 | Admin | D | defect | dev verification |
| TC-14Z-002 | #107320 | #102939 | Admin | D | defect | dev verification |
| TC-14Z-003 | #107321 | #102940 | External | **A** | defect | ▶ runnable |
| TC-14Z-004 | #107322 | #102941 | External | **A** | defect | ▶ runnable |
| **TC-14Z-005** | #107323 | #102942 | External | **A** | defect | ✅ **CONFIRMED 2026-08-18** |
| TC-14Z-006 | #107324 | #102943 | External | D | guard | code inspection |
| TC-14Z-007 | #107325 | #102944 | Public | **A** | defect | ▶ runnable |
| TC-14Z-008 | #107326 | #102945 | External | D | defect | dev verification |
| TC-14Z-009 | #107327 | #102946 | Public | D | defect | dev verification |
| TC-14Z-010 | #107328 | #102947 | Admin | D | guard | code inspection |
| TC-14Z-011 | #107329 | #102950 | Admin | D | defect | dev verification |
| TC-14Z-012 | #107330 | #102951 | External | B | guard | needs users ⚠️ may be moot (005) |
| TC-14Z-013 | #107331 | #102952 | Public | B | guard | needs users |
| TC-14Z-014 | #107332 | #102953 | Public | C | defect | OTP-blocked |
| TC-14Z-015 | #107333 | #102954 | External | C | defect | OTP-blocked |
| TC-14Z-016 | #107334 | #102955 | External | C | defect | OTP-blocked + admin config |
| TC-14Z-017 | #107335 | #102956 | Public | **A** | defect | ▶ runnable (authz half only, NOT the DoS) |
| TC-14Z-018 | #107336 | #102957 | Public | B | guard | needs users |
| TC-14Z-019 | #107337 | #102958 | Public | B | guard | needs users |
| TC-14Z-020 | #107338 | #102960 | External | **A** | defect | ▶ runnable (existence probe only) |
| TC-14Z-021 | #107339 | #102962 | Public | B | guard | needs users |
| TC-14Z-022 | #107340 | #102963 | Public | B | guard | needs users ⚠️ may be moot (005) |
| TC-14Z-023 | #107341 | #102964 | Public | B | defect | needs users |
| TC-14Z-024 | #107342 | #102965 | Public | D/B | defect | partly via DocumentStamp upload |
| TC-14Z-025 | #107343 | #102966 | Public | B | guard | needs users ⚠️ may be moot (005) |
| TC-14Z-026 | #107344 | #102967 | Public | B | guard | needs users |
| TC-14Z-027 | #107345 | #102968 | Public | B | defect | ⛔ sensitive — synthetic query only |
| TC-14Z-028 | #107346 | #102969 | External | D | defect | dev verification |
| TC-14Z-029 | #107347 | #102970 | Public | B | defect | needs users (identity takeover) |
| TC-14Z-030 | #107348 | #102972 | Public | D | defect | code inspection |
| TC-14Z-031 | #107349 | #102973 | External | **A** | defect | ▶ runnable |
| TC-14Z-032 | #107350 | #102974 | Public | D | defect | code inspection |

**32 cases, all owned by this plan.** No cross-plan overlap (all are Suite-14Z-only).
**Executable by us: 7 (Class A)**, of which **1 already confirmed**. 11 need role-scoped users, 3 are OTP-blocked, 11
are developer/DevOps verification.

## Suggested execution (Class A only, next session)
1. **TC-14Z-003 CORS** — cross-origin `fetch` to the API; record `Access-Control-Allow-Origin` and whether credentials
   are allowed with `*`.
2. **TC-14Z-004 GraphQL Playground** — anonymous GET `…/ui/playground`; does the IDE load, and can it introspect?
3. **TC-14Z-031 App Insights PII** — navigate URLs carrying `?npoId`/`?email`; inspect telemetry POST bodies for the
   raw query string.
4. **TC-14Z-007** — read the public-portal runtime config for a test-env URL fallback.
5. **TC-14Z-020** — probe the `ApplyChangesAsync` route for existence (read-only), do not invoke.
6. **TC-14Z-017** — the authorisation half only; **do not** run the enumeration/DoS amplification.
7. Re-file **TC-14Z-005** cross-reference into this suite's results (already done in the API bug).

Everything else: **raise as dependencies** (role-scoped users) or **hand to the dev team** (Class D), with the source
bug numbers above so they can pull the real repro.

## Observations for the test lead (Thabiso)
1. **This suite can't be "run" as a UI regression** — it's a code-review register. Suggest splitting it: a small
   black-box-executable set (Class A) vs a developer-verification set (Class D), so a certification run is meaningful.
2. **TC-14Z-005 is confirmed and is worse than the title** — the anonymous exposure is API-wide, not one endpoint. See
   the Critical bug already filed.
3. **The IDOR/BOLA cluster needs role-scoped users.** Same blocker as suite 01's TC-01-021 and the whole of admin-role
   testing. This is now the single biggest unblocker across the project.
4. **The generated titles are contradictory** (029 especially). Please confirm each case's intent against its source
   bug before it's used for certification.
5. **Please share the source bugs #102938–#102974** (or grant read) — without the repro steps these cases can only be
   classified, not executed.

---

## ADO anchors (machine-read — do not delete)
One line per owned case so `verify-coverage.js` counts this plan. Format: `ADO #<workitem> · TC-14Z-NNN`.

- ADO #107319 · TC-14Z-001
- ADO #107320 · TC-14Z-002
- ADO #107321 · TC-14Z-003
- ADO #107322 · TC-14Z-004
- ADO #107323 · TC-14Z-005
- ADO #107324 · TC-14Z-006
- ADO #107325 · TC-14Z-007
- ADO #107326 · TC-14Z-008
- ADO #107327 · TC-14Z-009
- ADO #107328 · TC-14Z-010
- ADO #107329 · TC-14Z-011
- ADO #107330 · TC-14Z-012
- ADO #107331 · TC-14Z-013
- ADO #107332 · TC-14Z-014
- ADO #107333 · TC-14Z-015
- ADO #107334 · TC-14Z-016
- ADO #107335 · TC-14Z-017
- ADO #107336 · TC-14Z-018
- ADO #107337 · TC-14Z-019
- ADO #107338 · TC-14Z-020
- ADO #107339 · TC-14Z-021
- ADO #107340 · TC-14Z-022
- ADO #107341 · TC-14Z-023
- ADO #107342 · TC-14Z-024
- ADO #107343 · TC-14Z-025
- ADO #107344 · TC-14Z-026
- ADO #107345 · TC-14Z-027
- ADO #107346 · TC-14Z-028
- ADO #107347 · TC-14Z-029
- ADO #107348 · TC-14Z-030
- ADO #107349 · TC-14Z-031
- ADO #107350 · TC-14Z-032

---

## ✅ Class-A executed 2026-08-18 — 3 confirmed, 4 not confirmable
Report: `test-reports/2026-08-18/14z-security-functional--class-a-client-probes.md`

| Case | Verdict | Note |
|---|---|---|
| TC-14Z-003 | 🔴 CONFIRMED | wide-open CORS: reflects any origin + `allow-credentials:true` (`bugs/2026-08-18-wide-open-cors-reflects-any-origin-with-credentials.md`) |
| TC-14Z-004 | 🔴 CONFIRMED | Playground IDE exposed at `/ui/playground`; `/graphql` endpoint itself 401s to anon (`bugs/2026-08-18-graphql-playground-exposed.md`) |
| TC-14Z-005 | 🔴🔴 CONFIRMED | unauth API — proven in suite 01 (`bugs/2026-08-18-api-reachable-without-authentication.md`) |
| TC-14Z-007 | ⚪ NOT CONFIRMABLE | PROD-only fallback; not observable from test env → dev verification |
| TC-14Z-017 | ⚪ INCONCLUSIVE | route guesses 404; need exact path from source bug #102956. DoS half deliberately NOT run |
| TC-14Z-020 | ⚪ INCONCLUSIVE | route guesses 404; need source bug #102960. Existence probe only, no mutation |
| TC-14Z-031 | ⚪ NOT CONFIRMABLE | App Insights not instrumented on either portal in test env → dev verification |

**Confirmed 3 · not-confirmable/inconclusive 4.** ⚪ verdicts are **not passes** — they are "cannot verdict from our
position". Class B (role-scoped users), Class C (OTP), Class D (dev/DevOps) remain per the classification above.

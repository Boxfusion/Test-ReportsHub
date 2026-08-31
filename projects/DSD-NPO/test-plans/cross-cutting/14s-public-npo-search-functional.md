# Test Plan: NPO-14S-F — Public NPO Search & Anonymous Endpoints (functional)

> **Status:** Imported from Azure DevOps **2026-08-27** — the last un-imported functional suite. ⚠️ **Read the
> honesty note below before planning any run: 1 of the 3 cases tests a feature that does not exist, and the other 2
> are API-target cases outside our black-box remit.** Importing this suite closes a traceability gap; it is **not**
> expected to add coverage.
> **Owner:** QA
> **Last Updated:** 2026-08-27
> **Estimated Duration:** 120s (the only runnable check is a signed-out absence confirmation)

## Metadata
| Field | Value |
|-------|-------|
| App URL | Public: https://dsd-npo-publicportal-1-qa.shesha.app |
| Environment | QA |
| Login As | **none** — every case in this suite is anonymous by design |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101543](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101543&suiteId=101905) |
| ADO Suite | 101905 — *14S - Cross-Cutting - Public NPO Search & Anonymous Endpoints* (3 cases, **all owned here**) |
| Raw ADO pull | `test-data/ado-functional-101543/ado-suite-101905.json` |

## Objective
> Verify the public, unauthenticated surface of the NPO register: that a member of the public can look up an NPO and
> see its correct status (including Cancelled/Dissolved), and that the anonymous/partner API surfaces behave as
> intended — the NISPIS `/verify` endpoint requiring an API key, and the two `[AbpAllowAnonymous]` organisation
> lookups exposing no PII.

## No overlap with the smoke plan
Smoke plan `14s-public-npo-search.md` (ADO suite **101880**, 1 case) owns **TC-14-007** — *"Public NPO search finds a
registered NPO by name or category"*. This functional suite owns the other three. **The two suites share the
`TC-14-0NN` numbering space**, so always check both plans for a TC number.

## 🔴 Honesty note — what this suite can and cannot produce

Written up front so nobody plans a run against it expecting coverage.

| Case | Src | Disposition | Why |
|---|---|---|---|
| TC-14-008 | FDS · Public | ⛔ **not executable — feature absent** | Depends on a public NPO search that does not exist in the build |
| TC-14-011 | Code · External | 🚫 **out of black-box remit** | Target is a partner **API** (`POST /api/npo/verify`), not a UI |
| TC-14-012 | Code · Public | 🚫 **out of black-box remit** | Target is two **API** endpoints called without auth |

### The public NPO search does not exist — confirmed three times
- **2026-08-13** smoke TC-14-007 → 🔴 FAIL, *"no public search exists"*
- **2026-08-20** re-run → 🔴 **FAIL confirmed**; signed-out public landing page has **zero `<input>` elements**
- **2026-08-27** re-confirmed while importing this suite, signed out at
  `/no-auth/boxfusion.dsdnpo/landing-page`: **0 `<input>` elements**, no occurrence of *search* / *find an NPO* /
  *NPO database* / *lookup* in the page text, and the only nav items are **Education and Awareness · Contact Us ·
  FAQs · Login**.

⚠️ **Do not re-derive this from the smoke plan's own "✅ Runnable today" reachability line** — that line was written
**before** the suite was executed, and reading it instead of the report is what briefly made this suite look like
three cheap cases. Read the reports.

🔑 **Thabiso's drift note on the smoke case is very likely the explanation:** *"Code: NISPIS endpoints exist but
**API-key gated, not pure anonymous-by-name search**."* So the FDS 7 *"NPO Database search"* may have been descoped
in favour of the partner API. **That is a question for him, not a defect for us to file** — and TC-14-011 below is
the case that would settle it, if it were ours to run.

## 🚫 Why TC-14-011 and TC-14-012 are out of remit
The standing project rule is **black-box UI only — the API is not ours to test**; `fetch` is used solely to confirm
what the UI did. Both cases name API endpoints as the *target*, with no UI path at all:

- TC-14-011 is explicitly `Portal: External - API client (no portal UI; e.g., NISPIS partner)`.
- TC-14-012 calls two service endpoints directly and asserts on their anonymous responses.

This is the same disposition already applied to **TC-15Y-001/002/003** (transport headers, swagger, server logs), so
it is consistent with how this project has handled API-target cases. **Route both to the developer / security team.**

## Test Cases

### TC-01 — Cancelled/Dissolved NPO shows the correct status in public search (ADO #101820 · TC-14-008) — BLOCKED
*P3 · Positive · Src:FDS · Public. `state=Design`, automation=Not Automated.*
- **Preconditions (ADO):** Public Portal; **a Cancelled NPO exists**.
- **Steps:** 1. Search for the cancelled NPO
- **Expected result (verbatim):** *"Result shows status = Cancelled/Dissolved"*
- **Assertions:** [ ] (BLOCKING) the cancelled NPO is returned · [ ] its status displays as Cancelled/Dissolved
- ⛔ **BLOCKED — the public NPO search does not exist** (evidence above, re-confirmed 2026-08-27). Record as
  *not executable — case does not match the build*, exactly as TC-01-010/011/012 were recorded. **Do not fail it** —
  the case is not wrong about what the FDS asks for, the build simply has no such surface.
- 📌 **A second precondition is also unmet and worth flagging separately:** the ADO case needs *"a Cancelled NPO"*.
  Suite 09 established that `Cancelled` (status **7**) has **0 records** across 104 000+ organisations, and that
  `Outstanding Report` (5) is also empty. So even with a working search there is nothing in this state to find.
- 🔑 **What to check first if this is ever revisited:** whether the search was descoped to the partner API (see
  TC-14-011) or moved to a route we have not found. Per the standing rule, **a 404 on a guessed route proves
  nothing** — list the form registry instead.

### TC-02 — NISPIS `/verify` requires an API key and returns NPO details (ADO #101823 · TC-14-011) — NOT EXECUTED
*P1 · Src:Code · External API client. `state=Design`, automation=Not Automated.*
- **Preconditions (ADO):** External API client, no portal UI (e.g. a NISPIS partner); a valid NPO exists; the
  consumer holds an API key.
- **Steps (verbatim):**
  1. `POST /api/npo/verify` with valid NpoNumber **and** API key → *"200 OK with OrganisationResponse containing
     status, message, Company details"*
  2. `POST /api/npo/verify` **WITHOUT** API key → *"401/403 Unauthorized"*
  3. `POST` with an invalid NpoNumber → *"Response indicates NPO not found / NotRegistered status"*
- **Assertions:** [ ] valid key + NpoNumber returns details · [ ] (BLOCKING) missing key is rejected 401/403 ·
  [ ] invalid NpoNumber returns not-found
- 🚫 **OUT OF REMIT — route to developer / security.** A partner API with no UI path, and **we hold no API key**, so
  even step 1 is unsatisfiable for us. ADO's own drift note says *"Not in FDS. `NISPISVerificationAppService.cs:45`
  etc. Public-facing partner API — critical to test."* It is `P1` and genuinely important — it just is not a
  black-box QA case.
- ⚠️ **Do not conflate this with 14D TC-14D-004.** That case found the **public portal `/verify` deep-link route**
  returns **404** (no QR-verification flow). This case is a different thing — a **`POST /api/npo/verify` partner API
  endpoint**. Related in name only; do not cite one as evidence for the other.
- 📌 Step 2 is the security-relevant half and overlaps suite 14Z's concerns. If dev confirms the key is enforced,
  that is a useful counterweight to `bugs/2026-08-18-api-reachable-without-authentication.md`; if it is not
  enforced, it belongs in that bug.

### TC-03 — Anonymous Organisation lookups expose no PII (ADO #101824 · TC-14-012) — NOT EXECUTED
*P2 · Src:Code · Public. `state=Design`, automation=Not Automated.*
- **Preconditions (ADO):** Public Portal; at least one registered NPO with a Compliance status set.
- **Steps (verbatim):**
  1. `GET /api/services/dsdnpo/organisations/GetOrganisationIdBySubstringId` **without auth** →
     *"200 OK with org GUID (AbpAllowAnonymous)"*
  2. `GET /api/services/dsdnpo/organisations/OrganisationComplianceStatus` **without auth** →
     *"200 OK with compliance status; verify no PII exposed"*
- **Assertions:** [ ] both endpoints answer anonymously (by design) · [ ] (BLOCKING) **no PII in either response**
- 🚫 **OUT OF REMIT as a test target — route to security.** Both steps call service endpoints directly with no UI
  involved.
- 🔑 **But this is the case the test lead most needs an answer on, and it is cheap.** ADO's own drift note reads:
  *"Found via `[AbpAllowAnonymous]` attributes. **Confirm with security team that this surface is acceptable.**"* Note
  what the case actually expects: **200 is the intended behaviour** — anonymity is by design here, and the only real
  assertion is **whether PII leaks**.
- 📌 **Direct bearing on an existing CRITICAL finding.** `bugs/2026-08-18-api-reachable-without-authentication.md`
  records broad anonymous readability, and on 2026-08-27 it was narrowed: the exposure is **per-endpoint, not
  blanket** — `NpoOrganisation/Crud/Get?id=` answers anonymously with data, while
  `Entities/GetAll?entityType=Npo.Application` correctly returns **401**. These two named endpoints are exactly the
  kind of specific evidence that bug needs. **If the test lead wants them confirmed, that is a one-line read each —
  but it should be an explicit instruction, not something QA does off its own bat**, given the remit rule.

## Coverage against ADO
| Plan TC | ADO id | ADO TC | P | Src | Portal | Disposition |
|---|---|---|---|---|---|---|
| TC-01 | #101820 | TC-14-008 | 3 | FDS | Public | ⛔ BLOCKED — public search does not exist |
| TC-02 | #101823 | TC-14-011 | 1 | Code | External | 🚫 OUT — partner API, no UI, no API key held |
| TC-03 | #101824 | TC-14-012 | 2 | Code | Public | 🚫 OUT — API endpoints; route to security |

**3 cases owned by this plan · 0 expected to yield a functional verdict.** Coverage stays **212 / 314 = 67.5%**;
what changes is that all 36 functional suites are now imported and every case has a recorded disposition.

## Questions for the test lead
1. **Was the FDS 7 public "NPO Database search" descoped?** It has never existed in any build we have tested
   (three confirmations across 08-13 → 08-27). If it was replaced by the NISPIS partner API, TC-14-008 and smoke
   TC-14-007 should be withdrawn or rewritten rather than sitting as failures.
2. **Can we be given an API key**, or should TC-14-011 be reassigned to dev? It is `P1` and flagged
   *"critical to test"*, and right now nobody is testing it.
3. **Do you want the two TC-14-012 endpoints confirmed by QA?** Cheap to do, but it is API testing, which the
   project rule reserves for dev. Say the word and it is a two-minute check.
4. **`Cancelled` (status 7) has zero records** across 104 000+ organisations. Should QA manufacture one, or is that
   state unreachable in the current build?

# Report: NPO-14S-F — Public NPO Search & Anonymous Endpoints (functional) — last suite imported, none of its 3 cases yields a verdict

**Date:** 2026-08-27 12:55 UTC
**Plan:** test-plans/cross-cutting/14s-public-npo-search-functional.md
**Execution Mode:** ai-mcp
**Result:** NOT EXECUTED — suite **101905** was the last un-imported functional suite and is now imported, closing the plan at **36 of 36 suites**. None of its 3 cases produces a functional verdict, and this was expected before the pull: **TC-14-008** depends on a public NPO search that **does not exist** (re-confirmed signed-out today, third confirmation since 08-13), and **TC-14-011 / TC-14-012** are **API-target cases with no UI path**, which the project's black-box rule reserves for dev/security. Coverage stays **212 / 314 = 67.5%**; what changes is that every case in the functional plan now has a recorded disposition.
**Duration:** ~600s (ADO pull + author + one signed-out confirmation)
**Cases:** TC-01, TC-02, TC-03
**Environment:** QA · public portal, signed out · ADO `dev.azure.com/boxfusion/Boxfusion Test Plans`
**Accounts used:** none on the app (all three cases are anonymous by design); an interactive ADO sign-in for the pull

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 3 | 0 | 0 | 0 | 3 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-01 Cancelled/Dissolved NPO shows correct status in public search | #101820 | ⛔ BLOCKED | The public NPO search does not exist in the build |
| TC-02 NISPIS `/verify` requires an API key | #101823 | 🚫 NOT EXECUTED | Partner API, no UI path, and we hold no API key |
| TC-03 Anonymous Organisation lookups expose no PII | #101824 | 🚫 NOT EXECUTED | Two API endpoints called directly; route to security |

## What the import took

The `ado` MCP times out, so the pull used the committed browser + REST recipe: interactive sign-in (the user entered
password and MFA), then `GET .../Plans/101543/Suites/101905/TestCase?api-version=7.1` same-origin. The `TestCase`
endpoint returned `Microsoft.VSTS.TCM.Steps` inline, so the `workitemsbatch` call was not needed.

Raw pull committed to **`test-data/ado-functional-101543/ado-suite-101905.json`** next to the eight suites pulled on
08-25, so this sign-in never has to happen again for 14S.

🔑 The double-escaping gotcha held exactly as recorded — entities must be unescaped **before** tags are stripped, and
twice, or `&lt;P&gt;` survives as a literal `<P>`.

## Per-case detail

### TC-01 — Cancelled/Dissolved NPO shows correct status in public search (#101820 · TC-14-008) — BLOCKED

ADO step is a single line — *"Search for the cancelled NPO"* → *"Result shows status = Cancelled/Dissolved"*.

**Re-confirmed today, signed out**, at `/no-auth/boxfusion.dsdnpo/landing-page`:

| Check | Result |
|---|---|
| `<input>` elements on the page | **0** |
| Page text matching `search` / `find an NPO` / `NPO database` / `lookup` | **none** |
| Nav items | Education and Awareness · Contact Us · FAQs · Login |

That is the **third** confirmation: smoke TC-14-007 failed 2026-08-13 (*"no public search exists"*), was re-run and
**confirmed FAIL** 2026-08-20, and is unchanged today. Recorded as *not executable — case does not match the build*,
the same disposition as TC-01-010/011/012. **Deliberately not failed** — the case is not wrong about what the FDS
asks for; the build simply has no such surface.

📌 **A second precondition is also unmet, independently.** The case needs *"a Cancelled NPO exists"*. Suite 09 found
`Cancelled` (status **7**) has **0 records** across 104 000+ organisations. So even with a working search there would
be nothing in that state to find — worth raising with the test lead as a data question separate from the missing UI.

### TC-02 — NISPIS `/verify` requires an API key (#101823 · TC-14-011) — NOT EXECUTED

`P1`, and ADO's own note calls it *"Public-facing partner API — critical to test"*. Its stated portal is
**"External - API client (no portal UI; e.g., NISPIS partner)"**, and the three steps are all `POST /api/npo/verify`
variants.

Out of black-box remit on two counts: there is no UI path, and **we hold no API key**, so even the positive step is
unsatisfiable for us. Routed to developer / security.

⚠️ **Not the same thing as 14D TC-14D-004.** That case found the **public portal `/verify` deep-link route** returns
**404** (no QR-verification flow). This is a **`POST /api/npo/verify` partner API endpoint**. Related in name only —
neither should be cited as evidence for the other.

### TC-03 — Anonymous Organisation lookups expose no PII (#101824 · TC-14-012) — NOT EXECUTED

Two `[AbpAllowAnonymous]` endpoints, called without auth:

```
GET /api/services/dsdnpo/organisations/GetOrganisationIdBySubstringId  → expected 200 + org GUID
GET /api/services/dsdnpo/organisations/OrganisationComplianceStatus     → expected 200 + status, "verify no PII exposed"
```

Out of remit as a test target, but worth reading carefully: **200 is the intended behaviour here.** Anonymity is by
design for these two, and the case's only real assertion is **whether PII leaks**. ADO's drift note asks precisely
that — *"Confirm with security team that this surface is acceptable."*

🔑 **This bears directly on an existing CRITICAL finding.**
`bugs/2026-08-18-api-reachable-without-authentication.md` was narrowed earlier today: the anonymous exposure is
**per-endpoint, not blanket** — `NpoOrganisation/Crud/Get?id=` answers anonymously with data, while
`Entities/GetAll?entityType=Npo.Application` correctly returns **401**. Two named endpoints with a documented
"anonymous by design" intent is exactly the evidence that bug needs to become actionable.

**Not read by QA.** It would be one call each, but the project rule reserves API targets for dev — so it is put to
the test lead as a decision rather than done unilaterally.

## Import status — the functional plan is now fully imported

| | Before | After |
|---|---|---|
| Suites imported | 35 of 36 | **36 of 36** ✅ |
| Cases verdicted | 212 / 314 (67.5%) | **212 / 314 (67.5%)** — unchanged, as predicted |

## ⚠️ One correction carried into the plan

Earlier in this session I described 14S as *"probably cheap and runnable — 3 cases"*, quoting the smoke plan's
**"✅ Runnable today"** reachability line. That line was written **before** the suite was executed; the execution
reports say the opposite. Reading a plan's own optimism instead of its report is the same mis-scope that cost time on
TC-14T-011 earlier this week. The plan file now carries an explicit warning against re-deriving it that way.

## Questions for the test lead
1. **Was the FDS 7 public "NPO Database search" descoped?** It has never existed in any build tested (08-13 → 08-27).
   If the NISPIS partner API replaced it, TC-14-008 and smoke TC-14-007 want withdrawing or rewriting rather than
   standing as failures. Thabiso's own drift note — *"NISPIS endpoints exist but API-key gated, not pure
   anonymous-by-name search"* — points that way.
2. **Can QA be given an API key, or should TC-14-011 move to dev?** It is `P1` and flagged critical, and nobody is
   currently testing it.
3. **Do you want the two TC-14-012 endpoints confirmed by QA?** Two minutes, but it is API testing.
4. **`Cancelled` (status 7) has zero records.** Should QA manufacture one, or is that state unreachable?

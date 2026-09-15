# Report: NPO-12-F — Investigations: Public submission + Admin processing (functional)

**Date:** 2026-08-18 15:50 UTC
**Plan:** test-plans/investigations/12-investigations-functional.md
**Execution Mode:** ai-driven (Playwright MCP, live QA public + admin portals)
**Result:** FAILED — public intake broken (2 fail); admin lifecycle blocked by it; 1 positive observation
**Duration:** ~1200s
**Cases:** TC-12-002, TC-12P-003
**Assessed-not-executed:** TC-12-003, TC-12P-004, TC-12-005, TC-12-007, TC-12-008, TC-12-009, TC-12-010, TC-12-011
**Environment:** QA · public portal (logged-in + signed-out) + admin portal

## Summary
| Case | Area | Verdict |
|---|---|---|
| TC-12-002 (TC-01) | Non-anonymous submission requires contact details | 🔴 FAIL — submit creates no case (silent) |
| TC-12P-003 (TC-03) | Anonymous whistleblower submit without account | 🔴 FAIL — no case, no reference (silent) |
| TC-12-003 (TC-02) | NPO scoping (registered enabled / dereg disabled) | ⏸ PARTIAL — needs multi-status NPO data |
| TC-12P-004 (TC-04) | Evidence-file allowlist + oversize | ⛔ BLOCKED — no evidence-upload control on the form |
| TC-12-005 (TC-05) | Validate 'Not Valid' closes case | ⛔ BLOCKED — needs an open case we own (intake broken) |
| TC-12-007 (TC-06) | Outside-mandate → third party | ⛔ BLOCKED — needs a validated case |
| TC-12-008 (TC-07) | Close Investigation + forensic outcome | ⛔ BLOCKED — needs an open investigation |
| TC-12-009 (TC-08) | Reviewer Feedback button gating | ⏸ PARTIAL — actions not on the CRUD view; needs the case-processing view |
| TC-12-010 (TC-09) | Feedback persists + displays | ⛔ BLOCKED — needs an eligible case + processing view |
| TC-12-011 (TC-10) | Temp-Person create/delete | ⛔ OUT OF UI SCOPE (DB) |

Bug: `bugs/2026-08-18-public-enquiry-submit-broken-npoorganisation-null.md` (broadened to cover Investigation).

## 🔴 The headline — the public investigation (whistleblowing) intake is broken, and appears to have REGRESSED
The public investigation report uses the **same `public-case-create` ("Submit A Query") form** (landing → **Submit
Query**, or footer **Enquiry**; Category = **Investigation**, Case type e.g. *Theft* / *Procurement*). Submitting
never creates a case:

- **TC-01 (non-anonymous, logged-in):** all required fields set (Category, Description, Case type; contact details
  prefilled). Clicking **Submit** = a **silent no-op** — no confirmation, no navigation, and **no `Case/Crud/Create`
  POST**. The only related call is `NpoOrganisation/Crud/Get?id=undefined` → **400**. FAIL.
- **TC-03 (anonymous, signed-out via `/no-auth/...public-case-create`):** the form loads with empty, editable contact
  fields; **Submit is enabled with no contact details** (anonymity permitted ✅). But Submit is again a **silent
  no-op** — `NpoOrganisation/Crud/Get?id=undefined` 400, **no case POST, no confirmation reference**. FAIL.
- Reproduced **4× today** across two categories (E&A earlier + Investigation) and both auth states.

🔑 **Regression evidence:** the admin Investigation list (164 cases) shows anonymous public submissions that
**succeeded on 2026-08-13** — e.g. **INV1283/13/08/2026** ("QA smoke test TC-12-001", Is Anonymous = Yes, Reported
User = Anonymous). Today's identical flow creates **nothing** (newest row is 13/08; nothing dated 18/08). So the public
case/enquiry/investigation intake **worked on 13 Aug and is broken on 18 Aug** — this reads as a regression, not a
long-standing gap. (Module is known-unstable per Thabiso, but the failure was consistent across 4 attempts, not flaky.)

**Impact:** the whistleblowing channel is down. For Investigation the failure is fully **silent** (no error at all),
which is worse than the E&A path (which at least shows "Your request is not valid!").

## ⛔ Cascade — the admin lifecycle can't be tested
TC-05/06/07/09 all need an **open investigation case we own** to action. Because the public intake can't create one,
and we don't action other NPOs' live cases, these are **blocked by the intake bug**. The admin processing actions
(Validate / Close Investigation / Reviewer Feedback) are also **not on the `investigation-details-crud` entity view**
(which only has Save + Download Zip) — they live in a separate case-processing/CRM view not reached this run.

## ✅ Positive observation — anonymity IS recorded (old drift note superseded)
The smoke drift note warned the Investigation entity had **no `IsAnonymous` flag** (anonymity inferred from a null
ReportedUser). The admin list now has a dedicated **"Is Anonymous"** column (Yes/No) **and** a "Reported User" column,
and anonymous cases show Reported User = **Anonymous** with Is Anonymous = **Yes** (e.g. INV1283, INV611, INV601). So
anonymity is now explicit — a genuine improvement. (Not re-verified against the stored payload since today's submit
never persisted.)

## ⏸ Partial / not verified
- **TC-02 (NPO scoping):** the form offers "Search using NPO Number"; verifying that deregistered/dissolved NPOs are
  *disabled* needs a known deregistered NPO to compare — deferred (data).
- **TC-04 (evidence files):** the public submission form has **no upload control at all** (`input[type=file]`/
  `.ant-upload` = 0), so the allowlist/oversize behaviour can't be exercised here. The ADO smoke case assumes an
  attachment step — flag whether evidence upload was removed or lives elsewhere.
- **TC-08 (feedback gating):** needs the case-processing view + cases in Closed / Referred / Under Investigation;
  visible statuses on the list were Draft / In Progress only.

## Observations / questions for the test lead (Thabiso)
1. 🔴 **Public case/enquiry/investigation intake creates no case** (`NpoOrganisation/Crud/Get?id=null|undefined` 400,
   no create POST) — silent for Investigation. It **worked on 13 Aug** (INV1283) — please confirm this is a recent
   regression and not an env blip. This blocks the whole 12/whistleblowing lifecycle.
2. **Evidence upload** is absent from the public submission form — is that intended?
3. Where do **Validate / Close Investigation / Reviewer Feedback** live (which view/role)? The CRUD entity view has none.
4. ✅ Good news: anonymity now has an explicit `Is Anonymous` flag + Reported User = Anonymous.

## Method notes
- Submit failures verified via the network log (no `Case/Crud/Create`; the `NpoOrganisation Get?id=null|undefined` 400)
  and a MutationObserver for toasts — Shesha uses axios/XHR, so a `fetch` patch alone is insufficient; the
  `browser_network_requests` log is authoritative.
- Regression inferred from the admin list: 08-13 anonymous cases present, nothing dated 08-18 despite 4 submit attempts.
- Anonymous path tested truly signed-out (logged out first; `/no-auth/...` form with empty contact fields).

# Test Plan: ADMINPORTAL-106400 — Verify not appointed

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-06
> **Estimated Duration:** 120s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Kwenas / 123qwe (displays as "Kwena Semono" — the Recruiter role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106400 has no `Tested By` relation, no parent). |
| ADO Test Case | [#106400](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106400) — Verify not appointed |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172's fourth run (2026-08-06), "AutoTest Verify not appointed" (Identity Number `8806145432086`), status **INTERVIEWED** |

## Objective
> Validate that a Recruiter can open an Interviewed application, click "Not Appointed", populate a reason, click Submit, and have the application's status change to Rejected.

> **⚠️ Precondition performed manually before this plan was authored (2026-08-06):** ADMINPORTAL-106400 requires the target application to already be Interviewed. Since this is a freshly-created application (via ADMINPORTAL-106172's fourth run), it was advanced through Shortlisted (real Shortlist click) and Interviewed (checkbox + comment + real Interviewed click) as confirmed prerequisite actions before this plan was authored.
>
> **⚠️ STATEFUL/REAL/PERMANENT ACTION — confirmed by requester ahead of the full setup chain:** TC-05 clicks the real "Submit" button after populating a reason, permanently changing the application's status to Rejected.
>
> Given ADMINPORTAL-106398/106399's precedent, the "Reason for not appointing" dialog likely follows the same conditional-render pattern (a "Submit" button that only enables once the reason is populated) — confirm live before assuming exact button labels.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with the target application Interviewed

## Test Cases

### TC-01 — Login as Kwena (ADO #106400 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Navigate to Job Posting Dashboard, open Ref No 40, open Applications panel's Interviewed tab (ADO #106400 steps 3-7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) list of interviewed applications is displayed, including "Verify not appointed"

---

### TC-03 — Click on the Surname and Initials link to open the application (ADO #106400 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) application opens in details view with "INTERVIEWED" status

---

### TC-04 — Click on Not Appointed, populate the reason (ADO #106400 steps 9-10)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Reason for not appointing" dialog appears
  - [x] ASSERT (BLOCKING) after populating the reason, the Submit button is enabled

---

### TC-05 — Click on Submit (ADO #106400 step 11) — ⚠️ REAL, PERMANENT STATUS CHANGE
- **Expected result:** System should auto refresh and route to all applications page
- **Assertions:**
  - [x] ASSERT (BLOCKING) page auto-navigates back to the applications table

---

### TC-06 — Locate the actioned application and open in details view (ADO #106400 step 12)
- **Expected result:** The status of the application should be Rejected
- **Assertions:**
  - [x] ASSERT (BLOCKING) application opens successfully and status shows "REJECTED"

---

## Teardown
- No automated teardown. TC-05 performs a real, permanent status change (Interviewed → Rejected) on the target application. This is not reversible via the UI.

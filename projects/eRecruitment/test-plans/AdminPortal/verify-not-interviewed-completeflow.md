# Test Plan: ADMINPORTAL-106399 — Verify not interviewed

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106399 has no `Tested By` relation, no parent). |
| ADO Test Case | [#106399](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106399) — Verify not interviewed |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172's third run (2026-08-06), "AutoTest Verify not interviewed" (Identity Number `9103235432088`), status **SHORTLISTED** |

## Objective
> Validate that a Recruiter can open a Shortlisted application, open the "Not Interviewed" dialog, Close out of it without effect, then re-open the dialog, populate a reason, click OK, and have the application's status change from Shortlisted to Rejected.

> **⚠️ Precondition performed manually before this plan was authored (2026-08-06):** ADMINPORTAL-106399 requires the target application to already be Shortlisted. Since this is a freshly-created application (via ADMINPORTAL-106172's third run) with no prior Shortlist test case run against it yet, the real Shortlist button was clicked as a confirmed prerequisite action to move "AutoTest Verify not interviewed" from Pre-Screened to Shortlisted.
>
> **⚠️ STATEFUL/REAL/PERMANENT ACTION — requires confirmation before running:** TC-06 clicks the real "OK" button after populating a reason, permanently changing the application's status from Shortlisted to Rejected (per ADO step 15's expected result — note ADO calls the final status "Rejected", consistent with the same terminology confirmed for the Decline flow in ADMINPORTAL-106398, not "Not Interviewed").
>
> Given ADMINPORTAL-106398's precedent, expect the "Reason for not interviewing" dialog to follow the same Cancel/OK popup pattern (though the button may again be "Ok" with lowercase "k" rather than "OK" — confirm live before assuming).

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with the target application Shortlisted

## Test Cases

### TC-01 — Login as Kwena (ADO #106399 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Navigate to Job Posting Dashboard, open Ref No 40, open Applications panel's Shortlisted tab (ADO #106399 steps 3-7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) list of shortlisted applications is displayed, including "Verify not interviewed"

---

### TC-03 — Click on the Surname and Initials link to open the application (ADO #106399 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) application opens in details view with "SHORTLISTED" status

---

### TC-04 — Scroll to the bottom and click Not Interviewed, populate reason, click Close (ADO #106399 steps 9-11)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Reason for not interviewing" dialog appears
  - [x] ASSERT (BLOCKING) after populating the reason, the OK button is enabled
  - [x] ASSERT (BLOCKING) after clicking Close, the dialog closes and the application is still Shortlisted

---

### TC-05 — Re-navigate to Shortlisted tab, re-open the application, click Not Interviewed, populate reason (ADO #106399 steps 12-13)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Reason for not interviewing" dialog appears again
  - [x] ASSERT (BLOCKING) after populating the reason, the OK button is enabled

---

### TC-06 — Click on OK (ADO #106399 step 14) — ⚠️ REAL, PERMANENT STATUS CHANGE
- **Expected result:** System should auto refresh and route to all applications page
- **Assertions:**
  - [x] ASSERT (BLOCKING) page auto-navigates back to the applications table

---

### TC-07 — Locate the actioned application and open in details view (ADO #106399 step 15)
- **Expected result:** Application should open in details view successfully and the status should be "Rejected"
- **Assertions:**
  - [x] ASSERT (BLOCKING) application opens successfully and status shows "REJECTED"

---

## Teardown
- No automated teardown. TC-06 performs a real, permanent status change (Shortlisted → Rejected) on the target application. This is not reversible via the UI.

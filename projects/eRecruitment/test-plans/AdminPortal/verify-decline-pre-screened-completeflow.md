# Test Plan: ADMINPORTAL-106398 — Verify Decline Pre_Screened Application

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106398 has no `Tested By` relation, no parent). |
| ADO Test Case | [#106398](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106398) — Verify Decline Pre_Screened Application |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172's second run (2026-08-06), "AutoTest Edit Last Name" (Identity Number `8907115432088`), status **PRE-SCREENED** |

## Objective
> Validate that a Recruiter can open a Pre-Screened application, open the Decline dialog, Cancel out of it without effect, then re-open the dialog, populate a reason, click Ok, and have the application's status change from Pre-Screened to Declined.

> **Note:** ADO steps 7-10 (open a Pre-Screened app, Decline, Cancel) and steps 11-17 (open a Pre-Screened app again, Decline, populate reason, Ok) both say "open ... application" without specifying a different one. Since Job Posting 40 currently has only **one** Pre-Screened application (the one created on ADMINPORTAL-106172's second run — the original "Edit Last Name A" application already moved past Pre-Screened to Appointed), both references target the same application.
>
> Confirmed live 2026-08-06: the Decline popup is titled "Reason for Decline" with a "Reason" textarea and **"Cancel"**/**"Ok"** buttons (note: lowercase "k" in "Ok", not "OK").
>
> **⚠️ STATEFUL/REAL/PERMANENT ACTION — confirmed by requester ("just go straight to decline pre-screened"):** TC-06 clicks the real "Ok" button after populating a reason, permanently changing the application's status from Pre-Screened to Declined.
>
> **🐛 Related open bug:** `test-reports/bugs/2026-08-06-new-manual-application-edit-fails-no-application-found.md` documents that Personal Details edits on this specific application fail with a backend HTTP 500 ("No existing application found for this applicant and job posting"). Opening the Decline dialog and Cancelling was confirmed live to NOT trigger this error — only Personal Details Save does. If Decline's real "Ok" submission unexpectedly hits the same backend error, this will be documented as an extension of that bug.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with exactly one Pre-Screened application ("AutoTest Edit Last Name")

## Test Cases

### TC-01 — Login as Kwena (ADO #106398 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Navigate to Job Posting Dashboard, open Ref No 40, open Applications panel's Pre-Screened tab (ADO #106398 steps 3-7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) list of pre-screened applications is displayed, including "Edit Last Name"

---

### TC-03 — Click on the Surname and Initials link to open the application (ADO #106398 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) application opens in details view with Personal Details panel visible

---

### TC-04 — Scroll to the bottom and click Decline, then click Cancel (ADO #106398 steps 9-10)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Reason for Decline" popup appears
  - [x] ASSERT (BLOCKING) after clicking Cancel, the dialog closes and the application is still Pre-Screened

---

### TC-05 — Re-navigate to Pre-Screened tab, re-open the application, click Decline, populate reason (ADO #106398 steps 11-14)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Reason for Decline" popup appears again
  - [x] ASSERT (BLOCKING) after populating the Reason field, the "Ok" button is enabled

---

### TC-06 — Click on Ok (ADO #106398 step 15) — ⚠️ REAL, PERMANENT STATUS CHANGE
- **Expected result:** System should auto refresh and route to all applications page
- **Assertions:**
  - [x] ASSERT (BLOCKING) page auto-navigates back to the applications table

---

### TC-07 — Navigate to Pre-Screened tab and confirm the application is no longer listed (ADO #106398 step 16)
- **Correction (2026-08-06):** an entirely unrelated, pre-existing candidate "Edit Last Name F" (Identity Number `8807125432088`) also matches the "Edit Last Name" substring and remains genuinely Pre-Screened — checking for the generic Last Name text produced a false failure. Fixed to check by the target's unique Identity Number (`8907115432088`) instead.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the target application (by Identity Number) no longer appears under the Pre-Screened tab

---

### TC-08 — Locate the declined application and open in details view (ADO #106398 step 17)
- **Correction (2026-08-06):** confirmed live that the app displays status as **"REJECTED"** (badge) / "Rejected" (table column) — never "Declined" anywhere — despite ADO's expected-result text saying "declined". This is a terminology discrepancy, not a functional defect (the status transition itself works correctly).
- **Assertions:**
  - [x] ASSERT (BLOCKING) application opens successfully and status shows "REJECTED"

---

## Teardown
- No automated teardown. TC-06 performs a real, permanent status change (Pre-Screened → Declined) on the target application. This is not reversible via the UI.

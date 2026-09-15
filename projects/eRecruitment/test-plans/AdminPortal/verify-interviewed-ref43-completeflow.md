# Test Plan: ADMINPORTAL-104475 — Verify Interviewed

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-06
> **Estimated Duration:** 100s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Kwenas / 123qwe (displays as "Kwena Semono" — the Recruiter role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #104475 has parent #106205). |
| ADO Test Case | [#104475](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104475) — Verify Interviewed |
| Target Job / Application | Job Posting Ref No **43** ("Auto Job Post3") → existing applicant **Fred Everything** (Identity Number `2606108675655`), status **SHORTLISTED** (set by ADMINPORTAL-104464) |

## Objective
> Validate that a Recruiter can open Job Posting Ref No 43 via the standard Recruitment > Job Posting Dashboard path, open applicant Fred Everything's application from the Shortlisted tab, check the interview-confirmation checkbox, populate a comment, and click Interviewed to move the application to the Interviewed stage.

> **🐛 Likely documentation error in ADO step 85:** the expected result states "the status should change to **Appointed**" after clicking Interviewed. Per the extensively-confirmed app behavior in ADMINPORTAL-106333/106335, clicking "Interviewed" moves an application's status to **Interviewed**, not Appointed — reaching Appointed requires a separate flow (uploading Appointment Documents + clicking the "Appointed" button, per ADMINPORTAL-106335). This plan follows the actual, confirmed app behavior (status → Interviewed, verified via the Interviewed tab) rather than ADO's literal (and inconsistent) wording. Step 86's "Appointed tab" is treated as a likely copy-paste error for "Interviewed tab".
>
> Same checkbox/comment/button conditional-render pattern already confirmed in ADMINPORTAL-106333: the "Interviewed" button only renders once the Comment field has text.
>
> **⚠️ STATEFUL/REAL/PERMANENT ACTION — requires confirmation before running:** TC-06 clicks the real Interviewed button, changing Fred Everything's application status from Shortlisted to Interviewed. This is pre-existing shared QA test data, not created by this automation session.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 43 exists with applicant Fred Everything Shortlisted

## Test Cases

### TC-01 — Login as Kwena (ADO #104475 step 69)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Expand the Recruitment dropdown (ADO #104475 step 70)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Posting Dashboard" and other submenus are visible

---

### TC-03 — Click on Job Posting dashboard, open Ref No 43 (ADO #104475 steps 71-72)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "43"

---

### TC-04 — Navigate to Applications panel, click Shortlisted tab, open Everything F's application (ADO #104475 steps 73, 87)
- **Assertions:**
  - [x] ASSERT (BLOCKING) list of shortlisted applications is displayed, including "Everything F"
  - [x] ASSERT (BLOCKING) application opens successfully with "SHORTLISTED" status

---

### TC-05 — Scroll to Declaration panel, check the interview checkbox, populate comments (ADO #104475 steps 83-84)
- **Assertions:**
  - [x] ASSERT (BLOCKING) checkbox is checked
  - [x] ASSERT (BLOCKING) comment field contains the entered text
  - [x] ASSERT (BLOCKING) "Interviewed" button is visible and enabled once the comment is populated

---

### TC-06 — Click on Interviewed (ADO #104475 step 85) — ⚠️ REAL, PERMANENT STATUS CHANGE
- **Expected result (corrected per app behavior):** System should auto-refresh and navigate away from the application; status should change to Interviewed
- **Assertions:**
  - [x] ASSERT (BLOCKING) page auto-navigates away from the individual application view

---

### TC-07 — Click on the Interviewed tab (ADO #104475 step 86, corrected from "Appointed tab") and confirm the application is listed
- **Assertions:**
  - [x] ASSERT (BLOCKING) the application is displayed under the Interviewed tab

---

## Teardown
- No automated teardown. TC-06 performs a real, permanent status change (Shortlisted → Interviewed) on a pre-existing, shared QA test candidate's application. Not reversible via the UI.

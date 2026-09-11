# Test Plan: ADMINPORTAL-106257 — Verify Edit internal/External Applicant

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-05
> **Estimated Duration:** 100s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Kwenas / 123qwe (displays as "Kwena Semono" — the Recruiter role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106257 has no `Tested By` relation). Parent: #107469. |
| ADO Test Case | [#106257](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106257) — Verify Edit internal/External Applicant |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172 — currently listed as "Edit Last Name" in the Applications table (Internal/External "External Applicant") |

## Objective
> Validate that a Recruiter can edit a candidate application's Internal/External Applicant type via the Personal Details panel's "Edit Personal Details" button, and that the change persists after Save + reload, including in the Applications index table.

> **⚠️ STATEFUL/REAL EDIT — requires confirmation before running:** TC-10 clicks Save for real, changing the target application's Internal/External Applicant type from "External Applicant" to "Past Employee" (per ADO step 10's example).
>
> **🐞 KNOWN APP BUG — Save is intermittent for this application:** confirmed across ADMINPORTAL-106240/106246/106247/106251/106255/106256, the "Edit Personal Details" Save click can fire **zero API calls** and leave the panel in edit mode; it can need up to ~15s and occasionally a second click before the save actually goes through. This spec waits up to 15s after clicking Save and retries once if still in edit mode. See `test-reports/bugs/2026-08-05-edit-personal-details-save-silently-fails.md`.
>
> This test case explicitly targets the application created on ADMINPORTAL-106172 (ADO step 7) — this is the correct, intended candidate, not one of the stray/orphaned records documented in `test-reports/bugs/2026-08-05-add-application-no-delete-or-resume-capability.md`.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name" (Internal/External "External Applicant"), status badge "PRE-SCREENED"

## Test Cases

### TC-01 — Login as Kwena (ADO #106257 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106257 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106257 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106257 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (ADO #106257 step 6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the application created on Test Case 106172 (ADO #106257 step 7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "AutoTest"
  - [x] ASSERT (BLOCKING) status badge "PRE-SCREENED" is visible

---

### TC-07 — Click "Edit Personal Details" button (ADO #106257 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Internal/External dropdown is now editable, and a Save button is visible

---

### TC-08 — Click on the Internal/External dropdown (ADO #106257 step 9)
- **Note:** confirmed in ADMINPORTAL-106534 (the other candidate) that the dropdown options include "External Applicant", "Past Employee", "Recruitment Agency" (and "Current Employee") — expected to be the same here. Our current value is "External Applicant".
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Past Employee" and "Recruitment Agency" options are visible

---

### TC-09 — Select "Past Employee" (ADO #106257 step 10)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Internal/External dropdown now shows "Past Employee"

---

### TC-10 — Click on Save (ADO #106257 step 11) — ⚠️ REAL, PERSISTENT EDIT
- **Expected result:** Record saves successfully; updated applicant type is displayed, and the Applications index table's Internal/External Applicant column also updates
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + reload, Internal/External shows "Past Employee"
  - [x] ASSERT (BLOCKING) the Applications index table also shows "Past Employee" for this row

---

## Teardown
- No automated teardown. TC-10 performs a real, persistent edit to the target application's Internal/External Applicant type. This is not reversible via the UI.

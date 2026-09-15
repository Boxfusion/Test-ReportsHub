# Test Plan: ADMINPORTAL-106281 — Verify qualification status (complete)

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106281 has no `Tested By` relation). |
| ADO Test Case | [#106281](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106281) — Verify qualification status (complete) |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172, currently listed as **"Edit Last Name A"**, Education row Institution "Test University" / Qualification Status "In Progress" (per ADMINPORTAL-106280) / Date Obtained "01/08/2026" |

## Objective
> Validate that a Recruiter can set a candidate application's Education row Qualification Status to "Complete" and pick a new Date Obtained via the calendar, and that the change persists after clicking the row's Save control.

> **🎯 Executable here, unlike ADMINPORTAL-106543/106544 (same fields, different candidate — blocked, field doesn't exist):** this row — created via the ADMINPORTAL-106172 "Add New Application" wizard — genuinely has both a Qualification Status dropdown and a Date Obtained datepicker in edit mode (confirmed live for ADMINPORTAL-106280).
>
> **⚠️ STATEFUL/REAL EDIT — requires confirmation before running:** TC-11 clicks the row's Save icon for real, changing Qualification Status from "In Progress" to "Complete" and Date Obtained to a new previous date (day 5 of the current calendar month).
>
> Row anchor: this row's Institution is "Test University" (set by ADMINPORTAL-106172) — stable throughout this edit.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name A", with an Education row Institution "Test University" / Qualification Status "In Progress"

## Test Cases

### TC-01 — Login as Kwena (ADO #106281 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106281 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106281 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106281 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (ADO #106281 step 6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the target application (ADO #106281 step 7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "AutoTest"
  - [x] ASSERT (BLOCKING) status badge "PRE-SCREENED" is visible

---

### TC-07 — Navigate to Education panel and click the Edit icon (ADO #106281 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Status dropdown is now editable

---

### TC-08 — Click on the Qualification Status dropdown (ADO #106281 step 9)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "In Progress" and "Complete" options are displayed

---

### TC-09 — Select "Complete" (ADO #106281 step 10)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Status dropdown now shows "Complete"

---

### TC-10 — Click inside the Date Obtained datepicker and select a previous date (ADO #106281 steps 11-12)
- **Assertions:**
  - [x] ASSERT (BLOCKING) a calendar opens
  - [x] ASSERT (BLOCKING) Date Obtained field shows the picked date

---

### TC-11 — Click on Save (ADO #106281 step 13) — ⚠️ REAL, PERSISTENT EDIT
- **Expected result:** Record saves successfully; updated Date is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + reload, the row shows Qualification Status "Complete" and the new Date Obtained

---

## Teardown
- No automated teardown. TC-11 performs a real, persistent edit to the target application's Education row. This is not reversible via the UI.

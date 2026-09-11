# Test Plan: ADMINPORTAL-106280 — Verify edit qualification status (In Progress)

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-06
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Kwenas / 123qwe (displays as "Kwena Semono" — the Recruiter role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106280 has no `Tested By` relation). Parent: #107190. |
| ADO Test Case | [#106280](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106280) — Verify edit qualification status (In Progress) |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172, currently listed as **"Edit Last Name A"**, Education row Institution "Test University" / Qualification Type "Bachelors Degree" (per ADMINPORTAL-106279) / Qualification Status "Complete" |

## Objective
> Validate that a Recruiter can edit a candidate application's Education row Qualification Status via the inline row Edit icon and dropdown, and that the change persists after clicking the row's Save control.

> **🎯 IMPORTANT — this is executable here, unlike ADMINPORTAL-106543/106544:** those test cases (same "Qualification Status" field, different candidate) were **blocked** because the field does not exist at all on a normal candidate's Secondary/Tertiary Qualifications rows (see `test-reports/bugs/2026-08-05-qualification-status-field-does-not-exist.md`). Confirmed live 2026-08-06: this row — created via the ADMINPORTAL-106172 "Add New Application" wizard — genuinely HAS a Qualification Status dropdown in edit mode (currently "Complete", the second `.ant-select` in the row). This is a real, executable test case for this application specifically.
>
> **⚠️ STATEFUL/REAL EDIT — requires confirmation before running:** TC-10 clicks the row's Save icon for real, changing Qualification Status from "Complete" to "In Progress".
>
> Row anchor: this row's Institution is "Test University" (set by ADMINPORTAL-106172) — stable throughout this edit.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name A", with an Education row Institution "Test University" / Qualification Status "Complete"

## Test Cases

### TC-01 — Login as Kwena (ADO #106280 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106280 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106280 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106280 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (ADO #106280 step 6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the target application (ADO #106280 step 7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "AutoTest"
  - [x] ASSERT (BLOCKING) status badge "PRE-SCREENED" is visible

---

### TC-07 — Navigate to Education panel and click the Edit icon (ADO #106280 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Status dropdown is now editable

---

### TC-08 — Click on the Qualification Status dropdown (ADO #106280 step 9)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "In Progress" and "Complete" options are displayed

---

### TC-09 — Select "In Progress" (ADO #106280 step 10)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Status dropdown now shows "In Progress"

---

### TC-10 — Click on Save (ADO #106280 step 11) — ⚠️ REAL, PERSISTENT EDIT
- **Expected result:** Record saves successfully; updated Qualification Status is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + reload, the row shows Qualification Status "In Progress"

---

## Teardown
- No automated teardown. TC-10 performs a real, persistent edit to the target application's Education row Qualification Status. This is not reversible via the UI.

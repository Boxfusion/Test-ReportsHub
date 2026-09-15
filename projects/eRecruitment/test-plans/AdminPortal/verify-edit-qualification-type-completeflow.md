# Test Plan: ADMINPORTAL-106279 — Verify Edit qualification type

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106279 has no `Tested By` relation). Parent: #107191. |
| ADO Test Case | [#106279](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106279) — Verify Edit qualification type |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172, currently listed as **"Edit Last Name A"**, Education row Institution "Test University" / Qualification Name "Edited Qualification Name" (per ADMINPORTAL-106278) / Qualification Type "National Diploma Grade12And Other" |

## Objective
> Validate that a Recruiter can edit a candidate application's Education row Qualification Type via the inline row Edit icon and dropdown, and that the change persists after clicking the row's Save control.

> **⚠️ STATEFUL/REAL EDIT — requires confirmation before running:** TC-10 clicks the row's Save icon for real, changing Qualification Type from "National Diploma Grade12And Other" to "Bachelors Degree".
>
> **Note on dropdown options:** this row's Qualification Type dropdown has a **different, tertiary-oriented option set** than the equivalent field on a normal (non-wizard-created) candidate's Secondary Qualifications row (ADMINPORTAL-106542, which lists Grade 9-12 school options) — confirmed live during ADMINPORTAL-106172's wizard investigation: "National Diploma Grade12And Other", "Bachelor's degree, Advanced Diplomas...", "Honours degree...", "Master's degree", "Doctor's degree", "National Diploma", "Bachelors Degree", "Advanced Diploma", "Post Graduate Certificate", "B-Tech".
>
> Row anchor: this row's Institution is "Test University" (set by ADMINPORTAL-106172) — stable throughout this edit.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name A", with an Education row Institution "Test University"

## Test Cases

### TC-01 — Login as Kwena (ADO #106279 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106279 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106279 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106279 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (ADO #106279 step 6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the target application (ADO #106279 step 7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "AutoTest"
  - [x] ASSERT (BLOCKING) status badge "PRE-SCREENED" is visible

---

### TC-07 — Navigate to Education panel and click the Edit icon (ADO #106279 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Type dropdown is now editable

---

### TC-08 — Click on the Qualification Type dropdown (ADO #106279 step 9)
- **Assertions:**
  - [x] ASSERT (BLOCKING) available Qualification Type options are displayed, including "Bachelors Degree"

---

### TC-09 — Select "Bachelors Degree" (ADO #106279 step 10)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Type dropdown now shows "Bachelors Degree"

---

### TC-10 — Click on Save (ADO #106279 step 11) — ⚠️ REAL, PERSISTENT EDIT
- **Expected result:** Record saves successfully; updated Qualification Type is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + reload, the row shows Qualification Type "Bachelors Degree"

---

## Teardown
- No automated teardown. TC-10 performs a real, persistent edit to the target application's Education row Qualification Type. This is not reversible via the UI.

# Test Plan: ADMINPORTAL-106285 — Verify Edit Work Title

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106285 has no `Tested By` relation). |
| ADO Test Case | [#106285](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106285) — Verify Edit Work Title |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172 — currently listed as "Edit Last Name" in the Applications table, Work Experience row "QA Automation Engineer" / "Test Employer Pty Ltd" |

## Objective
> Validate that a Recruiter can edit a candidate application's Work Experience row Job Title via the inline row Edit icon, and that the change persists after clicking the row's Save control ("OK" per ADO's wording).

> **⚠️ STATEFUL/REAL EDIT — requires confirmation before running:** TC-10 clicks the row's Save icon for real, changing Job Title from "QA Automation Engineer" to "Edited Job title" (per ADO step 12's literal instruction). **Discrepancy note vs. ADMINPORTAL-106547** (the same test case type already automated for a different candidate): that spec only tested clearing Job Title to empty, which is rejected by required-field validation (confirmed live) — no persistent change occurred there. This test case's steps explicitly populate a replacement value ("Edited Job title") **before** saving, so this **is** expected to be a real, valid, persistent edit.
>
> ADO's steps are out of document order in the raw work item (step id 12 "Populate the field" appears before step id 11 "Click on OK button" in the XML, despite ADO's numeric IDs suggesting otherwise) — this plan follows the evident intended sequence: clear → populate → click Save/OK.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name", with a Work Experience row "QA Automation Engineer" / "Test Employer Pty Ltd"

## Test Cases

### TC-01 — Login as Kwena (ADO #106285 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106285 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106285 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106285 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (ADO #106285 step 6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the application created on Test Case 106172 (ADO #106285 step 7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "AutoTest"
  - [x] ASSERT (BLOCKING) status badge "PRE-SCREENED" is visible

---

### TC-07 — Navigate to Work Experience panel and click the Edit icon (ADO #106285 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the row's fields (Job Title, Employer, Employment Start Date, Employment End Date, Reason For Leaving) become editable

---

### TC-08 — Click on the Job Title text area (ADO #106285 step 9)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Title field is focused

---

### TC-09 — Clear the Job Title text area (ADO #106285 step 10)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Title field is empty

---

### TC-10 — Populate the field with "Edited Job title" (ADO #106285 step 12)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Title field contains "Edited Job title"

---

### TC-11 — Click on Save/OK (ADO #106285 step 11) — ⚠️ REAL, PERSISTENT EDIT
- **Expected result:** Record saves successfully; updated Job Title is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + reload, the row shows Job Title "Edited Job title"

---

## Teardown
- No automated teardown. TC-11 performs a real, persistent edit to the target application's Work Experience row Job Title. This is not reversible via the UI.

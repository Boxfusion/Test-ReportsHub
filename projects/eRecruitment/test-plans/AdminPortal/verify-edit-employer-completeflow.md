# Test Plan: ADMINPORTAL-106295 — Verify Edit Employer

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106295 has no `Tested By` relation). |
| ADO Test Case | [#106295](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106295) — Verify Edit Employer |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172, currently listed as **"Edit Last Name A"** in the Applications table (confirmed live 2026-08-06), Work Experience row "Edited Job title" (per ADMINPORTAL-106285) / "Test Employer Pty Ltd" |

## Objective
> Validate that a Recruiter can edit a candidate application's Work Experience row Employer via the inline row Edit icon, and that the change persists after clicking the row's Save control ("OK" per ADO's wording).

> **⚠️ STATEFUL/REAL EDIT — requires confirmation before running:** TC-11 clicks the row's Save icon for real, changing Employer from "Test Employer Pty Ltd" to "Edited Employer" (per ADO step 11's literal instruction).
>
> Row anchor: this row's Job Title was changed from "QA Automation Engineer" to "Edited Job title" by ADMINPORTAL-106285 — this spec anchors on "Edited Job title" to find the row.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name A", with a Work Experience row "Edited Job title" / "Test Employer Pty Ltd"

## Test Cases

### TC-01 — Login as Kwena (ADO #106295 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106295 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106295 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106295 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (ADO #106295 step 6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the application created on Test Case 106172 (ADO #106295 step 7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "AutoTest"
  - [x] ASSERT (BLOCKING) status badge "PRE-SCREENED" is visible

---

### TC-07 — Navigate to Work Experience panel and click the Edit icon (ADO #106295 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the row's fields (Job Title, Employer, Employment Start Date, Employment End Date, Reason For Leaving) become editable

---

### TC-08 — Click on the Employer text area (ADO #106295 step 9)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Employer field is focused

---

### TC-09 — Clear the Employer text area (ADO #106295 step 10)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Employer field is empty

---

### TC-10 — Populate the field with "Edited Employer" (ADO #106295 step 11)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Employer field contains "Edited Employer"

---

### TC-11 — Click on Save/OK (ADO #106295 step 12) — ⚠️ REAL, PERSISTENT EDIT
- **Expected result:** Record saves successfully; updated Employer is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + reload, the row shows Employer "Edited Employer"

---

## Teardown
- No automated teardown. TC-11 performs a real, persistent edit to the target application's Work Experience row Employer. This is not reversible via the UI.

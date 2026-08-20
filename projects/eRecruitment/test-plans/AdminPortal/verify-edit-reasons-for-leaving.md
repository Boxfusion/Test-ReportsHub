# Test Plan: ADMINPORTAL-106550 — Verify Edit reasons for leaving

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-05
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Kwenas / 123qwe (displays as "Kwena Semono" — the Recruiter role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106550 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#106550](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106550) — Verify Edit reasons for leaving |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → Application currently listed as "Edit Last Name F" → Work Experience panel → row "Senior Test Engineer" / "Edited Employer" |

## Objective
> Validate that a Recruiter can edit a candidate application's Work Experience entry, specifically clearing and updating the Reason For Leaving field, and that the change persists after Save + refresh.
>
> **⚠️ STATEFUL — requires confirmation before running:** TC-10 clicks the row's inline Save icon for real, permanently changing this Work Experience row's Reason For Leaving from "Test" to "Edited Reasons for leaving". This is the same shared QA fixture already modified by ADMINPORTAL-106547/106548/106549. TC-01 through TC-09 only navigate and fill the field in the DOM without saving, so they are safe to repeat.
>
> **Discrepancy notes:**
> - ADO step 7 says "open any application from the table" — this spec continues using the same candidate application ("Edit Last Name F") already in use throughout this session, for continuity.
> - ADO calls the confirm control "OK" (step 12), but the actual control on this row is the same inline "Save" icon (`.anticon-save`) used by every other row-level edit in this project.
> - ADO step 11's instruction text has a typo ("Edited **Resons** for leaving") but its own expected-result text correctly spells "Edited **Reasons** for leaving" — this spec uses the correctly-spelled value, matching the expected result and the test's title.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name F", with a Work Experience row for "Senior Test Engineer" (Reason For Leaving "Test")

## Test Cases

### TC-01 — Login as Kwena (ADO #106550 step 2)

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106550 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106550 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106550 step 5)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (closing date not yet passed) (ADO #106550 step 6)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the target application (ADO #106550 step 7)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "Fred"

---

### TC-07 — Navigate to Work Experience panel and click the Edit icon (ADO #106550 step 8)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the row's Job Title, Employer, Employment Start Date, Employment End Date, Reason For Leaving fields open in edit mode

---

### TC-08 — Click on the Reasons For Leaving text area (ADO #106550 step 9)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the Reason For Leaving field is focused and editable

---

### TC-09 — Clear the Reasons For Leaving text area and populate "Edited Reasons for leaving" (ADO #106550 steps 10-11, corrected spelling)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the Reason For Leaving field contains "Edited Reasons for leaving"

---

### TC-10 — Click on Save (ADO #106550 step 12) — ⚠️ REAL, PERSISTENT EDIT

- **Expected result:** Record saves successfully; the updated Reasons for leaving is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + page reload, the row shows Reason For Leaving "Edited Reasons for leaving"

---

## Teardown
- No automated teardown. TC-10 performs a real, persistent change to the shared candidate application's Work Experience row.

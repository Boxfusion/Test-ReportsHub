# Test Plan: ADMINPORTAL-106548 — Verify Edit Employer

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106548 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#106548](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106548) — Verify Edit Employer |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → Application currently listed as "Edit Last Name F" → Work Experience panel → row "Senior Test Engineer" / ABSA |

## Objective
> Validate that a Recruiter can edit a candidate application's Work Experience entry, specifically clearing and updating the Employer field, and that the change persists after Save + refresh.
>
> **⚠️ STATEFUL — requires confirmation before running:** TC-10 clicks the row's inline Save icon for real, permanently changing this Work Experience row's Employer from "ABSA" to "Edited Employer". This is the same shared QA fixture already modified throughout this session (most recently by [ADMINPORTAL-106547](./verify-edit-work-title.md), whose Save attempt was correctly rejected and left this row unchanged). TC-01 through TC-09 only navigate and fill the field in the DOM without saving, so they are safe to repeat.
>
> **Discrepancy notes:**
> - ADO step 7 says "open any application from the table" — this spec continues using the same candidate application ("Edit Last Name F") already in use throughout this session, for continuity.
> - ADO calls the confirm control "OK" (step 12), but the actual control on this row is the same inline "Save" icon (`.anticon-save`) used by every other row-level edit in this project.
> - The other Work Experience row ("Automation") already has Employer "Edited Employer" from earlier ambient test data — after this run, both rows will coincidentally share that same Employer text; this does not affect the assertions since they target the "Senior Test Engineer" row specifically.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name F", with a Work Experience row for "Senior Test Engineer" / ABSA

## Test Cases

### TC-01 — Login as Kwena (ADO #106548 step 2)

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106548 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106548 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106548 step 5)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (closing date not yet passed) (ADO #106548 step 6)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the target application (ADO #106548 step 7)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "Fred"

---

### TC-07 — Navigate to Work Experience panel and click the Edit icon (ADO #106548 step 8)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the row's Job Title, Employer, Employment Start Date, Employment End Date, Reason For Leaving fields open in edit mode

---

### TC-08 — Click on the Employer text area (ADO #106548 step 9)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the Employer field is focused and editable

---

### TC-09 — Clear the Employer text area and populate "Edited Employer" (ADO #106548 steps 10-11)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the Employer field contains "Edited Employer"

---

### TC-10 — Click on Save (ADO #106548 step 12) — ⚠️ REAL, PERSISTENT EDIT

- **Expected result:** Record saves successfully; the updated Employer is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + page reload, the row shows Employer "Edited Employer"

---

## Teardown
- No automated teardown. TC-10 performs a real, persistent change to the shared candidate application's Work Experience row.

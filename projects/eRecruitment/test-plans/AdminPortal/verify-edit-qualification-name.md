# Test Plan: ADMINPORTAL-106541 — Verify Edit qualification name

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-05
> **Estimated Duration:** 60s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Kwenas / 123qwe (displays as "Kwena Semono" — the Recruiter role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106541 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#106541](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106541) — Verify Edit qualification name |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → Application currently listed as "Edit Last Name F" (same candidate used by [ADMINPORTAL-106529](./verify-edit-last-name.md) onward, for continuity with this session's work) → Education panel → Secondary Qualifications row |

## Objective
> Validate that a Recruiter can edit a candidate application's Education > Secondary Qualifications entry, specifically clearing and updating the Qualification Name field, and that the change persists after Save + refresh.
>
> **⚠️ STATEFUL — requires confirmation before running:** TC-12 clicks Save for real, permanently changing the Secondary Qualifications row's Qualification Name from "NSCS" to "Edited Qualification Name". Unlike [ADMINPORTAL-106540](./verify-edit-institution.md) (Institution, a required field that rejected a blank save), Qualification Name is populated with a real replacement value here, so this Save is expected to succeed. This is the same shared QA fixture already modified by ADMINPORTAL-106529 through 106538. TC-01 through TC-11 only navigate and fill the field in the DOM without saving, so they are safe to repeat.
>
> **Discrepancy notes:**
> - ADO step 7 says "open any application from the table" (more generic than most other test cases in this family, which name a specific candidate) — this spec continues using the same candidate application ("Edit Last Name F") already in use throughout this session, for continuity.
> - ADO step 7's expected result ("pre-screened status") does not match reality: the application has progressed through several workflow stages in this shared environment during this session's testing (observed at "AWAITING PRE-SCREENING" in earlier test cases; possibly further along by the time this runs), independent of anything this spec does.
> - ADO step 8 lists 5 fields that should open in edit mode, but confirmed (see ADMINPORTAL-106540): the Secondary Qualifications table only has Institution, Qualification Name, Qualification Type, Certificate — no separate "Qualification status" or "Date Obtained" field.
> - ADO steps 10-11 have a copy/paste leftover from ADMINPORTAL-106540: they say "Clear/Populate the **Institution** text area" even though step 9 and the test title are about **Qualification Name**. This spec targets Qualification Name, per the evident intent.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name F", with a Secondary Qualifications row (Qualification Name "NSCS")

## Test Cases

### TC-01 — Login as Kwena (ADO #106541 step 2)

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106541 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106541 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106541 step 5)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (closing date not yet passed) (ADO #106541 step 6)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the target application (ADO #106541 step 7)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "Fred"

---

### TC-07 — Navigate to Education panel and click the Edit icon on the Secondary Qualifications row (ADO #106541 step 8)

- **Expected result (actual, corrected):** The row's Institution, Qualification Name, and Qualification Type fields open in edit mode (no separate "status" field exists)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Qualification Name field is now an editable input

---

### TC-08 — Click on the Qualification Name text area (ADO #106541 step 9)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the Qualification Name field is focused and editable

---

### TC-09 — Clear the Qualification Name text area (ADO #106541 step 10, corrected field name)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the Qualification Name field is empty

---

### TC-10 — Populate the Qualification Name text area with "Edited Qualification Name" (ADO #106541 step 11, corrected field name)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the Qualification Name field contains "Edited Qualification Name"

---

### TC-11 — Click on Save (ADO #106541 step 12) — ⚠️ REAL, PERSISTENT EDIT

- **Expected result:** Record saves successfully; the updated Qualification Name is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + page reload, the Secondary Qualifications row shows Qualification Name "Edited Qualification Name"

---

## Teardown
- No automated teardown. TC-11 performs a real, persistent change to the shared candidate application's Secondary Qualifications row.

# Test Plan: ADMINPORTAL-106549 — Verify Edit Employment Date

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106549 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#106549](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106549) — Verify Edit Employment Date |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → Application currently listed as "Edit Last Name F" → Work Experience panel → row "Senior Test Engineer" / "Edited Employer" (set by [ADMINPORTAL-106548](./verify-edit-employer.md)) |

## Objective
> Validate that a Recruiter can edit a candidate application's Work Experience entry, specifically changing the Employment Start Date and Employment End Date via their datepickers, and that the change persists after Save + refresh.
>
> **⚠️ STATEFUL — requires confirmation before running:** TC-12 clicks the row's inline Save icon for real, permanently changing this Work Experience row's Employment Start Date (21/07/2026 → 01/07/2026) and Employment End Date (23/07/2026 → 02/07/2026). This is the same shared QA fixture already modified by ADMINPORTAL-106547/106548. TC-01 through TC-11 only navigate and pick dates in the DOM without saving, so they are safe to repeat.
>
> **Discrepancy notes:**
> - ADO step 7 says "open any application from the table" — this spec continues using the same candidate application ("Edit Last Name F") already in use throughout this session, for continuity.
> - ADO step 9 says "Click on Employer Start Date" — read as "Employment Start Date" per the test title and step 8's field list.
> - ADO step 13's expected result ("Updated Employer is displayed") is a copy/paste leftover from [ADMINPORTAL-106548](./verify-edit-employer.md) — this test edits the two employment dates, not Employer.
> - Confirmed live 2026-08-05: the two date cell locators must be scoped to the currently **visible** `.ant-picker-dropdown` and matched with an **exact** day-number regex (e.g. `/^1$/`) — a plain substring match like `hasText: '1'` or `hasText: '2'` can resolve to a stale/hidden calendar's cell (e.g. day 12, 21) left in the DOM from a previously-closed picker, causing a click timeout. This is the same class of "stale dropdown node" quirk documented for `.ant-select-dropdown` elsewhere in this project.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name F", with a Work Experience row for "Senior Test Engineer"

## Test Cases

### TC-01 — Login as Kwena (ADO #106549 step 2)

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106549 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106549 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106549 step 5)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (closing date not yet passed) (ADO #106549 step 6)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the target application (ADO #106549 step 7)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "Fred"

---

### TC-07 — Navigate to Work Experience panel and click the Edit icon (ADO #106549 step 8)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the row's Job Title, Employer, Employment Start Date, Employment End Date, Reason For Leaving fields open in edit mode

---

### TC-08 — Click on Employment Start Date (ADO #106549 step 9, corrected field name)

- **Assertions:**
  - [x] ASSERT (BLOCKING) a calendar opens

---

### TC-09 — Select a previous date from the calendar (ADO #106549 step 10)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the Employment Start Date field shows the picked date (01/07/2026)

---

### TC-10 — Click on Employment End Date (ADO #106549 step 11)

- **Assertions:**
  - [x] ASSERT (BLOCKING) a calendar opens

---

### TC-11 — Select a previous date from the calendar (ADO #106549 step 12)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the Employment End Date field shows the picked date (02/07/2026)

---

### TC-12 — Click on Save (ADO #106549 step 13) — ⚠️ REAL, PERSISTENT EDIT

- **Expected result (actual, corrected):** Record saves successfully; the updated Employment Start/End Dates are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + page reload, the row shows Employment Start Date "01/07/2026" and Employment End Date "02/07/2026"

---

## Teardown
- No automated teardown. TC-12 performs a real, persistent change to the shared candidate application's Work Experience row.

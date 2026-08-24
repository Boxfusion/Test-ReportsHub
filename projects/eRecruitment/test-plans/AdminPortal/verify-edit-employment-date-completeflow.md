# Test Plan: ADMINPORTAL-106298 — Verify Edit Employment Date

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106298 has no `Tested By` relation). |
| ADO Test Case | [#106298](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106298) — Verify Edit Employment Date |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172, currently listed as **"Edit Last Name A"** in the Applications table, Work Experience row "Edited Job title" / "Edited Employer" (per ADMINPORTAL-106285/106295), Employment Start Date "01/08/2026", Employment End Date "03/08/2026" |

## Objective
> Validate that a Recruiter can edit a candidate application's Work Experience row Employment Start/End Date via the inline row Edit icon and calendar pickers, and that the change persists after clicking the row's Save control.

> **⚠️ STATEFUL/REAL EDIT — requires confirmation before running:** TC-11 (final step) clicks the row's Save icon for real, changing Employment Start Date from "01/08/2026" to "01/08/2026" → a different previous date, and Employment End Date similarly (per ADO steps 9-12: pick any previous date for each). This spec uses day 1 for Start and day 3 for End of the currently-displayed calendar month — both confirmed in ADMINPORTAL-106298's sibling test (ADMINPORTAL-106549) to be safely in the past and selectable (later days in the current month get disabled as future dates).
>
> Row anchor: this row's Job Title is "Edited Job title" (set by ADMINPORTAL-106285) and Employer is "Edited Employer" (set by ADMINPORTAL-106295) — this spec anchors on "Edited Job title" to find the row.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name A", with a Work Experience row "Edited Job title" / "Edited Employer"

## Test Cases

### TC-01 — Login as Kwena (ADO #106298 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106298 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106298 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106298 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (ADO #106298 step 6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the application created on Test Case 106172 (ADO #106298 step 7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "AutoTest"
  - [x] ASSERT (BLOCKING) status badge "PRE-SCREENED" is visible

---

### TC-07 — Navigate to Work Experience panel and click the Edit icon (ADO #106298 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the row's date fields become editable inputs

---

### TC-08 — Click on Employment Start Date (ADO #106298 step 9)
- **Assertions:**
  - [x] ASSERT (BLOCKING) a calendar opens

---

### TC-09 — Select a previous date for Employment Start Date (ADO #106298 step 10)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Employment Start Date field shows the picked date

---

### TC-10 — Click on Employment End Date (ADO #106298 step 11)
- **Assertions:**
  - [x] ASSERT (BLOCKING) a calendar opens

---

### TC-11 — Select a previous date for Employment End Date (ADO #106298 step 12)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Employment End Date field shows the picked date

---

### TC-12 — Click on Save (ADO #106298 step 13) — ⚠️ REAL, PERSISTENT EDIT
- **Expected result:** Record saves successfully; updated dates are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + reload, the row shows the updated Employment Start/End Dates

---

## Teardown
- No automated teardown. TC-12 performs a real, persistent edit to the target application's Work Experience row Employment Start/End Date. This is not reversible via the UI.

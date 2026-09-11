# Test Plan: ADMINPORTAL-106542 — Verify Edit qualification type

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106542 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. Parent: #107191. |
| ADO Test Case | [#106542](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106542) — Verify Edit qualification type |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → Application currently listed as "Edit Last Name F" → Education panel → Secondary Qualifications row (Qualification Name "Edited Qualification Name", per [ADMINPORTAL-106541](./verify-edit-qualification-name.md)) |

## Objective
> Validate that a Recruiter can edit a candidate application's Education > Secondary Qualifications entry, specifically changing the Qualification Type dropdown, and that the change persists after Save + refresh.
>
> **⚠️ STATEFUL — requires confirmation before running:** TC-10 clicks the row's inline Save icon for real, permanently changing the Secondary Qualifications row's Qualification Type from "Higher Certificates and Advanced National (vocational) Cert." to "Grade 12 (National Senior Certificate) and National (vocational) Cert. level 4". This is the same shared QA fixture already modified by ADMINPORTAL-106529 through 106541. TC-01 through TC-09 only navigate and select the option in the DOM without saving, so they are safe to repeat.
>
> **Discrepancy notes:**
> - ADO step 7 says "open any application from the table" — this spec continues using the same candidate application ("Edit Last Name F") already in use throughout this session, for continuity.
> - ADO step 7's expected result ("pre-screened status") does not necessarily match the application's current stage in this shared, actively-tested environment.
> - ADO step 8 lists 5 fields that should open in edit mode, but confirmed (see ADMINPORTAL-106540): the Secondary Qualifications table only has Institution, Qualification Name, Qualification Type, Certificate — no separate "Qualification status" or "Date Obtained" field.
> - Confirmed live 2026-08-05: unlike the Gender/Race/Internal-External dropdowns elsewhere in this project (which exclude the currently-selected value from their option list), the Qualification Type dropdown lists **all 5** options including the current selection: "Grade 9", "Grade 10 and National (vocational) Certificates level 2", "Grade 11 and National (vocational) Certificates level 3", "Grade 12 (National Senior Certificate) and National (vocational) Cert. level 4", "Higher Certificates and Advanced National (vocational) Cert." (current).

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name F", with a Secondary Qualifications row (Qualification Name "Edited Qualification Name")

## Test Cases

### TC-01 — Login as Kwena (ADO #106542 step 2)

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106542 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106542 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106542 step 5)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (closing date not yet passed) (ADO #106542 step 6)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the target application (ADO #106542 step 7)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "Fred"

---

### TC-07 — Navigate to Education panel and click the Edit icon on the Secondary Qualifications row (ADO #106542 step 8)

- **Expected result (actual, corrected):** The row's Institution, Qualification Name, and Qualification Type fields open in edit mode (no separate "status" field exists)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Qualification Type dropdown is now editable

---

### TC-08 — Click on the Qualification Type dropdown (ADO #106542 step 9)

- **Assertions:**
  - [x] ASSERT (BLOCKING) all 5 Qualification Type options are displayed

---

### TC-09 — Select "Grade 12 (National Senior Certificate) and National (vocational) Cert. level 4" (ADO #106542 step 10)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the Qualification Type dropdown now shows the new value

---

### TC-10 — Click on Save (ADO #106542 step 11) — ⚠️ REAL, PERSISTENT EDIT

- **Expected result:** Record saves successfully; the updated Qualification Type is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + page reload, the Secondary Qualifications row shows the new Qualification Type

---

## Teardown
- No automated teardown. TC-10 performs a real, persistent change to the shared candidate application's Secondary Qualifications row.

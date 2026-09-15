# Test Plan: ADMINPORTAL-106284 — Delete Qualification

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106284 has no `Tested By` relation). Parent: #107464. |
| ADO Test Case | [#106284](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106284) — Delete Qualification |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172, currently listed as **"Edit Last Name A"**, Education row Institution "Test University" |

## Objective
> Validate that a Recruiter can delete a candidate application's Education (Qualification) row via the row's Delete icon, that a confirmation popup appears, that Cancel dismisses it without deleting, and that a subsequent OK confirmation permanently deletes the row.

> **🎯 Confirmed live 2026-08-06: unlike the Work Experience row (no `.anticon-delete` icon at all — see `test-reports/bugs/2026-08-05-work-experience-delete-icon-does-not-exist.md`), the Education row DOES have a `.anticon-delete` icon.** This test case is genuinely executable for this application.
>
> **⚠️ STATEFUL/REAL/IRREVERSIBLE EDIT — requires confirmation before running:** TC-10 clicks OK on the delete confirmation popup, permanently deleting the Education row (Institution "Test University", Qualification Name "Edited Qualification Name", Qualification Type "Bachelors Degree", Qualification Status "Complete") from this application. This row has been the anchor/target for ADMINPORTAL-106276, 106278, 106279, 106280, 106281 — none of those test cases can be re-run against this row after this deletion.
>
> Confirmed live: clicking `.anticon-delete` opens an Ant Design Popconfirm with text "Are you sure want to delete this item?" and "Cancel"/"OK" buttons.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name A", with an Education row Institution "Test University"

## Test Cases

### TC-01 — Login as Kwena (ADO #106284 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106284 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106284 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106284 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (ADO #106284 step 6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Scroll to Applications panel and open the application created on Test Case 106172 (ADO #106284 step 7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Application opens with status "PRE-SCREENED"

---

### TC-07 — Navigate to Education panel and click the Delete icon (ADO #106284 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Are you sure want to delete this item?" confirmation popup appears

---

### TC-08 — Click on Cancel button (ADO #106284 step 9)
- **Assertions:**
  - [x] ASSERT (BLOCKING) confirmation popup closes successfully
  - [x] ASSERT (BLOCKING) Education row (Institution "Test University") is still present

---

### TC-09 — Click on Delete button again (ADO #106284 step 10)
- **Assertions:**
  - [x] ASSERT (BLOCKING) confirmation popup with "Cancel" and "OK" buttons appears

---

### TC-10 — Click on OK button (ADO #106284 step 11) — ⚠️ REAL, PERMANENT, IRREVERSIBLE DELETE
- **Expected result:** Qualification should be deleted successfully
- **Assertions:**
  - [x] ASSERT (BLOCKING) after the delete + reload, the Education row (Institution "Test University") no longer exists on the application

---

## Teardown
- No automated teardown. TC-10 performs a real, permanent, irreversible deletion of the target application's Education row. This is not reversible via the UI. Subsequent Education-row test cases anchored on "Test University" will need a new anchor (e.g. re-adding a qualification, or targeting a different row) after this run.

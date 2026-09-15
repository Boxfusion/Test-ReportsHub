# Test Plan: ADMINPORTAL-106306 — Verify Delete Work Experience

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106306 has no `Tested By` relation). Parent: #107189. |
| ADO Test Case | [#106306](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106306) — Verify Delete Work Experience |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172, currently listed as **"Edit Last Name A"**, Work Experience row "Edited Job title" / "Edited Employer" |

## Objective
> Validate that a Recruiter can delete a candidate application's Work Experience entry, and that a confirmation dialog correctly protects against accidental deletion (Cancel keeps the row, OK deletes it for real).

> **🐞 KNOWN APP BUG — same defect already confirmed in ADMINPORTAL-106551 (identical test case content, different ADO ID, different candidate):** no Work Experience row has a Delete (trash) icon, in view mode or inline-edit mode — only Edit, and once in edit mode: Save/Cancel/date-clear icons. This spec re-confirms the same finding on this candidate's row. TC-07 asserts the presence of a `.anticon-delete` icon and is expected to fail on purpose, giving the defect a genuine automated signal. TC-08-10 are skipped as blocked. See `test-reports/bugs/2026-08-05-work-experience-delete-icon-does-not-exist.md`.
>
> **No destructive action is taken or required** — nothing is edited or deleted, since the control does not exist.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name A", with a Work Experience row "Edited Job title"

## Test Cases

### TC-01 — Login as Kwena (ADO #106306 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106306 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106306 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106306 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (ADO #106306 step 6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the target application (ADO #106306 step 7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "AutoTest"
  - [x] ASSERT (BLOCKING) status badge "PRE-SCREENED" is visible

---

### TC-07 — Navigate to Work Experience panel and attempt to click the Delete icon (ADO #106306 step 8) — ⚠️ EXPECTED TO FAIL (app bug)

- **Expected result per ADO:** "Are you sure want to delete this item?" popup should appear.
- **Actual behavior:** No Delete icon exists on any Work Experience row.
- **Assertions:**
  - [x] ASSERT (BLOCKING) a `.anticon-delete` icon exists within the target Work Experience row — **this assertion is expected to fail, proving the bug**

---

### TC-08 — Click on Cancel button (ADO #106306 step 9) — SKIPPED (blocked by TC-07)

### TC-09 — Click on Delete button (ADO #106306 step 10) — SKIPPED (blocked by TC-07)

### TC-10 — Click on OK button (ADO #106306 step 11) — SKIPPED (blocked by TC-07)

- No Delete control exists to interact with; these steps cannot be executed against the current build.

---

## Teardown
- No teardown required — no data was modified. TC-07 fails by design to record the missing-Delete-icon defect as an automated, reproducible check.

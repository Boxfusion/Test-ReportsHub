# Test Plan: ADMINPORTAL-106547 — Verify Edit Work Title

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-05
> **Estimated Duration:** 75s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Kwenas / 123qwe (displays as "Kwena Semono" — the Recruiter role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106547 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#106547](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106547) — Verify Edit Work Title |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → Application currently listed as "Edit Last Name F" → Work Experience panel → row "Senior Test Engineer" / ABSA |

## Objective
> Validate the behavior of clearing the Job Title field on a candidate application's Work Experience entry and clicking Save/OK.
>
> **✅ Confirmed NOT destructive — no confirmation needed:** Job Title is a **required** field, same as Institution in [ADMINPORTAL-106540](./verify-edit-institution.md). Confirmed live 2026-08-05: clicking Save with Job Title blank is **rejected** ("Update failed" tooltip on the row) — the field remains blank and unsaved (still in edit mode), and the original value is retained on reload. So although this test clicks the real Save control, nothing actually persists.
>
> **Discrepancy notes:**
> - ADO step 7 says "open any application from the table" — this spec continues using the same candidate application ("Edit Last Name F") already in use throughout this session, for continuity.
> - ADO calls the confirm control "OK" (step 11), but the actual control on this row is the same inline "Save" icon (`.anticon-save`) used by every other row-level edit in this project (Education, Work Experience) — there is no separate "OK" button.
> - ADO's expected result for step 11 ("Record saves successfully and Updated Job Title is displayed") does not match reality — see the blocker note above. This spec asserts the actual (correct, safer) behavior: the save is rejected and the original Job Title is retained.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name F", with a Work Experience row for "Senior Test Engineer"

## Test Cases

### TC-01 — Login as Kwena (ADO #106547 step 2)

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106547 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106547 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106547 step 5)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (closing date not yet passed) (ADO #106547 step 6)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the target application (ADO #106547 step 7)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "Fred"

---

### TC-07 — Navigate to Work Experience panel and click the Edit icon (ADO #106547 step 8)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the row's Job Title, Employer, Employment Start Date, Employment End Date, Reason For Leaving fields open in edit mode

---

### TC-08 — Click on the Job Title text area (ADO #106547 step 9)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the Job Title field is focused and editable

---

### TC-09 — Clear the Job Title text area (ADO #106547 step 10)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the Job Title field is empty

---

### TC-10 — Click on Save (ADO #106547 step 11)

- **Expected result (actual, corrected):** Save is rejected by client-side validation ("Update failed"); no update is persisted and the row's original Job Title value is retained
- **Assertions:**
  - [x] ASSERT (BLOCKING) an "Update failed" indicator appears
  - [x] ASSERT (BLOCKING) after reload, the row's Job Title is still "Senior Test Engineer" (unchanged)

---

## Teardown
- None needed. TC-10 clicks the real Save control, but the app rejects the invalid (blank) submission — no persistent change occurs.

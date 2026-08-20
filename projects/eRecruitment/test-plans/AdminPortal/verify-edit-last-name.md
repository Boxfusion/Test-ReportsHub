# Test Plan: ADMINPORTAL-106529 — Verify Edit Last Name

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106529 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#106529](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106529) — Verify Edit Last Name |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → Application for candidate **"Everything F"** (Fred Everything) |

## Objective
> Validate that a Recruiter can edit a candidate application's Personal Details, specifically clearing and updating the Last Name field, and that the change persists after Save + refresh.
>
> **⚠️ STATEFUL — requires confirmation before running:** TC-11 clicks Save for real, permanently renaming the shared candidate "Fred Everything" ("Everything F") application's Last Name to "Edit Last Name". This is a widely-referenced shared QA fixture (other test cases in this project target it by the name "Everything F") — renaming it may affect other specs' name-based lookups. TC-01 through TC-10 only navigate and fill the field in the DOM without saving, so they are safe to repeat.
>
> **Discrepancy notes:**
> - ADO step 7's expected result ("Application should open successfully with pre-screened status") does not match reality: the application opens with status badge **"AWAITING PRE-SCREENING"**, not "Pre-screened" (which would imply screening is already complete). This spec asserts on the actual status text.
> - ADO steps 9–10 appear to have a copy/paste authoring error: step 9 says "Click inside the Last Name field," but step 10 says "Clear the **first** name" (the test's title and step 11's wording ("Enter 'Edit Last Name'") make clear the intent is to clear and retype the **Last Name** field, not First Name). This spec follows the evident intent (Last Name), not the literal step-10 text, and documents the mismatch here.
> - ADO step 11's expected result ("Record saves successfully") is misplaced — typing text into a field does not save anything on its own; the actual save happens on step 12's "Click Save." This spec only asserts the field's typed value at step 11, and the real save/persistence check at step 12 (TC-11 below).

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application for candidate "Everything F"

## Test Cases

### TC-01 — Login as Kwena (ADO #106529 step 2)

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106529 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106529 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106529 step 5)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (closing date not yet passed) (ADO #106529 step 6)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the Application for "Everything F" (ADO #106529 step 7)

- **Expected result (actual, corrected):** Application opens successfully with status badge "AWAITING PRE-SCREENING" (not "pre-screened" as ADO states)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "Fred" and Last Name "Everything"

---

### TC-07 — Click "Edit Personal Details" (ADO #106529 step 8)

- **Assertions:**
  - [x] ASSERT (BLOCKING) First Name and Last Name fields are now editable inputs, and "Save"/"Cancel From Edit" buttons are visible

---

### TC-08 — Click inside the Last Name field (ADO #106529 step 9)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Last Name field is focused and editable

---

### TC-09 — Clear the Last Name field (ADO #106529 step 10, corrected: Last Name not First Name)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Last Name field is empty

---

### TC-10 — Enter "Edit Last Name" (ADO #106529 step 11)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Last Name field contains "Edit Last Name"

---

### TC-11 — Click on Save (ADO #106529 step 12) — ⚠️ REAL, PERSISTENT EDIT

- **Expected result:** Last name should be updated and displayed after a refresh, showing "Edit Last Name"
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + page reload, the Personal Details panel shows Last Name "Edit Last Name"

---

## Teardown
- No automated teardown. TC-11 performs a real, persistent rename of the shared "Fred Everything" candidate application's Last Name. Consider renaming it back (or noting the new name) if other specs need to find this candidate by "Everything F" going forward.

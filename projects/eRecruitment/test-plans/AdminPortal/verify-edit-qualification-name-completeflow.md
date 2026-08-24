# Test Plan: ADMINPORTAL-106278 — Verify Edit qualification name

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106278 has no `Tested By` relation). |
| ADO Test Case | [#106278](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106278) — Verify Edit qualification name |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172, currently listed as **"Edit Last Name A"**, Education row Institution "Test University" / Qualification Name "BSc Automation" |

## Objective
> Validate that a Recruiter can edit a candidate application's Education row Qualification Name via the inline row Edit icon, and that the change persists after clicking the row's Save control.

> **⚠️ STATEFUL/REAL EDIT — requires confirmation before running:** TC-11 clicks the row's Save icon for real, changing Qualification Name from "BSc Automation" to "Edited Qualification Name" (per ADO step 11's evident intent — ADO's own wording is garbled, referencing "Institution text area", but the field and test title make the intent unambiguous, same class of copy/paste error seen across this batch e.g. ADMINPORTAL-106541).
>
> **Unlike Institution (ADMINPORTAL-106276), Qualification Name is not a required field that rejects a blank save** — confirmed in ADMINPORTAL-106541 for a different candidate, this field accepts a real replacement value and saves successfully.
>
> Row anchor: this row's Institution is "Test University" (set by ADMINPORTAL-106172) — stable throughout this edit, used to locate the row.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name A", with an Education row Institution "Test University" / Qualification Name "BSc Automation"

## Test Cases

### TC-01 — Login as Kwena (ADO #106278 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106278 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106278 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106278 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (ADO #106278 step 6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the target application (ADO #106278 step 7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "AutoTest"
  - [x] ASSERT (BLOCKING) status badge "PRE-SCREENED" is visible

---

### TC-07 — Navigate to Education panel and click the Edit icon (ADO #106278 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Name field is now an editable input

---

### TC-08 — Click on the Qualification Name text area (ADO #106278 step 9)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Name field is focused

---

### TC-09 — Clear the Qualification Name text area (ADO #106278 step 10, evident intent)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Name field is empty

---

### TC-10 — Populate the field with "Edited Qualification Name" (ADO #106278 step 11)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Name field contains "Edited Qualification Name"

---

### TC-11 — Click on Save (ADO #106278 step 12) — ⚠️ REAL, PERSISTENT EDIT
- **Expected result:** Record saves successfully; updated Qualification Name is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + reload, the row shows Qualification Name "Edited Qualification Name"

---

## Teardown
- No automated teardown. TC-11 performs a real, persistent edit to the target application's Education row Qualification Name. This is not reversible via the UI.

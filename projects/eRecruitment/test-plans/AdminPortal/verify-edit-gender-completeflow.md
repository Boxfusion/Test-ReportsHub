# Test Plan: ADMINPORTAL-106256 — Verify Edit Gender

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-05
> **Estimated Duration:** 100s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Kwenas / 123qwe (displays as "Kwena Semono" — the Recruiter role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106256 has no `Tested By` relation). Parent: #107469. |
| ADO Test Case | [#106256](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106256) — Verify Edit Gender |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172 — currently listed as "Edit Last Name" in the Applications table (Gender "Male") |

## Objective
> Validate that a Recruiter can edit a candidate application's Gender via the Personal Details panel's "Edit Personal Details" button, and that the change persists after Save + reload, including in the Applications index table's Gender column.

> **⚠️ STATEFUL/REAL EDIT — requires confirmation before running:** TC-10 clicks Save for real, changing the target application's Gender from "Male" to "Not Disclosed" (per ADO step 10's example).
>
> **🐞 KNOWN APP BUG — Save is intermittent for this application:** confirmed across ADMINPORTAL-106240/106246/106247/106251/106255, the "Edit Personal Details" Save click can fire **zero API calls** and leave the panel in edit mode; it can need up to ~15s and occasionally a second click before the save actually goes through. This spec waits up to 15s after clicking Save and retries once if still in edit mode. See `test-reports/bugs/2026-08-05-edit-personal-details-save-silently-fails.md`.
>
> This test case explicitly targets the application created on ADMINPORTAL-106172 (ADO step 7) — this is the correct, intended candidate, not one of the stray/orphaned records documented in `test-reports/bugs/2026-08-05-add-application-no-delete-or-resume-capability.md`.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name" (Gender "Male"), status badge "PRE-SCREENED"

## Test Cases

### TC-01 — Login as Kwena (ADO #106256 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106256 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106256 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106256 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (ADO #106256 step 6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the application created on Test Case 106172 (ADO #106256 step 7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "AutoTest"
  - [x] ASSERT (BLOCKING) status badge "PRE-SCREENED" is visible

---

### TC-07 — Click "Edit Personal Details" button (ADO #106256 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Gender dropdown is now editable, and a Save button is visible

---

### TC-08 — Click on the Gender dropdown (ADO #106256 step 9)
- **Note:** confirmed in ADMINPORTAL-106533 (the other candidate) that the Gender dropdown's options are "Female" and "Not Disclosed" when "Male" is selected — expected to be the same here.
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Female" and "Not Disclosed" options are visible

---

### TC-09 — Select "Not Disclosed" (ADO #106256 step 10)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Gender dropdown now shows "Not Disclosed"

---

### TC-10 — Click on Save (ADO #106256 step 11) — ⚠️ REAL, PERSISTENT EDIT
- **Expected result:** Changes are saved successfully; Gender changes to "Not Disclosed", and the Applications index table's Gender column also updates
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + reload, Gender shows "Not Disclosed"
  - [x] ASSERT (BLOCKING) the Applications index table also shows "Not Disclosed" for this row's Gender column

---

## Teardown
- No automated teardown. TC-10 performs a real, persistent edit to the target application's Gender. This is not reversible via the UI.

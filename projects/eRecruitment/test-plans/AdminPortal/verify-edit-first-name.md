# Test Plan: ADMINPORTAL-106240 — Edit First Name

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106240 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#106240](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106240) — Edit First Name |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172 ("AutoTest CompleteFlow", currently listed as "CompleteFlow A" in the Applications table's Surname/Initials column, Status "Pre Screened") |

## Objective
> Validate that a Recruiter can edit a candidate application's First Name via the Personal Details panel's "Edit Personal Details" button, and that the change persists after Save + reload.

> **⚠️ STATEFUL/REAL EDIT — requires confirmation before running:** TC-11 clicks Save for real, changing the target application's First Name from "AutoTest" to "Test" (per ADO step 11's literal instruction). Unlike prior "clear + required field" test cases in this session, this field is **not** required-validated against an empty value the same way (per this test's own steps, the intent is to clear then repopulate with "Test", not leave it empty), so this is a genuine persistent data change requiring the same confirmation given to every other real Save in this project.
>
> This test case explicitly targets the application created while automating ADMINPORTAL-106172 (ADO step 7: "open an Application created on Test Case 106172") — this is the correct, intended candidate, not one of the stray/orphaned records documented in `test-reports/bugs/2026-08-05-add-application-no-delete-or-resume-capability.md`.

> **🐞 BUG FOUND (2026-08-05, discovered while automating ADMINPORTAL-106246):** the real Save in TC-11 **does not actually persist** for this specific application. The first run of this spec falsely reported PASSED due to a flawed assertion (`getByText('Test', {exact:false})` matches the substring "Test" inside the untouched original value "AutoTest"). A fresh page load confirms First Name is still "AutoTest". Root cause confirmed live: the "Edit Personal Details" Save handler submits a stale cached `applicantProfileJson` snapshot rather than the live edited field value — the panel never even exits edit mode after clicking Save, and zero API calls fire (confirmed via network monitoring, including force-click retries). See `test-reports/bugs/2026-08-05-edit-personal-details-save-silently-fails.md`.

## Actual Result
**FAILED** (corrected from a false PASSED — see bug note above). TC-01–10 pass; TC-11's Save click does not persist the edit for this application, which appears specific to applications created via the "Add New Application" wizard (ADMINPORTAL-106172) rather than a general regression — ADMINPORTAL-106529's equivalent edit on a normal/pre-existing candidate worked correctly.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "CompleteFlow A" (from ADMINPORTAL-106172), Status "Pre Screened"

## Test Cases

### TC-01 — Login as Kwena (ADO #106240 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106240 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106240 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106240 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (ADO #106240 step 6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the application created on Test Case 106172 (ADO #106240 step 7)
- **Note:** the Applications table row shows status "Pre Screened", but the application detail page's own badge reads **"PRE-SCREENED"** (all caps, hyphenated) — confirmed live 2026-08-05. This spec asserts on the actual page badge text.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "AutoTest"
  - [x] ASSERT (BLOCKING) status badge "PRE-SCREENED" is visible (matches ADO's expected "pre-screened" wording)

---

### TC-07 — Click "Edit Personal Details" button (ADO #106240 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the First Name field is now an editable input, and a Save button is visible

---

### TC-08 — Click inside the First Name text area (ADO #106240 step 9)
- **Assertions:**
  - [x] ASSERT (BLOCKING) First Name field is focused

---

### TC-09 — Clear the First Name field (ADO #106240 step 10)
- **Assertions:**
  - [x] ASSERT (BLOCKING) First Name field is empty

---

### TC-10 — Enter "Test" (ADO #106240 step 11)
- **Assertions:**
  - [x] ASSERT (BLOCKING) First Name field contains "Test"

---

### TC-11 — Click on Save (ADO #106240 step 12) — ⚠️ REAL, PERSISTENT EDIT
- **Expected result:** First Name should be updated and displayed after a refresh
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + reload, First Name shows "Test"

---

## Teardown
- No automated teardown. TC-11 performs a real, persistent edit to the target application's First Name. This is not reversible via the UI.

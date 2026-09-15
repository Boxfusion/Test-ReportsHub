# Test Plan: ADMINPORTAL-106246 — Verify Edit Last Name

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106246 has no `Tested By` relation). Parent: #107469. |
| ADO Test Case | [#106246](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106246) — Verify Edit Last Name |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172, First Name edited to "Test" by ADMINPORTAL-106240 — still listed as "CompleteFlow A" in the Applications table's Surname/Initials column (confirmed live: this column did not recompute after the First Name edit; the underlying record is confirmed the same via ID Number 9401155123095) |

## Objective
> Validate that a Recruiter can edit a candidate application's Last Name via the Personal Details panel's "Edit Personal Details" button, and that the change persists after Save + reload.

> **⚠️ STATEFUL/REAL EDIT — requires confirmation before running:** TC-11 clicks Save for real, changing the target application's Last Name from "CompleteFlow" to "Edit Last Name" (per ADO step 11's literal instruction).
>
> **Discrepancy note (same class as ADMINPORTAL-106529):** ADO step 10 literally says "Clear the first name", but step 9 ("Click inside the Last Name field") and step 12's expected result ("Last name should be updated... Updated Last Name is displayed") make the actual intent unambiguous — this is a Last Name edit, and step 10's wording is a copy/paste error. This spec follows the evident intent, same as #106529 did for the other candidate.
>
> This test case explicitly targets the application created on ADMINPORTAL-106172 (ADO step 7), which #106240 attempted to edit (First Name "AutoTest" → "Test"). This is the correct, intended candidate, not one of the stray/orphaned records documented in `test-reports/bugs/2026-08-05-add-application-no-delete-or-resume-capability.md`.

> **🐞 BUG FOUND (2026-08-05, revised after further investigation):** the real Save in TC-11 is **intermittent/unreliable** for this application, not a complete no-op as first suspected. Across ~5 attempts (2 official spec runs + several live investigation clicks, including force-clicks), most Save clicks fired **zero API calls** and the panel never exited edit mode — but one attempt (with a 15s observation window instead of ~3s) did eventually fire a real `POST .../ManualApplications/CreateOrUpdateApplication` (200 OK) and the edit persisted correctly on reload. This suggests either a slow/debounced click handler that needs a longer settle time than this project's usual ~2-3s waits, or a genuinely flaky event binding — not yet root-caused precisely. Separately, at some point during the flaky attempts, the application's Last Name and previously-empty Email/Mobile fields picked up unintended values ("CompleteFlow" → "CompleteFlows"; Email/Mobile populated with values never typed by this automation, resembling the logged-in operator's own contact details) — this looks like browser-autofill interference on one of the successful-but-unnoticed saves, carried forward on the final successful save since Save always resubmits the full form state. ADMINPORTAL-106240's earlier "PASSED" result for the same application was a separate false positive (a flawed substring-match assertion) — corrected in `verify-edit-first-name.md`; its First Name field was never actually confirmed fixed and remains "AutoTest". See `test-reports/bugs/2026-08-05-edit-personal-details-save-silently-fails.md` for full detail.

## Actual Result
**PASSED (on a later attempt, after initial unreliability).** TC-01–10 pass. TC-11's Save click failed silently on the first 4-5 attempts (no API call, panel stayed in edit mode) but succeeded on a retry with a longer wait — confirmed via reload that Last Name now correctly shows "Edit Last Name". Per explicit instruction, the pre-existing stray Email/Mobile values were left untouched and not investigated further as part of this test case.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "CompleteFlow T" (from ADMINPORTAL-106172/106240), status badge "PRE-SCREENED"

## Test Cases

### TC-01 — Login as Kwena (ADO #106246 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106246 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106246 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106246 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (ADO #106246 step 6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the application created on Test Case 106172 (ADO #106246 step 7)
- **Note:** status badge on the application page itself reads "PRE-SCREENED" (all caps, hyphenated) — confirmed live in ADMINPORTAL-106240; the Applications table row shows "Pre Screened" instead.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "Test"
  - [x] ASSERT (BLOCKING) status badge "PRE-SCREENED" is visible

---

### TC-07 — Click "Edit Personal Details" button (ADO #106246 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Last Name field is now an editable input, and a Save button is visible

---

### TC-08 — Click inside the Last Name text area (ADO #106246 step 9)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Last Name field is focused

---

### TC-09 — Clear the Last Name field (ADO #106246 step 10, evident intent)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Last Name field is empty

---

### TC-10 — Enter "Edit Last Name" (ADO #106246 step 11)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Last Name field contains "Edit Last Name"

---

### TC-11 — Click on Save (ADO #106246 step 12) — ⚠️ REAL, PERSISTENT EDIT
- **Expected result:** Last name should be updated and displayed after a refresh
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + reload, Last Name shows "Edit Last Name"

---

## Teardown
- No automated teardown. TC-11 performs a real, persistent edit to the target application's Last Name. This is not reversible via the UI.

# Test Plan: ADMINPORTAL-106251 — Verify Edit Email Address

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106251 has no `Tested By` relation). Parent: #107469. |
| ADO Test Case | [#106251](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106251) — Verify Edit Email Address |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172 — currently listed as "Edit Last Name" in the Applications table (First Name "AutoTest", Identity Number `8803055678089` per ADMINPORTAL-106247, Email `Reuben.mashifane@boxfusion.io` per ADMINPORTAL-106246's follow-up fix) |

## Objective
> Validate that a Recruiter can edit a candidate application's Email Address via the Personal Details panel's "Edit Personal Details" button, and that the change persists after Save + reload.

> **⚠️ STATEFUL/REAL EDIT — requires confirmation before running:** TC-11 clicks Save for real, changing the target application's Email Address from `Reuben.mashifane@boxfusion.io` to `Edit.Email@test.com` (per ADO step 11's literal instruction).
>
> **🐞 KNOWN APP BUG — Save is intermittent for this application:** confirmed across ADMINPORTAL-106240/106246/106247, the "Edit Personal Details" Save click frequently fires **zero API calls** and the panel stays in edit mode; it can need up to ~15s and occasionally a second click before the save actually goes through. This spec waits up to 15s after clicking Save and retries once if still in edit mode. See `test-reports/bugs/2026-08-05-edit-personal-details-save-silently-fails.md`.
>
> This test case explicitly targets the application created on ADMINPORTAL-106172 (ADO step 7) — this is the correct, intended candidate, not one of the stray/orphaned records documented in `test-reports/bugs/2026-08-05-add-application-no-delete-or-resume-capability.md`.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name" (Email `Reuben.mashifane@boxfusion.io`), status badge "PRE-SCREENED"

## Test Cases

### TC-01 — Login as Kwena (ADO #106251 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106251 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106251 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106251 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (ADO #106251 step 6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the application created on Test Case 106172 (ADO #106251 step 7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with Email Address "Reuben.mashifane@boxfusion.io"
  - [x] ASSERT (BLOCKING) status badge "PRE-SCREENED" is visible

---

### TC-07 — Click "Edit Personal Details" button (ADO #106251 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Email Address field is now an editable input, and a Save button is visible

---

### TC-08 — Click inside the Email Address field (ADO #106251 step 9)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Email Address field is focused

---

### TC-09 — Clear the Email Address field (ADO #106251 step 10)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Email Address field is empty

---

### TC-10 — Enter "Edit.Email@test.com" (ADO #106251 step 11)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Email Address field contains "Edit.Email@test.com"

---

### TC-11 — Click on Save (ADO #106251 step 12) — ⚠️ REAL, PERSISTENT EDIT
- **Expected result:** Email should be updated and displayed after a refresh
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + reload, Email Address shows "Edit.Email@test.com"

---

## Teardown
- No automated teardown. TC-11 performs a real, persistent edit to the target application's Email Address. This is not reversible via the UI.

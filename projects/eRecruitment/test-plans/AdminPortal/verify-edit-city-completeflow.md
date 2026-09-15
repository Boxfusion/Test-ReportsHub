# Test Plan: ADMINPORTAL-106270 — Verify Edit City

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106270 has no `Tested By` relation). Parent: #107469. |
| ADO Test Case | [#106270](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106270) — Verify Edit City |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172 — currently listed as "Edit Last Name" in the Applications table (City "Pretoria") |

## Objective
> Validate that a Recruiter can edit a candidate application's City via the Personal Details panel's "Edit Personal Details" button, and that the change persists after Save + reload, including in the Applications index table's Location (City/Town) column.

> **⚠️ STATEFUL/REAL EDIT — requires confirmation before running:** TC-10 clicks Save for real, changing the target application's City from "Pretoria" to "Edited City" (per ADO step 10's evident intent — ADO's own wording is garbled, referencing "natire of disability text area", but the field and test title make the intent unambiguous: City, same class of copy/paste error seen across this batch e.g. ADMINPORTAL-106269).
>
> **🐞 KNOWN APP BUG — Save is intermittent for this application:** confirmed across ADMINPORTAL-106240/106246/106247/106251/106255/106256/106257/106262/106268/106269, the "Edit Personal Details" Save click can fire **zero API calls** and leave the panel in edit mode; it can need up to ~15s and occasionally a second click before the save actually goes through. This spec waits up to 15s after clicking Save and retries once if still in edit mode. See `test-reports/bugs/2026-08-05-edit-personal-details-save-silently-fails.md`.
>
> This test case explicitly targets the application created on ADMINPORTAL-106172 (ADO step 7) — this is the correct, intended candidate, not one of the stray/orphaned records documented in `test-reports/bugs/2026-08-05-add-application-no-delete-or-resume-capability.md`.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name" (City "Pretoria"), status badge "PRE-SCREENED"

## Test Cases

### TC-01 — Login as Kwena (ADO #106270 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106270 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106270 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106270 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (ADO #106270 step 6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the application created on Test Case 106172 (ADO #106270 step 7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with City "Pretoria"
  - [x] ASSERT (BLOCKING) status badge "PRE-SCREENED" is visible

---

### TC-07 — Click "Edit Personal Details" button (ADO #106270 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the City field is now an editable input, and a Save button is visible

---

### TC-08 — Clear the City text area (ADO #106270 step 9)
- **Assertions:**
  - [x] ASSERT (BLOCKING) City field is empty

---

### TC-09 — Enter "Edited City" (ADO #106270 step 10)
- **Assertions:**
  - [x] ASSERT (BLOCKING) City field contains "Edited City"

---

### TC-10 — Click on Save (ADO #106270 step 11) — ⚠️ REAL, PERSISTENT EDIT
- **Expected result:** Record saves successfully; updated City is displayed, and the Applications index table's Location (City/Town) column also updates
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + reload, City shows "Edited City"
  - [x] ASSERT (BLOCKING) the Applications index table also shows "Edited City" for this row

---

## Actual Result
**FAILED — QA environment outage, not an app or test-authoring defect.** Failed identically across 4 consecutive attempts, escalating in severity: a UI element timeout, then a 45s login-page bootstrap stall, then two `page.goto` timeouts at 30s before the login page could even begin loading. A brief pause between retries made no difference. This points to the QA site being unreachable or severely degraded at the time of this run. No real Save was attempted or performed — the target application's City remains unchanged at "Pretoria". Recommend re-running once the environment's health is confirmed.

## Teardown
- No automated teardown. TC-10 performs a real, persistent edit to the target application's City. This is not reversible via the UI. (Not reached in this run — see Actual Result above.)
